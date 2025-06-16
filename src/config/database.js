const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://DevTinder:bMgYVADHUNglJd3f@cluster0.qoxgbqq.mongodb.net/DevTinder"
  );
};

module.exports = { connectDB };
