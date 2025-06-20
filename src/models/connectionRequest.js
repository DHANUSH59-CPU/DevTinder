const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("../models/user");

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Creating index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// pre save
connectionRequestSchema.pre("save", function (next) {
  // checking if fromUserId is same as toUserId

  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You Could not send request to yourself");
  }

  next();
});

const connectionRequestModel = mongoose.model(
  "connectionRequestModel",
  connectionRequestSchema
);

module.exports = connectionRequestModel;
