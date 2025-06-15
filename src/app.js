const express = require("express");
const app = express();
const port = 3000;

app.use(
  "/user",
  (req, res, next) => {
    console.log(req.query);
    //   res.send("hello");
    next();
  },
  (req, res, next) => {
    res.send("This is 2nd habdlers");
  }
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("server is listening on port 3000...");
});
