const express = require("express");
const registerUser = require("../models/controller/registerUser");
const checkEmail = require("../models/controller/checkEmail");
const checkPassword = require("../models/controller/checkPassword");
const userDetails = require("../models/controller/userDetails");
const logout = require("../models/controller/logout");
const upDateUserDetails = require("../models/controller/upDateUserDetails");
const searchUser = require("../models/controller/searchUser");

const router = express.Router();

// create user api
router.post("/register", registerUser);
//check user email
router.post("/email", checkEmail);
//check user password
router.post("/password", checkPassword);
//login user details
router.get("/user-details", userDetails);
// logout user
router.get("/logout", logout);
// update user details
router.post("/update-user", upDateUserDetails);
//search user
router.post("/search-user",searchUser)

module.exports = router;
