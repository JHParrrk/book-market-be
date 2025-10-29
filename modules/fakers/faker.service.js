const bcrypt = require("bcrypt");
const fakerRepository = require("./faker.repository");
const { CustomError } = require("../../utils/errorHandler.util");
const { BAD_REQUEST } = require("../../constants/errors");

// 가짜 사용자 데이터 생성
exports.generateFakeUsers = async (count) => {
  // 동적으로 faker 모듈 import
  const { faker } = await import("@faker-js/faker");

  // 유효성 검사
  if (!count || count <= 0) {
    throw new CustomError(
      BAD_REQUEST.statusCode,
      "사용자 수는 1 이상이어야 합니다."
    );
  }

  // 너무 많은 사용자 생성 방지 (최대 1000명)
  if (count > 1000) {
    throw new CustomError(
      BAD_REQUEST.statusCode,
      "한 번에 최대 1000명의 사용자만 생성할 수 있습니다."
    );
  }

  // 기본 비밀번호 해시 생성 (모든 가짜 사용자는 동일한 비밀번호 사용)
  const defaultPassword = "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 가짜 사용자 데이터 생성
  const fakeUsers = [];
  for (let i = 0; i < count; i++) {
    fakeUsers.push({
      email: faker.internet.email(),
      hashedPassword: hashedPassword,
      name: faker.person.fullName(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      phone_number: faker.phone.number(),
    });
  }

  // DB에 저장
  const userIds = await fakerRepository.createUsers(fakeUsers);

  // 생성된 사용자 정보 조회
  const createdUsers = await fakerRepository.getUsersByIds(userIds);

  return {
    count: createdUsers.length,
    defaultPassword: defaultPassword,
    users: createdUsers,
  };
};
