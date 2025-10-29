const cartService = require("./cart.service");
const { CustomError } = require("../../utils/errorHandler.util");
const { BAD_REQUEST } = require("../../constants/errors");

exports.addToCart = async (req, res, next) => {
  try {
    const items = req.body; // 이제 req.body는 배열입니다.
    const userId = req.user.id;

    // 입력값 검증: 배열인지, 각 항목이 유효한지 확인
    if (!Array.isArray(items) || items.length === 0) {
      throw new CustomError(
        BAD_REQUEST.statusCode,
        "장바구니에 담을 상품 목록을 배열 형태로 전달해야 합니다."
      );
    }

    // 각 항목의 유효성 검사
    for (const item of items) {
      if (!item.book_id || !item.quantity || Number(item.quantity) < 1) {
        throw new CustomError(
          BAD_REQUEST.statusCode,
          "각 상품은 book_id와 1 이상의 quantity를 포함해야 합니다."
        );
      }
    }

    // 서비스 로직 호출 시 userId와 items 배열 전체를 전달
    await cartService.addToCart(userId, items);

    res.status(201).json({ message: "장바구니에 상품을 담았습니다." });
  } catch (err) {
    next(err);
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartService.getCartItems(userId);
    res.status(200).json(cartItems);
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // [강화] 입력값 검증
    if (!quantity || Number(quantity) < 1) {
      throw new CustomError(
        BAD_REQUEST.statusCode,
        "1 이상의 수량을 정확히 입력해주세요."
      );
    }

    const userId = req.user.id;
    await cartService.updateCartItem({
      cartItemId,
      quantity: Number(quantity),
      userId,
    });
    res.status(200).json({ message: "상품 수량이 변경되었습니다." });
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;
    await cartService.removeCartItem(cartItemId, userId);
    res
      .status(200)
      .json({ message: "장바구니 상품이 성공적으로 삭제되었습니다." });
  } catch (err) {
    next(err);
  }
};
