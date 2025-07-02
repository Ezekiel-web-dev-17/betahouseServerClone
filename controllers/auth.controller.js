import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword || !confirmPassword) {
      const err = new Error("Password is NOT confirmed.");
      err.statusCode = 409;
      throw err;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists.");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create(
      [{ firstname, lastname, email, password: hashedPassword }],
      { session }
    );

    const token = await jwt.sign({ userId: user[0].id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User Created successfully.",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    session.abortTransaction();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found!" });
    }

    const hashPassword = await bcrypt.compare(password, user.password);

    if (!hashPassword) {
      const error = new Error("Invalid Password");
      res.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "User signed in successfully",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};
