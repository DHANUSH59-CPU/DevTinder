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
    Object.keys(req.body).forEach(
      (field) => (loggedInuser[field] = req.body[field])
    );

    await loggedInuser.save();

    res.status(200).json({
      message: `${loggedInuser.firstName}, Your profile has been updated`,
    });
  } catch (err) {
    console.log("ERROR FOUND : " + err.message);
  }
});

module.exports = profileRouter;
