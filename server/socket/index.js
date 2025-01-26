
const express = require("express")
const { Server } = require("socket.io")
const  http  = require("http")
const getUserDetailsFromToken = require("../models/helpers/getUserDetailsFromToken")
const UserModel = require("../models/UserModel")
const { ConversationModel, MessageModel } = require("../models/ConversationModel")
const getConversation = require("../models/helpers/getConversation")
const { send } = require("process")

const app = express()

/**socket connection**/
const server = http.createServer(app)
const io = new Server(server,{
  cors : {
    origin :process.env.FRONTEND_URL,
    credentials : true
  }
})

// online user
const onlineUser = new Set()

io.on("connection",async(Socket)=>{
  console.log("connect User", Socket.id)

  const token = Socket.handshake.auth.token

  // currunt user details
  const user = await getUserDetailsFromToken(token)


  // create a room

  Socket.join(user?._id?.toString())
  onlineUser.add(user?._id?.toString())

  io.emit("onlineUser",Array.from(onlineUser))

  Socket.on("message-page",async(userId)=>{
    console.log("userId",userId)
    const userDetails = await UserModel.findById(userId).select("-password")

    const payload = {
      _id : userDetails?._id,
      name : userDetails?.name,
      email : userDetails?.email,
      profile_pic : userDetails?.profile_pic,
      online : onlineUser.has(userId),
    }


    Socket.emit("message-user",payload)

     //get previous message
     const getConversationMessage =await ConversationModel.findOne({
      "$or" : [
        {sender : user?._id, receiver : userId},
        {sender : userId, receiver : user?._id}
      ]
    }).populate("message").sort({ updateAt : -1})


   
  Socket.emit("message",getConversationMessage?.message || [])
  })

  //new message 
  Socket.on("new message",async(data)=>{

    // check conversation is available both user
    let consversation = await ConversationModel.findOne({
      "$or" : [
        {sender : data?.sender, receiver : data?.receiver},
        {sender : data?.receiver, receiver : data?.sender}
      ]
    })
    // if conversation is not available
    if(!consversation){
      const createConversation = await ConversationModel({
        sender : data?.sender,
        receiver : data?.receiver
      })
      consversation = await createConversation.save()
    }

    const message = await MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId : data?.msgByUserId
    })
    const saveMessage = await message.save()
    const updateConversation = await ConversationModel.updateOne({ _id : consversation?._id},{
      "$push" : {message : saveMessage?._id}
    })

    const getConversationMessage =await ConversationModel.findOne({
      "$or" : [
        {sender : data?.sender, receiver : data?.receiver},
        {sender : data?.receiver, receiver : data?.sender}
      ]
    }).populate("message").sort({ updateAt : -1})


    io.to(data?.sender).emit("message",getConversationMessage?.message || [])
    io.to(data?.receiver).emit("message",getConversationMessage?.message || [])

    //send conversation
    const conversationSender = await getConversation(data?.sender)
    const conversationReceiver = await getConversation(data?.receiver)

    io.to(data?.sender).emit("conversation",conversationSender)
    io.to(data?.receiver).emit("conversation",conversationReceiver)
  })

  //delete message
  Socket.on("delete message", async (data) => {
    const {msgId, userId} = data
    console.log("data=>", msgId, userId)

    const result = await MessageModel.findByIdAndDelete(msgId)
    
  })

  //sidebar
  Socket.on("sidebar",async(currentUserId)=>{
    console.log("current user",currentUserId)

    const currentUserConversation = await ConversationModel.find({
      "$or" : [
        { sender : currentUserId},
        { receiver : currentUserId}
      ]
    }).sort({updateAt : -1}).populate("message").populate("sender").populate("receiver")

    console.log("currentUserConversation",currentUserConversation)

    const conversation = currentUserConversation.map((conv)=>{
      countUnseenMsg = conv.message.reduce((preve, curr) => preve + (curr.seen ? 0 : 1),0)
      return{
        _id : conv?._id,
        sender : conv?.sender,
        receiver : conv?.receiver,
        unseenMsg : countUnseenMsg,
        lastMsg : conv.message[conv?.message?.length - 1 ]
      }
    })

    Socket.emit("conversation",conversation)

  })

  Socket.on("seen",async(msgByUserId)=>{
    
    let consversation = await ConversationModel.findOne({
      "$or" : [
        {sender : user?._id, receiver : msgByUserId},
        {sender : msgByUserId, receiver : user?._id}
      ]
    })

    const conversationMessageId = consversation?.message || []

    const updateMessage = await MessageModel.updateMany(
      {_id : { "$in" : conversationMessageId}, msgByUserId : msgByUserId},
      {"$set" : {seen : true}}
    )


     //send conversation
     const conversationSender = await getConversation(user?._id?.toString())
     const conversationReceiver = await getConversation(msgByUserId)
 
     io.to(user?._id?.toString()).emit("conversation",conversationSender)
     io.to(msgByUserId).emit("conversation",conversationReceiver)
  })

  /**disconect**/
  Socket.on("disconnect",()=>{
    onlineUser.delete(user?._id?.toString())
  console.log("disconnect User", Socket.id)

  })

})

module.exports = {
  app,
  server
}

