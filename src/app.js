const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
// NEVER TRUST req.body

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");
const { connectDB } = require("./config/database");
const User = require("./models/user");

app.use(cors({ origin: ["http://localhost:3001", "http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: '10mb' })); // Increased payload limit for image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/userConnectionRoute");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// delete method -> findbyIdanddelete

// app.delete("/user", async (req, res) => {
//   try {
//     const { emailId } = req.body;
//     const user = await User.findByIdAndDelete(emailId);
//     res.send("User Deleted successfully !");
//   } catch (err) {
//     console.error(err.message);
//     res.send(err);
//   }
// });

// patch method -> Update data of user

// Added Sanitizing and Validations at Api level

// app.patch("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const ALLOWED_UPDATE = [
//       "password",
//       "firstName",
//       "lastName",
//       "dateOfBirth",
//       "phone",
//       "skills",
//     ];

//     const data = req.body;

//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATE.includes(k)
//     );

//     if (!isUpdateAllowed) {
//       throw new Error("Update is not possible");
//     }

//     if (data?.skills.length > 10) {
//       throw new Error("You can add only 10 skills");
//     }

//     await User.findByIdAndUpdate({ _id: userId }, data, {
//       runValidators: true,
//     }); // there is 3rd parameter called options (runValidators used to run validate after the update also)
//     res.send("Upadated successfully");
//     cosnole.log(data);
//   } catch (err) {
//     console.error(err.message);
//     res.send(err.message);
//   }
// });

connectDB()
  .then(() => {
    console.log("Database is connected");
    app.listen(port, () => {
      console.log(`server is listening on port ${port}...`);
    });
  })
  .catch((err) => console.log(err));
