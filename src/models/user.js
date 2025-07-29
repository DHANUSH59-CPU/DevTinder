const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      minlength: 6,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong password");
        }
      },
    },
    gender: {
      type: String,
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
      default: [],
    },
    age: {
      type: Number,
    },
    about: {
      type: String,
      default: "This is default",
    },
    status: {
      type: String,
      enum: ["active", "deactivated", "banned"],
      default: "active",
    },
    photoURL: {
      type: String,
      default: null,
      validate(value) {
        // Only validate if value is provided (not null/undefined)
        if (value) {
          // Accept both standard URLs and base64 data URLs
          const isValidURL = validator.isURL(value);
          const isValidDataURL = value.startsWith('data:image/') && value.includes('base64,');
          
          if (!isValidURL && !isValidDataURL) {
            throw new Error("Please provide a valid photo URL or image data");
          }
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// Creating index
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ skills: 1 });

// ✅ Add methods BEFORE compiling the model
userSchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id }, "Dev@Tinder$01", {
    expiresIn: "3d",
  });
};

userSchema.methods.validatePassword = async function (passwordByUser) {
  return await bcrypt.compare(passwordByUser, this.password);
};

// ✅ Compile the model after defining everything
const User = mongoose.model("User", userSchema);

module.exports = User;
