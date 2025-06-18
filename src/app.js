const express = require("express");
const app = express();
const port = 3000;

// NEVER TRUST req.body

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");

const { connectDB } = require("./config/database");

const User = require("./models/user");
const { validateSignUp, validateLogin } = require("./utils/validate");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const userObj = req.body;
  // creating a new instance of User Model
  try {
    // before going further 1st we will validate req.body
    validateSignUp(req);
    const { firstName, lastName, email, password } = req.body;

    // Encrypt the password
    //We need to download bcrypt for it
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await user.save();
    res.send("Connected suceefully");
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Error : " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    validateLogin(req);

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const validpassword = await bcrypt.compare(password, user.password);

    if (validpassword) {
      // Lets generate jwt token
      const token = await jwt.sign({ _id: user._id }, "Dev@Tinder$01");
      // Lets wrap it inside the cookie
      // console.log(token);
      res.cookie("token", token);
    }
    if (!validpassword) {
      throw new Error("Password Not valid");
    } else {
      res.send("Login successfull");
    }
  } catch (err) {
    console.log("An Error Appeared : " + err.message);
    res.send("ERROR : " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    console.log("An Error Appeared : " + err.message);
    res.send("ERROR : " + err.message);
  }
});

// search user by username or email

app.get("/getuser", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log("There is no user with that email");
    }
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// feed api - to get data of the all users

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      console.log("The data base is empty");
      res.status(500).send("sorry there is no data in database");
    }

    res.send(users);
  } catch (err) {
    console.error(err.message);
  }
});

// delete method -> findbyIdanddelete
app.delete("/user", async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findByIdAndDelete(emailId);
    res.send("User Deleted successfully !");
  } catch (err) {
    console.error(err.message);
    res.send(err);
  }
});

// patch method -> Update data of user

// Added Sanitizing and Validations at Api level

app.patch("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ALLOWED_UPDATE = [
      "password",
      "firstName",
      "lastName",
      "dateOfBirth",
      "phone",
      "skills",
    ];

    const data = req.body;

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATE.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update is not possible");
    }

    if (data?.skills.length > 10) {
      throw new Error("You can add only 10 skills");
    }

    await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
    }); // there is 3rd parameter called options (runValidators used to run validate after the update also)
    res.send("Upadated successfully");
    cosnole.log(data);
  } catch (err) {
    console.error(err.message);
    res.send(err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database is connected");
    app.listen(port, () => {
      console.log("server is listening on port 3000...");
    });
  })
  .catch((err) => console.log(err));
