const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter a valid mail");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // You can increase it to 8 or more if needed
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong password");
        }
      },
    },
    gender: {
      type: String, // this is field of schema, you can read docs for  it
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    skills: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
