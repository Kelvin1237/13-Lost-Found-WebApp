import { body, param, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: errorMessages });
      }
      next();
    },
  ];
};

export const validateItemInput = withValidationErrors([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ max: 100 })
    .withMessage("Item name must not exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["lost", "found"])
    .withMessage("Category must be either lost or found"),

  // lastSeenLocation - ONLY required for lost items
  body("lastSeenLocation")
    .if(body("category").equals("lost"))
    .trim()
    .notEmpty()
    .withMessage("Last seen location is required for lost items"),

  // foundLocation - ONLY required for found items
  body("foundLocation")
    .if(body("category").equals("found"))
    .trim()
    .notEmpty()
    .withMessage("Found location is required for found items"),
]);

export const validateIdParam = withValidationErrors([
  param("id").custom((value) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) {
      throw new Error("invalid mongodb id");
    }
    return true;
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body("fullName").trim().notEmpty().withMessage("full name is required"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage(
      "username must be 3-20 characters long and contain only letters, numbers, and underscores",
    ),

  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.",
    ),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("phone number is required")
    .isMobilePhone("en-GH")
    .withMessage("invalid phone number"),

  body("campusResidence")
    .trim()
    .notEmpty()
    .withMessage("campus residence is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage(
      "username must be 3-20 characters long and contain only letters, numbers, and underscores",
    ),

  body("password").notEmpty().withMessage("password is required"),
]);

export const validateUpdateUserInput = withValidationErrors([
  body("fullName").trim().notEmpty().withMessage("full name is required"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage(
      "username must be 3-20 characters long and contain only letters, numbers, and underscores",
    ),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("phone number is required")
    .isMobilePhone("en-GH")
    .withMessage("invalid phone number"),

    body("campusResidence")
    .trim()
    .notEmpty()
    .withMessage("campus residence is required"),
]);
