const orderRepository = require("./order.repository");
const { NOT_FOUND, FORBIDDEN } = require("../../constants/errors");
const { CustomError } = require("../../utils/errorHandler.util");

exports.createOrder = async ({
  userId,
  delivery_info,
  cart_item_ids,
  use_default_address,
  currentUser,
}) => {
  let finalDeliveryInfo = delivery_info;

  // [개선] currentUser 정보를 활용하여 userRepository 의존성 제거
  if (use_default_address) {
    if (!currentUser || !currentUser.address) {
      throw new CustomError(
        NOT_FOUND.statusCode,
        "기본 배송지로 설정된 주소가 없습니다.",
      );
    }
    finalDeliveryInfo = {
      recipient: currentUser.name,
      address: currentUser.address,
      phone: currentUser.phone_number,
    };
  }

  // [핵심 개선] 주문 생성 시, 현재 사용자의 ID를 함께 전달하여 권한 검증
  return orderRepository.create({
    userId,
    delivery_info: finalDeliveryInfo,
    cart_item_ids,
  });
};

exports.getOrdersByUserId = (userId) => orderRepository.findByUserId(userId);

exports.getOrderDetails = async ({ orderId, userId }) => {
  const order = await orderRepository.findOrderDetailsById(orderId);
  // 본인 주문인지 확인
  if (order && order.user_id !== userId) {
    throw new CustomError(
      FORBIDDEN.statusCode,
      "자신의 주문만 조회할 수 있습니다.",
    );
  }
  return order;
};

/**
 * [신규] 사용자 본인의 주문 취소 (결제 대기 상태일 때만 가능)
 */
exports.cancelOrder = async ({ orderId, userId }) => {
  const order = await exports.getOrderDetails({ orderId, userId });
  if (!order) {
    throw new CustomError(NOT_FOUND.statusCode, "주문을 찾을 수 없습니다.");
  }
  if (order.status !== "결제대기") {
    throw new CustomError(400, "결제 대기 상태의 주문만 취소할 수 있습니다.");
  }

  await orderRepository.updateOrderStatus(orderId, "주문취소");
};

/**
 * [신규] 간편 결제 시뮬레이션 및 이후 배송 상태 자동 변경
 */
exports.processPayment = async ({ orderId, userId, cardNumber, cvv }) => {
  const order = await exports.getOrderDetails({ orderId, userId });
  if (!order) {
    throw new CustomError(NOT_FOUND.statusCode, "주문을 찾을 수 없습니다.");
  }
  if (order.status !== "결제대기") {
    throw new CustomError(400, "결제가 대기 중인 주문이 아닙니다.");
  }

  // cvv 마지막 자리에 따른 결제 실패 테스트
  const lastCvvDigit = cvv.slice(-1);
  if (lastCvvDigit === "1") {
    throw new CustomError(402, "결제 실패: 한도 초과");
  } else if (lastCvvDigit === "2") {
    throw new CustomError(400, "결제 실패: 유효하지 않은 카드");
  } else if (lastCvvDigit === "3") {
    throw new CustomError(500, "결제 실패: 결제 시스템 장애");
  }

  // 결제 성공 시 결제완료 업데이트
  await orderRepository.updateOrderStatus(orderId, "결제완료");

  // 비동기 배송 상태 자동 변경 (시뮬레이션: 10초 간격)
  const deliveryStages = [
    { delay: 10000, status: "배송준비중" },
    { delay: 20000, status: "배송중" },
    { delay: 30000, status: "배송완료" },
  ];

  deliveryStages.forEach(({ delay, status }) => {
    setTimeout(async () => {
      try {
        await orderRepository.updateOrderStatus(orderId, status);
        console.log(`[시뮬레이션] 주문 ${orderId} 상태 변경: ${status}`);
      } catch (err) {
        console.error(`[시뮬레이션 오류] 주문 ${orderId} 상태 변경 실패`, err);
      }
    }, delay);
  });
};

/**
 * [신규] 주문 상태 변경 서비스
 */
exports.updateOrderStatus = async ({ orderId, status }) => {
  const affectedRows = await orderRepository.updateOrderStatus(orderId, status);

  // 업데이트된 행이 0개이면, 해당 주문 ID가 존재하지 않는다는 의미입니다.
  if (affectedRows === 0) {
    throw new CustomError(NOT_FOUND.statusCode, "주문을 찾을 수 없습니다.");
  }
};
