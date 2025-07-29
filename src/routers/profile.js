const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");

const { validateProfileData } = require("../utils/validate");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (err) {
    console.log("An Error Appeared : " + err.message);
    res.send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Update not Valid");
    }

    const loggedInuser = req.user;
    
    // Convert age to number if provided
    if (req.body.age) {
      req.body.age = parseInt(req.body.age);
    }
    
    // Convert gender to lowercase for consistency
    if (req.body.gender) {
      req.body.gender = req.body.gender.toLowerCase();
    }
    
    Object.keys(req.body).forEach(
      (field) => (loggedInuser[field] = req.body[field])
    );

    await loggedInuser.save();

    res.status(200).json({
      message: `${loggedInuser.firstName}, Your profile has been updated`,
      data: loggedInuser,
    });
  } catch (err) {
    console.log("ERROR FOUND : " + err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = profileRouter;
