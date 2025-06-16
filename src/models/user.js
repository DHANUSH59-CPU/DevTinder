const mongoose = require("mongoose");

const { Schema } = mongoose;

const Userschema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  gender: {
    type: String,
  },
  age: {
    type: Number,
  },
});

const User = mongoose.model("user", Userschema);
module.exports = User;
