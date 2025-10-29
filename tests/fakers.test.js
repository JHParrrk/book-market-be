// book_market/tests/fakers.test.js

require("dotenv").config();

const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const dbPool = require("../database/connection/mariaDB");

// DB 초기화를 위한 헬퍼 함수
const cleanDatabase = async () => {
  await dbPool.query("SET FOREIGN_KEY_CHECKS = 0");
  await dbPool.query("TRUNCATE TABLE refresh_tokens");
  await dbPool.query("TRUNCATE TABLE users");
  await dbPool.query("SET FOREIGN_KEY_CHECKS = 1");
};

describe("Faker API", () => {
  let adminToken;
  let adminId;

  beforeAll(async () => {
    await cleanDatabase();

    // 관리자 사용자 생성
    const [result] = await dbPool.query(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
      ["admin@test.com", await bcrypt.hash("admin123", 10), "Admin", "admin"]
    );
    adminId = result.insertId;

    // 관리자 로그인하여 토큰 획득
    const adminLoginRes = await request(app)
      .post("/users/login")
      .send({ email: "admin@test.com", password: "admin123" });
    
    adminToken = adminLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase();
    await dbPool.end();
  });

  describe("POST /fakers/users", () => {
    it("should create 5 fake users when count is 5", async () => {
      const res = await request(app)
        .post("/fakers/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ count: 5 });

      expect(res.statusCode).toBe(201);
      expect(res.body.users).toHaveLength(5);
      expect(res.body.defaultPassword).toBe("password123");
      expect(res.body.message).toContain("5명의 가짜 사용자가 생성되었습니다.");

      // 생성된 사용자가 올바른 구조를 가지고 있는지 확인
      res.body.users.forEach((user) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("address");
        expect(user).toHaveProperty("phone_number");
        expect(user).toHaveProperty("role");
        expect(user.email).toMatch(/@/);
      });
    });

    it("should create 10 fake users by default when count is not provided", async () => {
      const res = await request(app)
        .post("/fakers/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(201);
      expect(res.body.users).toHaveLength(10);
    });

    it("should work with query parameter", async () => {
      const res = await request(app)
        .post("/fakers/users?count=3")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(201);
      expect(res.body.users).toHaveLength(3);
    });

    it("should fail when count exceeds 1000", async () => {
      const res = await request(app)
        .post("/fakers/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ count: 1001 });

      expect(res.statusCode).toBe(400);
    });

    it("should fail when called without authentication", async () => {
      const res = await request(app)
        .post("/fakers/users")
        .send({ count: 5 });

      expect(res.statusCode).toBe(401);
    });

    it("should fail when called by non-admin user", async () => {
      // 일반 사용자 생성 및 로그인
      await dbPool.query(
        "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
        ["user@test.com", await bcrypt.hash("user123", 10), "User", "member"]
      );

      const userLoginRes = await request(app)
        .post("/users/login")
        .send({ email: "user@test.com", password: "user123" });

      const userToken = userLoginRes.body.accessToken;

      const res = await request(app)
        .post("/fakers/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ count: 5 });

      expect(res.statusCode).toBe(403);
    });
  });
});
