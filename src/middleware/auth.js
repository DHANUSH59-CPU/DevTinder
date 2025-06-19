const { validateToken } = require("../utils/validate");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;

    if (!token) {
      throw new Error("Token is Invalid!!");
    }

    const { _id } = await validateToken(token); // adding await was very important here
    // console.log(_id);

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("No user found");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("ERROR FOUND :" + err.message);
    res.status(401).send("ERROR FOUND :" + err.message);
  }
};

module.exports = { userAuth };
