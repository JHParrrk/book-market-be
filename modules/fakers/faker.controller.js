const fakerService = require("./faker.service");

// 가짜 사용자 생성
exports.generateFakeUsers = async (req, res, next) => {
  try {
    const count = parseInt(req.body.count) || parseInt(req.query.count) || 10;
    const result = await fakerService.generateFakeUsers(count);

    res.status(201).json({
      message: `${result.count}명의 가짜 사용자가 생성되었습니다.`,
      defaultPassword: result.defaultPassword,
      users: result.users,
    });
  } catch (err) {
    next(err);
  }
};
