const express = require("express");
const userRouter = express.Router();
const connectionRequestModel = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    // Lets find the all the connections of user

    const user = req.user;

    const connections = await connectionRequestModel
      .find({
        $or: [
          { fromUserId: user._id, status: "accepted" },
          {
            toUserId: user._id,
            status: "accepted",
          },
        ],
      })
      .populate("fromUserId toUserId", [
        "firstName",
        "lastName",
        "status",
        "skills",
        "about",
        "age",
        "gender",
      ]);

    if (!connections) {
      return res.status(400).json({ message: "Empty" });
    }

    res.status(200).json({ message: connections });
  } catch (err) {
    res.status(400).json({ message: "ERROR FOUND : " + err.message });
  }
});

module.exports = userRouter;
