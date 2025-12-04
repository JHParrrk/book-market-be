const bookRepository = require("./book.repository.js");
const { NOT_FOUND } = require("../../constants/errors");
const { CustomError } = require("../../utils/errorHandler.util");

// [수정] 도서 검색 로직: 페이지네이션 정보까지 생성하여 반환
exports.searchBooks = async (filters) => {
  const { page, limit } = filters;

  // 1. 도서 목록과 전체 개수를 동시에 조회 (성능 최적화)
  const [{ books }, totalCount] = await Promise.all([
    bookRepository.searchBooks(filters),
    bookRepository.countBooks(filters),
  ]);

  // 2. 페이지네이션 객체 생성
  const pagination = {
    currentPage: parseInt(page),
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };

  // 3. 도서 목록과 페이지네이션 정보를 함께 반환
  return { books, pagination };
};

// [수정] 도서 상세 조회 및 에러 처리 개선
exports.getBookById = async (bookId, userId) => {
  const book = await bookRepository.findBookWithDetailById(bookId, userId);
  if (!book) {
    throw new CustomError(
      NOT_FOUND.statusCode,
      `해당 ID(${bookId})의 도서를 찾을 수 없습니다.`
    );
  }
  return book;
};

exports.toggleBookLike = (bookId, userId) =>
  bookRepository.toggleLike(bookId, userId);
