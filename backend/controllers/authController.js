const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const store = require("../data/store");

const signToken = (id) =>
  jwt.sign({ user: { id } }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "7d",
  });

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = store.isDatabaseConnected()
      ? await User.findOne({ email: normalizedEmail })
      : await store.users.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = store.isDatabaseConnected()
      ? await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        })
      : await store.users.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });

    return res.status(201).json({
      message: "User registered successfully.",
      token: signToken(createdUser._id.toString()),
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Unable to register user.", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const foundUser = store.isDatabaseConnected()
      ? await User.findOne({ email: normalizedEmail })
      : await store.users.findByEmail(normalizedEmail);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatched = await bcrypt.compare(password, foundUser.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    return res.json({
      token: signToken(foundUser._id.toString()),
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Unable to log in.", error: err.message });
  }
};
