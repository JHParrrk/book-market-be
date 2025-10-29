const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const fakerController = require("../modules/dev/fakers/faker.controller");
const { authenticateJWT } = require("../middleware/authorize.middleware");
const { authorizeAdmin } = require("../middleware/authorizeAdmin.middleware");
const validate = require("../middleware/validator.middleware");

// 가짜 사용자 생성 (관리자 전용)
// POST /fakers/users
// Body: { count: number } 또는 Query: ?count=number
router.post(
  "/users",
  authenticateJWT,
  authorizeAdmin,
  [
    body("count")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("count는 1에서 1000 사이의 정수여야 합니다."),
    query("count")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("count는 1에서 1000 사이의 정수여야 합니다."),
    validate,
  ],
  fakerController.generateFakeUsers
);

module.exports = router;
