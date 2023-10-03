import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER*/
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, occupation } =
      req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // 201 means something is created
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 means something is wrong with the server
    console.log("auth.js line 29");
  }
};

/* LOGIN USER */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist." }); // 400 means user not found

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // create a token with the user id
    delete user.password; // delete the password from the user object
    res.status(200).json({ user, token }); // 200 means everything is okay
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 means something is wrong with the server
  }
};
