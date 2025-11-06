// book.controller.js

const bookService = require("./book.service");
const safeParseInt = require("../../utils/safeParseInt");

/* 도서 검색 (메인 페이지 등) */
exports.searchBooks = async (req, res, next) => {
  try {
    const { category_id, keyword } = req.query;
    const page = safeParseInt(req.query.page, 1);
    const limit = safeParseInt(req.query.limit, 8);

    // 이제 이 함수는 { books, pagination } 객체를 정상적으로 반환합니다.
    const { books, pagination } = await bookService.searchBooks({
      category_id,
      keyword,
      page,
      limit,
    });
    // 클라이언트에 도서 목록과 페이지네이션 정보를 함께 응답합니다.
    res.status(200).json({ books, pagination });
  } catch (err) {
    next(err);
  }
};

// [수정] 신간 도서 조회
exports.getNewBooks = async (req, res, next) => {
  try {
    const { category_id } = req.query;
    const page = safeParseInt(req.query.page, 1);
    const limit = safeParseInt(req.query.limit, 4);

    // 이제 이 함수는 { books, pagination } 객체를 반환합니다.
    const { books, pagination } = await bookService.getNewBooks({
      category_id,
      page,
      limit,
    });
    // 클라이언트에 도서 목록과 페이지네이션 정보를 함께 응답합니다.
    res.status(200).json({ books, pagination });
  } catch (err) {
    next(err);
  }
};

// 도서 상세 조회
exports.getBookById = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user ? req.user.id : null;
    const book = await bookService.getBookById(bookId, userId);
    res.status(200).json(book);
  } catch (err) {
    next(err);
  }
};

// 도서 '좋아요' 추가/취소
exports.toggleBookLike = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    const result = await bookService.toggleBookLike(bookId, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
