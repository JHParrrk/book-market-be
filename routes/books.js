const express = require("express");
const router = express.Router();
const bookController = require("../modules/books/book.controller");
const reviewController = require("../modules/reviews/review.controller");
const {
  authenticateJWT,
  authenticateIfPresent,
} = require("../middleware/authorize.middleware");

// [신규] 도서 검색 (검색어와 카테고리를 기반으로 도서 목록 조회)
router.get("/search", bookController.searchBooks);

// 도서 목록 조회 (전체 도서 목록)
router.get("/", bookController.searchBooks); // 기존 getBooks를 searchBooks로 대체

// 도서 상세 조회
router.get("/:bookId", authenticateIfPresent, bookController.getBookById);

// 도서 좋아요 추가/취소
router.post("/:bookId/like", authenticateJWT, bookController.toggleBookLike);

// [유지] 특정 도서의 리뷰 목록 조회: GET /books/:bookId/reviews
router.get(
  "/:bookId/reviews",
  authenticateIfPresent,
  reviewController.getReviewsByBook
);

// [유지] 특정 도서에 리뷰 작성: POST /books/:bookId/reviews
router.post("/:bookId/reviews", authenticateJWT, reviewController.addReview);

// [신규] 특정 도서의 특정 리뷰 수정: PUT /books/:bookId/reviews/:reviewId
router.put(
  "/:bookId/reviews/:reviewId",
  authenticateJWT,
  reviewController.updateReview
);

// [신규] 특정 도서의 특정 리뷰 삭제: DELETE /books/:bookId/reviews/:reviewId
router.delete(
  "/:bookId/reviews/:reviewId",
  authenticateJWT,
  reviewController.deleteReview
);

// [신규] 특정 도서의 특정 리뷰 '좋아요': POST /books/:bookId/reviews/:reviewId/like
router.post(
  "/:bookId/reviews/:reviewId/like",
  authenticateJWT,
  reviewController.toggleReviewLike
);

module.exports = router;
