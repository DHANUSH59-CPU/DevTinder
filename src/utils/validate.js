const validator = require("validator");
const jwt = require("jsonwebtoken");

const validateSignUp = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName) {
    throw new Error("Enter a firstName");
  } else if (!lastName) {
    throw new Error("Enter a lastName");
  } else if (!email) {
    throw new Error("Enter a email");
  } else if (!password) {
    throw new Error("Enter the password section");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter a valid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
};

// validation of login data

const validateLogin = (req) => {
  const { email, password } = req.body;

  if (!email) {
    throw new Error("Enter the email section");
  } else if (!password) {
    throw new Error("Enter the password section");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter the correct emailId");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter tha valid passwrod");
  }
};

// Validate the token here
const validateToken = async (token) => {
  const decodedToken = await jwt.verify(token, "Dev@Tinder$01");
  return decodedToken;
};

module.exports = { validateSignUp, validateLogin, validateToken };
