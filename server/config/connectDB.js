const mongoose = require ("mongoose")

async function conncetDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const connection = mongoose.connection

    connection.on("connected", ()=>{
      console.log("connect to DB")
    })

    connection.on("error",(error)=>{
      console.log("something is wrong in mongodb",error)
    })
  } catch (error) {
    console.log("something is wrong", error)
  } 
}

module.exports = conncetDB