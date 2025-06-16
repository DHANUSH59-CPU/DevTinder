const express = require("express");
const app = express();
const port = 3000;

const { connectDB } = require("./config/database");

const User = require("./models/user");

app.use(express.json());
app.post("/adduser", async (req, res) => {
  const userObj = req.body;
  // creating a new instance of User Model
  try {
    const user = new User(userObj);

    await user.save();
    res.send("Connected suceefully");
  } catch (err) {
    console.error(err);
    res.status(400).send("Not able to create");
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

app.patch("/user", async (req, res) => {
  try {
    const { userId } = req.body;
    const data = req.body;
    await User.findByIdAndUpdate({ _id: userId }, data); // there is 3rd parameter called options
    res.send("Upadated successfully");
    cosnole.log(data);
  } catch (err) {
    console.error(err.message);
    res.send(err);
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
