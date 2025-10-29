// book_market/modules/carts/cart.repository.js

const dbPool = require("../../database/connection/mariaDB");

// [수정] 여러 상품을 한 번의 쿼리로 UPSERT 하는 함수
exports.upsertCartItems = (userId, items) => {
  const sql = `
    INSERT INTO carts (user_id, book_id, quantity) VALUES ?
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`;
  //핵심 원리: node-mysql이나 mysql2 같은 라이브러리는 INSERT ... VALUES ? 구문에
  // 2차원 배열을 넘기면, 이를 자동으로 INSERT ... VALUES (...), (...), ... 형태의 SQL로 변환해 줍니다.
  // ON DUPLICATE KEY UPDATE 구문 덕분에, 이미 장바구니에 있는 상품은 수량이 더해지고(UPDATE),
  // 없는 상품은 새로 추가(INSERT)됩니다.

  // items 배열을 SQL의 VALUES절에 맞는 2차원 배열로 변환
  // 예: [[userId, book_id, quantity], [userId, book_id, quantity], ...]
  const values = items.map((item) => [userId, item.book_id, item.quantity]);

  // dbPool.query의 두 번째 인자로 2차원 배열을 전달하면 bulk insert가 실행됩니다.
  return dbPool.query(sql, [values]);
};

exports.findCartItemsByUserId = async (userId) => {
  const sql = `
    SELECT c.id as cart_id, c.book_id, b.title, b.price, c.quantity
    FROM carts c
    JOIN books b ON c.book_id = b.id
    WHERE c.user_id = ? AND b.deleted_at IS NULL`;
  const [items] = await dbPool.query(sql, [userId]);
  return items;
};

/**
 * [개선] user_id 조건을 추가하여 본인의 장바구니 상품만 수정하도록 보장합니다.
 * @returns {Promise<number>} 영향을 받은 행의 수
 */
exports.updateCartItemQuantity = async (cartItemId, quantity, userId) => {
  const sql = "UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?";
  const [result] = await dbPool.query(sql, [quantity, cartItemId, userId]);
  return result.affectedRows;
};

/**
 * [개선] user_id 조건을 추가하여 본인의 장바구니 상품만 삭제하도록 보장합니다.
 * @returns {Promise<number>} 영향을 받은 행의 수
 */
exports.deleteCartItem = async (cartItemId, userId) => {
  const sql = "DELETE FROM carts WHERE id = ? AND user_id = ?";
  const [result] = await dbPool.query(sql, [cartItemId, userId]);
  return result.affectedRows;
};
