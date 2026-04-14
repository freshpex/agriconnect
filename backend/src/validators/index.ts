import { body } from "express-validator";

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{7,14}$/)
    .withMessage("Invalid phone number format (use E.164 e.g. +234...)"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["farmer", "buyer"])
    .withMessage("Role must be farmer or buyer"),
];

export const loginRules = [
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const kycMatchRules = [
  body("nationalId").trim().notEmpty().withMessage("National ID is required"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("dateOfBirth")
    .trim()
    .notEmpty()
    .withMessage("Date of birth is required (YYYY-MM-DD)"),
];

export const createListingRules = [
  body("cropName").trim().notEmpty().withMessage("Crop name is required"),
  body("category")
    .optional()
    .isIn([
      "grains",
      "vegetables",
      "fruits",
      "tubers",
      "legumes",
      "spices",
      "cash-crops",
      "other",
    ]),
  body("quantity")
    .isFloat({ min: 0.01 })
    .withMessage("Quantity must be greater than 0"),
  body("unit").trim().notEmpty().withMessage("Unit is required"),
  body("pricePerUnit")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than 0"),
  body("currency").optional().isString(),
  body("description").optional().isString().isLength({ max: 500 }),
  body("latitude").optional().isFloat({ min: -90, max: 90 }),
  body("longitude").optional().isFloat({ min: -180, max: 180 }),
  body("farmAddress").optional().isString(),
  body("harvestDate").optional().isISO8601(),
];

export const updateListingRules = [
  body("cropName").optional().trim().notEmpty(),
  body("category")
    .optional()
    .isIn([
      "grains",
      "vegetables",
      "fruits",
      "tubers",
      "legumes",
      "spices",
      "cash-crops",
      "other",
    ]),
  body("quantity").optional().isFloat({ min: 0.01 }),
  body("unit").optional().trim().notEmpty(),
  body("pricePerUnit").optional().isFloat({ min: 0.01 }),
  body("description").optional().isString().isLength({ max: 500 }),
  body("active").optional().isBoolean(),
];

export const createOrderRules = [
  body("listingId").notEmpty().withMessage("Listing ID is required"),
  body("quantity")
    .isFloat({ min: 0.01 })
    .withMessage("Quantity must be greater than 0"),
  body("deliveryAddress").optional().isString(),
  body("notes").optional().isString().isLength({ max: 300 }),
];

export const updateOrderStatusRules = [
  body("status")
    .isIn(["confirmed", "in-transit", "delivered", "cancelled"])
    .withMessage("Invalid status"),
];

export const verifyLocationRules = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("radius")
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage("Radius must be between 100 and 100000 meters"),
];
