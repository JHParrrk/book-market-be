const userRepository = require("./user.repository");
const { CustomError } = require("../../utils/errorHandler.util.js");
const {
  USER_ALREADY_EXISTS,
  INVALID_CREDENTIALS,
  NOT_FOUND,
  INVALID_OR_EXPIRED_REFRESH_TOKEN,
} = require("../../constants/errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token.util");

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// 회원가입
exports.register = async ({ email, password, name, address, phone_number }) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new CustomError(
      USER_ALREADY_EXISTS.statusCode,
      USER_ALREADY_EXISTS.message
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = await userRepository.createUser({
    email,
    hashedPassword,
    name,
    address,
    phone_number,
  });
  return { id: userId };
};

// 로그인
exports.login = async ({ email, password, ipAddress, userAgent }) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError(
      INVALID_CREDENTIALS.statusCode,
      INVALID_CREDENTIALS.message
    );
  }

  // 로그인 시, 해당 사용자의 다른 모든 세션을 무효화 (단일 디바이스 정책)
  await userRepository.revokeAllTokensByUserId(user.id);

  // 새로운 토큰 생성
  const accessToken = generateAccessToken(user);
  const refreshTokenString = generateRefreshToken(user);

  // 리프레시 토큰 해싱
  const hashedToken = await bcrypt.hash(refreshTokenString, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // 해싱된 토큰과 메타데이터 저장
  await userRepository.saveRefreshToken({
    userId: user.id,
    hashedToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return { accessToken, refreshToken: refreshTokenString, user };
};

// 사용자 정보 업데이트
exports.updateUser = async (id, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  await userRepository.updateUser(id, updateData);
  return userRepository.findUserById(id);
};

// 특정 사용자의 역할을 변경하는 서비스
exports.updateUserRole = async (userId, role) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new CustomError(
      NOT_FOUND.statusCode,
      "해당 사용자를 찾을 수 없습니다."
    );
  }

  const affectedRows = await userRepository.updateUserRole(userId, role);
  if (affectedRows === 0) {
    throw new Error("역할 업데이트에 실패했습니다.");
  }
};

// 액세스 토큰 재발급
exports.refreshAccessToken = async ({
  refreshTokenString,
  ipAddress,
  userAgent,
}) => {
  try {
    const payload = jwt.verify(
      refreshTokenString,
      process.env.REFRESH_SECRET_KEY
    );
    const userId = payload.id;

    const validTokens = await userRepository.findValidTokensByUserId(userId);
    if (validTokens.length === 0) {
      throw new Error("No valid tokens found."); // 에러 메시지는 내부용
    }

    let matchedToken = null;
    for (const token of validTokens) {
      if (await bcrypt.compare(refreshTokenString, token.hashed_token)) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      // 일치하는 토큰이 없음 = 탈취된 토큰의 재사용 시도일 수 있음
      // 보안을 위해 해당 사용자의 모든 토큰을 무효화
      await userRepository.revokeAllTokensByUserId(userId);
      throw new CustomError(
        INVALID_OR_EXPIRED_REFRESH_TOKEN.statusCode,
        "Invalid refresh token. All sessions have been logged out for security."
      );
    }

    // 토큰 교체: 사용된 토큰은 무효화
    await userRepository.revokeTokenById(matchedToken.id);

    // 새로운 토큰 생성 및 저장
    const user = await userRepository.findUserById(userId);
    const newAccessToken = generateAccessToken(user);
    const newRefreshTokenString = generateRefreshToken(user);
    const newHashedToken = await bcrypt.hash(newRefreshTokenString, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await userRepository.saveRefreshToken({
      userId: user.id,
      hashedToken: newHashedToken,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  } catch (err) {
    throw new CustomError(
      INVALID_OR_EXPIRED_REFRESH_TOKEN.statusCode,
      INVALID_OR_EXPIRED_REFRESH_TOKEN.message
    );
  }
};

//  쿠키에 있는 토큰과 일치하는 DB의 토큰을 찾아 무효화합니다.
exports.logout = async (refreshTokenString) => {
  if (!refreshTokenString) return; // 로그아웃할 토큰이 없으면 종료

  try {
    const payload = jwt.verify(
      refreshTokenString,
      process.env.REFRESH_SECRET_KEY
    );
    const validTokens = await userRepository.findValidTokensByUserId(
      payload.id
    );

    for (const token of validTokens) {
      if (await bcrypt.compare(refreshTokenString, token.hashed_token)) {
        await userRepository.revokeTokenById(token.id);
        break; // 일치하는 토큰을 찾았으므로 반복 종료
      }
    }
  } catch (err) {
    // JWT 검증 실패 등 에러가 발생해도 로그아웃은 성공한 것처럼 처리
    console.warn(
      "Logout failed for an invalid token, which is acceptable.",
      err.message
    );
  }
};

// 단순 조회/삭제는 Repository를 그대로 호출
exports.findUserById = (id) => userRepository.findUserById(id);
exports.getAllUsers = () => userRepository.getAllUsers();
exports.deleteUser = (id) => userRepository.deleteUser(id);
exports.saveRefreshToken = (userId, token) =>
  userRepository.saveRefreshToken(userId, token);
