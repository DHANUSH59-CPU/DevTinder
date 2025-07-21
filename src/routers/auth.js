const express = require("express");
const User = require("../models/user");
const authRouter = express.Router();
const { validateSignUp, validateLogin } = require("../utils/validate");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const app = express();
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

authRouter.post("/signup", async (req, res) => {
  const userObj = req.body;
  // creating a new instance of User Model
  try {
    // before going further 1st we will validate req.body
    validateSignUp(req);
    const {
      firstName,
      lastName,
      email,
      password,
      photoURL,
      skills,
      gender,
      age,
      phone,
      about,
      dateOfBirth,
    } = req.body;

    // Encrypt the password
    //We need to download bcrypt for it
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      photoURL,
      skills,
      gender,
      age,
      phone,
      about,
      dateOfBirth,
    });

    await user.save();
    res.send("Connected suceefully");
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Error : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    validateLogin(req);

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const validpassword = await user.validatePassword(password);

    if (validpassword) {
      // Lets generate jwt token
      // JWT token created at user model
      const token = await user.getJWT();
      // Lets wrap it inside the cookie
      // console.log(token);
      res.cookie("token", token);
    }
    if (!validpassword) {
      throw new Error("Password Not valid");
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    console.log("An Error Appeared : " + err.message);
    res.status(401).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Logout succesfully");
});

authRouter.patch("/changePassword", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "Please login again" });
    }
    const { password, newPassword } = req.body;

    if (validator.isStrongPassword(newPassword)) {
      const isPasswordValid = await user.validatePassword(password);
      if (isPasswordValid) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        console.log(passwordHash);
        user.password = passwordHash;
        user.save();
        res.status(200).json({ message: "Password Has Been changed" });
      } else {
        throw new Error("Password is incorrect");
      }
    } else {
      throw new Error("Password is not strong");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = authRouter;
