// // const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
// // const UserModel = require("../UserModel");

// // async function upDateUserDetails(request, response) {
// //   try {
// //     // Step 1: Token Ko Fetch Karna
// //     const token = request.cookies.token || "";
    
// //     if (!token) {
// //       return response.status(400).json({
// //         message: "Token not found",
// //         success: false,
// //       });
// //     }

// //     // Step 2: Token Se User Fetch Karna
// //     const user = await getUserDetailsFromToken(token);
// //     if (!user || !user._id) {
// //       return response.status(400).json({
// //         message: "Invalid token or user not found",
// //         success: false,
// //       });
// //     }

// //     // Step 3: Request Body Mein Se Name Aur Profile Pic Lena
// //     const { name, profile_pic } = request.body;
// //     if (!name && !profile_pic) {
// //       return response.status(400).json({
// //         message: "No details to update",
// //         success: false,
// //       });
// //     }

// //     // Step 4: MongoDB Se User Ko Update Karna
// //     const updateResult = await UserModel.updateOne(
// //       { _id: user._id },
// //       { name, profile_pic }
// //     );
    
// //     // Agar Update Nahi Hua, Toh Error Response Dena
// //     if (updateResult.nModified === 0) {
// //       return response.status(400).json({
// //         message: "No changes made to the user",
// //         success: false,
// //       });
// //     }

// //     // Step 5: Updated User Ko Fetch Karna
// //     const updatedUser = await UserModel.findById(user._id);
// //     if (!updatedUser) {
// //       return response.status(404).json({
// //         message: "User not found after update",
// //         success: false,
// //       });
// //     }

// //     // Step 6: Success Response Dena
// //     return response.json({
// //       message: "User updated successfully",
// //       data: updatedUser,
// //       success: true,
// //     });

// //   } catch (error) {
// //     // Agar Koi Error Hai, Toh Usko Handle Karna
// //     console.error("Error: ", error);  // Debugging ke liye error print karen
// //     return response.status(500).json({
// //       message: error.message || "Something went wrong",
// //       error: true,
// //     });
// //   }
// // }

// // module.exports = upDateUserDetails;








// const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
// const UserModel = require("../UserModel");

// async function upDateUserDetails(request, response) {
//   try {
//     // Step 1: Fetch the token
//     const token = request.cookies.token || "";
    
//     if (!token) {
//       return response.status(400).json({
//         message: "Token not found",
//         success: false,
//       });
//     }

//     // Step 2: Fetch user from token
//     const user = await getUserDetailsFromToken(token);
//     if (!user || !user._id) {
//       return response.status(400).json({
//         message: "Invalid token or user not found",
//         success: false,
//       });
//     }

//     // Step 3: Get name and profile_pic from request body
//     const { name, profile_pic } = request.body;
//     if (!name && !profile_pic) {
//       return response.status(400).json({
//         message: "No details to update",
//         success: false,
//       });
//     }

//     // Step 4: Update user in MongoDB
//     const updateResult = await UserModel.updateOne(
//       { _id: user._id },
//       { $set: { name, profile_pic } }
//     );
    
//     // If no update was made, return an error response
//     if (updateResult.modifiedCount === 0) {
//       return response.status(400).json({
//         message: "No changes made to the user",
//         success: false,
//       });
//     }

//     // Step 5: Fetch the updated user
//     const updatedUser = await UserModel.findById(user._id);
//     if (!updatedUser) {
//       return response.status(404).json({
//         message: "User not found after update",
//         success: false,
//       });
//     }

//     // Step 6: Return success response
//     return response.json({
//       message: "User updated successfully",
//       data: updatedUser,
//       success: true,
//     });

//   } catch (error) {
//     // Handle any errors
//     console.error("Error in upDateUserDetails:", error);
    
//     if (error instanceof Error) {
//       return response.status(500).json({
//         message: error.message,
//         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//         success: false,
//       });
//     } else {
//       return response.status(500).json({
//         message: "An unknown error occurred",
//         success: false,
//       });
//     }
//   }
// }

// module.exports = upDateUserDetails;




const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../UserModel");

async function updateUserDetails(req, res) {
  try {
    // Step 1: Fetch the token from cookies
    const token = req.cookies.token || "";
    
    if (!token) {
      return res.status(400).json({
        message: "Token not found",
        success: false,
      });
    }

    // Step 2: Fetch user data using the token
    const user = await getUserDetailsFromToken(token);
    if (!user || !user._id) {
      return res.status(400).json({
        message: "Invalid token or user not found",
        success: false,
      });
    }

    // Step 3: Get name and profile_pic from request body
    const { name, profile_pic } = req.body;
    if (!name && !profile_pic) {
      return res.status(400).json({
        message: "No details to update",
        success: false,
      });
    }

    // Step 4: Update user information in MongoDB
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $set: { name, profile_pic } }
    );
    
    // If no update was made, return an error response
    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: "No changes made to the user",
        success: false,
      });
    }

    // Step 5: Fetch the updated user information
    const updatedUser = await UserModel.findById(user._id);
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found after update",
        success: false,
      });
    }

    // Step 6: Return success response
    return res.json({
      message: "User updated successfully",
      data: updatedUser,
      success: true,
    });

  } catch (error) {
    // Handle errors
    console.error("Error in updateUserDetails:", error);
    
    return res.status(500).json({
      message: error.message || "An unknown error occurred",
      success: false,
    });
  }
}

module.exports = updateUserDetails;

