import { Router } from "express";
import { getCurrentUser, updateUser } from "../controllers/userController.js";
import { validateUpdateUserInput } from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
const router = Router();

router.route("/current-user").get(getCurrentUser);
router
  .route("/update-user")
  .patch(upload.single("avatar"), validateUpdateUserInput, updateUser);

export default router;
