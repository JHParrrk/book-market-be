// database/connection/mariaDB.js
// 역할: 데이터베이스 연결을 책임지는 부품

const mysql = require("mysql2/promise");
// 1. promise를 지원하는 mysql2를 불러옵니다.
const { DB_CONFIG } = require("../../constants/constants"); // 경로가 맞는지 확인하세요.

// constants.js에서 가져온 설정으로 DB 연결 풀 생성
// 2. 단일 연결(createConnection) 대신 연결 풀(createPool)을 생성합니다.
const pool = mysql.createPool(DB_CONFIG);

// 현재 어떤 DB에 연결되었는지 로그로 명확히 보여줍니다.
console.log(
  `✅ DB Connection Pool Ready! [${
    process.env.NODE_ENV || "development"
  } mode, host: ${DB_CONFIG.host}]`
);

// 3. 생성된 '풀' 자체를 내보냅니다.
module.exports = pool;

// 왜 이 방식이 더 좋은가요?
// 안정성: 연결 하나가 끊겨도 다른 연결을 사용해서 서비스가 중단되지 않습니다.
// 효율성: 요청이 올 때마다 새로 연결을 만드는 게 아니라, 만들어둔 연결을 바로
// 빌려 쓰기 때문에 훨씬 빠릅니다.
// async/await 사용 가능: require("mysql2/promise")로 불러왔기 때문에,
// 깔끔한 async/await 구문을 사용할 수 있습니다.
