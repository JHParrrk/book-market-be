const dbPool = require("../../database/connection/mariaDB");

// DB 쿼리 결과 파싱 유틸리티 (배열의 첫 번째 요소를 반환)
const parseResult = (result) => result[0];

// 사용자 생성 (해시된 비밀번호를 받음)
exports.createUser = async ({
  email,
  hashedPassword,
  name,
  address,
  phone_number,
}) => {
  const result = await dbPool.query(
    "INSERT INTO users (email, password, name, address, phone_number) VALUES (?, ?, ?, ?, ?)",
    [email, hashedPassword, name, address, phone_number]
  );
  return parseResult(result).insertId;
};

// 이메일로 사용자 조회 (비밀번호 포함, 로그인 검증용)
exports.findUserByEmail = async (email) => {
  const result = await dbPool.query(
    "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
    [email]
  );
  return parseResult(result)[0];
};

// ID로 사용자 조회 (비밀번호 제외)
exports.findUserById = async (id) => {
  const result = await dbPool.query(
    "SELECT id, email, name, address, phone_number, role FROM users WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return parseResult(result)[0];
};

// 모든 사용자 조회
exports.getAllUsers = async () => {
  const result = await dbPool.query(
    "SELECT id, email, name, address, phone_number, role FROM users WHERE deleted_at IS NULL"
  );
  return parseResult(result);
};

// 사용자 정보 업데이트
exports.updateUser = async (id, updateData) => {
  // 업데이트할 필드와 값을 동적으로 생성
  const fields = Object.keys(updateData).map((key) => `${key} = ?`);
  const params = [...Object.values(updateData), id];

  const sql = `UPDATE users SET ${fields.join(
    ", "
  )} WHERE id = ? AND deleted_at IS NULL`;
  await dbPool.query(sql, params);
};

// 사용자 소프트 삭제
exports.deleteUser = async (id) => {
  const sql =
    "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL";
  const result = await dbPool.query(sql, [id]);
  return parseResult(result).affectedRows;
};

/**
 * [신규] 특정 사용자의 역할을 업데이트하는 함수
 * @returns {Promise<number>} 영향을 받은 행의 수
 */
exports.updateUserRole = async (userId, role) => {
  const sql = "UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL";
  const [result] = await dbPool.query(sql, [role, userId]);
  return result.affectedRows;
};

// --- Refresh Token 관련 ---

/**
 * [신규] 리프레시 토큰 저장
 * - 해싱된 토큰과 IP, User-Agent 정보를 함께 저장합니다.
 */
exports.saveRefreshToken = async ({
  userId,
  hashedToken,
  expiresAt,
  ipAddress,
  userAgent,
}) => {
  const sql = `
    INSERT INTO refresh_tokens (user_id, hashed_token, expires_at, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?)`;
  await dbPool.query(sql, [
    userId,
    hashedToken,
    expiresAt,
    ipAddress,
    userAgent,
  ]);
};

/**
 * [신규] 특정 사용자의 모든 유효한(만료되지 않고, 무효화되지 않은) 리프레시 토큰을 조회합니다.
 */
exports.findValidTokensByUserId = async (userId) => {
  const sql = `
    SELECT * FROM refresh_tokens 
    WHERE user_id = ? AND expires_at > NOW() AND is_revoked = FALSE`;
  const [tokens] = await dbPool.query(sql, [userId]);
  return tokens;
};

/**
 * [신규] 특정 토큰 ID를 무효화(revoke) 처리합니다.
 */
exports.revokeTokenById = async (tokenId) => {
  const sql = "UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?";
  await dbPool.query(sql, [tokenId]);
};

/**
 * [신규] 특정 사용자의 모든 토큰을 무효화합니다. (전체 로그아웃 또는 보안 이슈 시 사용)
 */
exports.revokeAllTokensByUserId = async (userId) => {
  const sql = "UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?";
  await dbPool.query(sql, [userId]);
};
