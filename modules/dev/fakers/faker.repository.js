const dbPool = require("../../../database/connection/mariaDB");

// DB 쿼리 결과 파싱 유틸리티
const parseResult = (result) => result[0];

// 여러 사용자를 한 번에 생성
exports.createUsers = async (users) => {
  if (!users || users.length === 0) {
    return [];
  }

  // 배치 INSERT를 위한 쿼리 생성
  const placeholders = users.map(() => "(?, ?, ?, ?, ?)").join(", ");
  const values = users.flatMap((user) => [
    user.email,
    user.hashedPassword,
    user.name,
    user.address,
    user.phone_number,
  ]);

  const result = await dbPool.query(
    `INSERT INTO users (email, password, name, address, phone_number) VALUES ${placeholders}`,
    values
  );

  const insertId = parseResult(result).insertId;
  const affectedRows = parseResult(result).affectedRows;

  // 삽입된 사용자 ID 목록 생성
  const userIds = [];
  for (let i = 0; i < affectedRows; i++) {
    userIds.push(insertId + i);
  }

  return userIds;
};

// 생성된 사용자 정보 조회
exports.getUsersByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const result = await dbPool.query(
    `SELECT id, email, name, address, phone_number, role, created_at FROM users WHERE id IN (${placeholders})`,
    ids
  );

  return parseResult(result);
};
