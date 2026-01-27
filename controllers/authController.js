import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  const { username } = req.body;

  const userAlreadyExists = await User.findOne({ username });

  if (userAlreadyExists) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "username already exists" });
  }

  const user = await User.create(req.body);

  res.status(StatusCodes.CREATED).json({ msg: "user created" });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "invalid credentials" });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "invalid credentials" });
  }

  const payload = { userId: user._id, role: user.role };

  const token = createJWT(payload);

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.OK).json({ msg: "user logged in" });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};
