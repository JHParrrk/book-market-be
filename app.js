var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 라우터 모듈 불러오기
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var booksRouter = require("./routes/books");
var cartsRouter = require("./routes/carts");
var ordersRouter = require("./routes/orders");
var reviewsRouter = require("./routes/reviews");
var categoriesRouter = require("./routes/categories");
var fakersRouter = require("./routes/fakers");

const errorHandler = require("./middleware/errorHandler.middleware");
const cors = require("cors");

var app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // 프론트엔드 출처
    methods: ["GET", "POST", "PUT", "DELETE"], // 허용할 HTTP 메서드
    credentials: true, // 쿠키 허용 (옵션)
  }),
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 미들웨어 설정
app.use(logger("dev"));
// → 요청이 들어올 때마다 로그를 출력
app.use(express.json());
// → 요청의 body가 JSON이면, req.body에 파싱된 객체로 넣어줌
app.use(express.urlencoded({ extended: false }));
// → 폼 데이터(body에 key=value&...)를 req.body에 객체로 넣어줌
app.use(cookieParser());
// → 요청의 쿠키를 쉽게 쓸 수 있도록 req.cookies에 객체로 넣어줌
app.use(express.static(path.join(__dirname, "public")));
// → public 폴더 안의 파일을 정적 파일(이미지, CSS 등)로 제공

// 라우터 설정
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/reviews", reviewsRouter);
app.use("/categories", categoriesRouter);
app.use("/dev/fakers", fakersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);

// Node-cron을 통한 만료 토큰 주기적 청소 설정
const cron = require("node-cron");
const dbPool = require("./database/connection/mariaDB");

cron.schedule("0 0 * * *", async () => {
  let conn;
  try {
    conn = await dbPool.getConnection();
    console.log(
      `[${new Date().toISOString()}] 만료된 Refresh Token 청소 시작...`,
    );
    const sql = "DELETE FROM refresh_tokens WHERE expires_at <= NOW()";
    const result = await conn.query(sql);
    console.log(
      `[${new Date().toISOString()}] 만료된 Refresh Token 청소 완료. 영향을 받은 행: ${result.affectedRows || result[0]?.affectedRows || 0}`,
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Refresh Token 청소 중 에러 발생:`,
      err,
    );
  } finally {
    if (conn) conn.release();
  }
});

module.exports = app;
