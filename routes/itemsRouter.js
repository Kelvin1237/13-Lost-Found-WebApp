import { Router } from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  updateItem,
  getSingleItem,
  getUserItems,
  claimItem,
} from "../controllers/itemsController.js";
import {
  validateIdParam,
  validateItemInput,
} from "../middleware/validationMiddleware.js";
const router = Router();
import upload from "../middleware/multerMiddleware.js";

router
  .route("/")
  .get(getAllItems)
  .post(upload.single("image"), validateItemInput, createItem);

router.route("/my-items").get(getUserItems);

router.route("/claim/:id").patch(validateIdParam, claimItem);

router
  .route("/:id")
  .get(validateIdParam, getSingleItem)
  .patch(upload.single("image"), validateIdParam, validateItemInput, updateItem)
  .delete(validateIdParam, deleteItem);

export default router;
