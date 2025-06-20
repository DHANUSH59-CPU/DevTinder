const express = require("express");
const requestRouter = express.Router();
const connectionRequestModel = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");
const mongoose = require("mongoose");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = user._id;
      const { status, toUserId } = req.params;

      //! Checking if toUserId exist in user database

      if (mongoose.Types.ObjectId.isValid(toUserId)) {
        const istoUserExits = await User.findById(toUserId);
        if (!istoUserExits) {
          res.status(400).json({ error: "Invalid User Id" });
        }
      } else {
        res.status(400).json({ error: "Invalid User Id" });
      }

      //! check if toUserId === fromUserId
      if (fromUserId === toUserId) {
        return res
          .status(400)
          .json({ error: "You Could not send request to yourself" });
      }

      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: `Invalid Status type ${status}` });
      }

      //! checking if there is existing connectionRequest

      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ error: "Connection request already Exists" });
      }

      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      if (status === "interested") {
        res.status(200).json({ message: "Connection request Send" });
      } else if (status === "ignored") {
        res.status(200).json({ message: "User ignored" });
      } else {
        res.status(400).json({ error: "Invalid request type" });
      }
    } catch (err) {
      console.log("ERROR FOUND : " + err.message);
      res.status(401).send("ERROR FOUND : " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, requestUserId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(requestUserId)) {
        return res.status(400).send("Invalid Request User");
      }

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          error: `Invalid Status Type ${status}`,
        });
      }

      //! checking if there is connectionRequest with status interested

      const connectionRequest = await connectionRequestModel.findOne({
        fromUserId: requestUserId,
        toUserId: user._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(400).json({
          error: "Invalid connection request",
        });
      }

      connectionRequest.status = status;

      await connectionRequest.save();

      if (status === "accepted") {
        res.status(200).json({ message: "Connection request accepted" });
      } else if (status === "rejected") {
        res.status(200).json({ message: "Connection request rejected" });
      } else {
        res.status(400).json({ error: "Invalid request type" });
      }
    } catch (err) {
      res.status(400).send("ERROR FOUND : " + err.message);
    }
  }
);

module.exports = requestRouter;
