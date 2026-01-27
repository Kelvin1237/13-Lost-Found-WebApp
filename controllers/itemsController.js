import { StatusCodes } from "http-status-codes";
import Item from "../models/itemsModel.js";
import cloudinary from "cloudinary";
import { formatImage } from "../middleware/multerMiddleware.js";

export const getAllItems = async (req, res) => {
  const { search, sort, category } = req.query;

  const queryObject = {};

  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "all") {
    queryObject.category = category;
  }

  const sortOptions = {
    latest: "-createdAt",
    oldest: "createdAt",
    "a-z": "name",
    "z-a": "-name",
  };

  const sortKey = sortOptions[sort] || sortOptions.latest;

  // pagination

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const items = await Item.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalItems = await Item.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalItems / limit);

  res.status(StatusCodes.OK).json({
    items,
    totalItems,
    currentPage: page,
    numOfPages,
  });
};

export const getUserItems = async (req, res) => {
  const userItems = await Item.find({ createdBy: req.user.userId }).sort(
    "-createdAt",
  );

  if (userItems.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "No items found for this user" });
  }

  res.status(StatusCodes.OK).json({ userItems });
};

export const createItem = async (req, res) => {
  req.body.createdBy = req.user.userId;

  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file, {
      use_filename: true,
      folder: "lost-found-item-images",
    });
    // console.log(response)
    req.body.image = response.secure_url;
    req.body.imagePublicId = response.public_id;
  }

  const item = await Item.create(req.body);

  res.status(StatusCodes.CREATED).json({ item });
};

export const getSingleItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id);

  if (!item) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "Item not found" });
  }

  res.status(StatusCodes.OK).json({ item });
};

export const updateItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findOne({
    _id: id,
    createdBy: req.user.userId,
  });

  if (!item) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: "Item not found or you are not authorized",
    });
  }

  const newItem = { ...req.body };

  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file, {
      use_filename: true,
      folder: "lost-found-item-images",
    });

    newItem.image = response.secure_url;
    newItem.imagePublicId = response.public_id;

    if (req.file && item.imagePublicId) {
      await cloudinary.v2.uploader.destroy(item.imagePublicId);
    }
  }

  const updatedItem = await Item.findByIdAndUpdate(id, newItem, {
    new: true,
    runValidators: true,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: "Item updated successfully", item: updatedItem });
};

export const deleteItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findByIdAndDelete(id);

  if (!item) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No job with id ${id}` });
  }

  res.status(StatusCodes.OK).json({ msg: "job deleted successfully", item });
};

export const claimItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id);

  if (!item) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: "Item not found",
    });
  }

  // Only FOUND items can be claimed
  if (item.category !== "found") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Only found items can be claimed",
    });
  }

  // Only the creator can mark as claimed
  if (item.createdBy.toString() !== req.user.userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "You are not allowed to claim this item",
    });
  }

  // Prevent double claiming
  if (item.claimed) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Item has already been claimed",
    });
  }

  item.claimed = true;
  await item.save();

  res.status(StatusCodes.OK).json({
    msg: "Item marked as claimed successfully",
    item,
  });
};
