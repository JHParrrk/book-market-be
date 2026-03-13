// .env 파일의 환경 변수를 로드합니다.
require("dotenv").config();

// package.json 스크립트에서 NODE_ENV 값을 읽어옵니다.
// 설정되지 않았다면 기본값으로 'sub' (서브 컴퓨터)를 사용합니다.
const ENV = process.env.NODE_ENV || "sub";

// 환경별 DB 설정 객체
const CONFIG = {
  // 메인 컴퓨터 환경 설정 (localhost)
  main: {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  // 서브 컴퓨터 환경 설정
  sub: {
    host: process.env.PROD_DB_HOST_BY_LAN,
    port: process.env.PROD_DB_PORT_BY_LAN,
    user: process.env.PROD_DB_USER_BY_LAN,
    password: process.env.PROD_DB_PASSWORD_BY_LAN,
    database: process.env.PROD_DB_DATABASE_BY_LAN,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
};

// 현재 환경(ENV)에 맞는 DB 설정을 내보냅니다.
module.exports = {
  DB_CONFIG: CONFIG[ENV],
};
