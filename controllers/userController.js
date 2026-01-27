import User from "../models/userModel.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "cloudinary";
import { formatImage } from "../middleware/multerMiddleware.js";

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  const userWithoutPassword = user.toJSON();

  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
};

export const updateUser = async (req, res) => {
  // console.log(req.file);
  const newUser = { ...req.body };
  delete newUser.password;

  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file, {
      use_filename: true,
      folder: "lost-found-user-images",
    });
    // console.log(response)
    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }

  const user = await User.findOne({ _id: req.user.userId });

  if (req.file && user.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(user.avatarPublicId);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ msg: "user updated successfully" });
};