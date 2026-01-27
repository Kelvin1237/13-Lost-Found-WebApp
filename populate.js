import { readFile } from "fs/promises";
import { connectDB } from "./db/connect.js";
import dotenv from "dotenv";
dotenv.config();

import Item from "./models/itemsModel.js";
import User from "./models/userModel.js";
try {
  await connectDB(process.env.MONGO_URL);
  // const user = await User.findOne({ email: 'kelvin@gmail.com' });
  const user = await User.findOne({ username: "kelvin" });

  const jsonItems = JSON.parse(
    await readFile(new URL("./utils/mockItems.json", import.meta.url))
  );
  const items = jsonItems.map((item) => {
    return { ...item, createdBy: user._id };
  });
  await Item.deleteMany({ createdBy: user._id });
  await Item.create(items);
  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}