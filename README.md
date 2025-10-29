# **Book Market - Express REST API**

Node.js, Express, MariaDB로 구축된 모든 기능을 갖춘 온라인 서점 REST API입니다. 이 애플리케이션은 사용자 인증, 도서 관리, 장바구니, 주문, 리뷰 등 포괄적인 온라인 서점 기능을 제공합니다.

## **주요 기능**

### **사용자 관리**

- JWT를 이용한 사용자 회원가입 및 인증
- 역할 기반 접근 제어 (관리자/일반 회원)
- 토큰 리프레시 메커니즘
- `bcrypt`를 이용한 안전한 비밀번호 해싱
- 사용자 프로필 관리

### **도서 관리**

- 도서 조회 및 검색
- 카테고리별 필터링
- 페이지네이션(페이지 나누기) 지원
- 신간 도서 섹션
- 책 상세 정보 (설명, ISBN, 목차 등)
- 도서 '좋아요' 기능

### **장바구니**

- 장바구니에 도서 추가
- 수량 업데이트
- 상품 삭제
- 도서 상세 정보가 포함된 장바구니 조회

### **주문 관리**

- 장바구니 상품으로 주문 생성
- 주문 내역 조회
- 주문 상태 추적이 포함된 주문 상세 정보
- 관리자의 주문 상태 관리 기능

### **리뷰 시스템**

- 리뷰 생성, 조회, 수정, 삭제 (CRUD)
- 별점 시스템 (1~5점)
- 리뷰 '좋아요' 기능
- 사용자별 리뷰 작성 제한 (책 한 권당 리뷰 하나)

### **카테고리**

- 계층적 카테고리 구조
- 부모-자식 관계의 카테고리
- 카테고리 기반 도서 필터링

## **기술 스택**

- **런타임**: Node.js
- **프레임워크**: Express.js 4.16.1
- **데이터베이스**: MariaDB/MySQL
- **인증**: JSON Web Tokens (JWT)
- **비밀번호 보안**: bcrypt
- **유효성 검사**: express-validator
- **테스팅**: Jest, Supertest
- **환경 변수**: dotenv

## **사전 요구사항**

- Node.js (v14 이상)
- MariaDB 또는 MySQL (v10.x 이상)
- npm 또는 yarn

## **설치 방법**

1.  리포지토리를 클론합니다:

    ```bash
    git clone https://github.com/JHParrrk/book_market.git
    cd book_market
    ```

2.  의존성을 설치합니다:

    ```bash
    npm install
    ```

3.  데이터베이스를 설정합니다:

    - `bookstore`라는 이름의 MariaDB/MySQL 데이터베이스를 생성합니다.
    - `database.ddl.txt` 파일에 있는 SQL 스키마를 실행합니다.

4.  프로젝트 최상위 디렉토리에 `.env` 파일을 생성합니다:

    ```env
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
    JWT_EXPIRES_IN=1h
    JWT_REFRESH_EXPIRES_IN=7d
    ```

5.  필요하다면 `database/connection/mariaDB.js` 파일에서 데이터베이스 연결 정보를 수정합니다:
    ```javascript
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bookstore"
    ```

## **애플리케이션 실행**

### **개발 환경**

```bash
npm start
```

서버는 `http://localhost:3000` (또는 `.env` 파일에 지정된 포트)에서 시작됩니다.

### **테스트**

```bash
npm test
```

## **API 문서**

### **인증 (Authentication)**

#### **신규 사용자 등록**

```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### **로그인**

```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

응답에는 `accessToken`과 `refreshToken`이 포함됩니다.

#### **Access Token 갱신**

```http
POST /users/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### **로그아웃**

```http
POST /users/logout
Authorization: Bearer <access_token>
```

### **도서 (Books)**

#### **모든 도서 조회 (검색 및 필터링 포함)**

```http
GET /books?search=query&categoryId=1&page=1&limit=8
```

#### **신간 도서 조회**

```http
GET /books/new?categoryId=1&limit=4
```

#### **도서 상세 정보 조회**

```http
GET /books/:bookId
Authorization: Bearer <access_token> (선택 사항)
```

#### **도서 '좋아요' 토글**

```http
POST /books/:bookId/like
Authorization: Bearer <access_token>
```

### **카테고리 (Categories)**

#### **모든 카테고리 조회**

```http
GET /categories
```

### **장바구니 (Shopping Cart)**

#### **장바구니에 상품 추가**

```http
POST /carts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookId": 1,
  "quantity": 2
}
```

#### **장바구니 상품 조회**

```http
GET /carts
Authorization: Bearer <access_token>
```

#### **장바구니 상품 수량 수정**

```http
PUT /carts/:cartItemId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### **장바구니 상품 삭제**

```http
DELETE /carts/:cartItemId
Authorization: Bearer <access_token>
```

### **주문 (Orders)**

#### **주문 생성**

```http
POST /orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deliveryInfo": {
    "address": "123 Main St",
    "phone": "010-1234-5678"
  },
  "cartItemIds": [1, 2, 3]
}
```

#### **내 주문 목록 조회**

```http
GET /orders
Authorization: Bearer <access_token>
```

#### **주문 상세 정보 조회**

```http
GET /orders/:orderId
Authorization: Bearer <access_token>
```

#### **주문 상태 수정 (관리자 전용)**

```http
PUT /orders/:orderId/status
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

### **리뷰 (Reviews)**

#### **특정 도서의 리뷰 조회**

```http
GET /books/:bookId/reviews
```

#### **리뷰 추가**

```http
POST /books/:bookId/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 5,
  "content": "Great book!"
}
```

#### **리뷰 수정**

```http
PUT /books/:bookId/reviews/:reviewId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 4,
  "content": "Updated review"
}
```

#### **리뷰 삭제**

```http
DELETE /books/:bookId/reviews/:reviewId
Authorization: Bearer <access_token>
```

#### **리뷰 '좋아요' 토글**

```http
POST /books/:bookId/reviews/:reviewId/like
Authorization: Bearer <access_token>
```

### **관리자 라우트 (Admin Routes)**

#### **모든 사용자 조회 (관리자 전용)**

```http
GET /users
Authorization: Bearer <admin_access_token>
```

#### **사용자 역할 수정 (관리자 전용)**

```http
PUT /users/:userId/role
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "role": "admin"
}
```

## **데이터베이스 스키마**

애플리케이션은 다음과 같은 주요 테이블을 사용합니다:

- **users**: 사용자 계정 및 인증 정보
- **books**: 도서 카탈로그 및 상세 정보
- **categories**: 계층적 도서 카테고리
- **carts**: 장바구니 상품
- **orders**: 주문 기록
- **order_details**: 주문별 상세 항목
- **reviews**: 도서 리뷰 및 평점
- **book_likes**: 사용자의 '좋아요'한 도서
- **review_likes**: '좋아요'한 리뷰
- **refresh_tokens**: JWT 리프레시 토큰

전체 스키마 정의는 `database.ddl.txt` 파일을 참고하세요.

## **프로젝트 구조**

```
book_market/
├── app.js                 # Express 애플리케이션 설정
├── bin/
│   └── www               # 서버 시작 스크립트
├── config.js             # 설정 상수
├── constants/            # 애플리케이션 상수
├── database/
│   └── connection/
│       └── mariaDB.js   # 데이터베이스 커넥션 풀
├── middleware/          # Express 미들웨어
│   ├── authorize.middleware.js
│   ├── authorizeAdmin.middleware.js
│   ├── errorHandler.middleware.js
│   └── validator.middleware.js
├── modules/            # 비즈니스 로직 모듈
│   ├── books/
│   ├── carts/
│   ├── categories/
│   ├── orders/
│   ├── reviews/
│   └── users/
├── routes/            # Express 라우트 핸들러
├── tests/             # Jest 테스트 스위트
├── utils/             # 유틸리티 함수
└── package.json
```

## **보안 기능**

- JWT 기반 인증
- `bcrypt`를 이용한 비밀번호 해싱
- 역할 기반 접근 제어 (RBAC)
- `express-validator`를 이용한 입력값 유효성 검사
- 파라미터화된 쿼리를 통한 SQL 인젝션 방지
- CORS 지원

## **에러 핸들링**

애플리케이션은 중앙 집중식 에러 핸들링 미들웨어를 포함하고 있으며, 다음 기능을 수행합니다:

- 유효성 검사 에러를 잡아 포맷팅
- 인증 에러 처리
- 의미 있는 에러 메시지 제공
- 디버깅을 위한 에러 로깅

## **개발**

### **코드 구성**

애플리케이션은 모듈식 아키텍처를 따릅니다:

- **Controllers**: HTTP 요청과 응답을 처리
- **Services**: 비즈니스 로직을 포함
- **Repositories**: 데이터베이스 작업을 처리
- **Middleware**: 컨트롤러에 도달하기 전 요청을 처리

### **테스팅**

테스트는 기능별로 구성되어 있습니다:

- `tests/users.test.js` - 사용자 인증 및 권한 부여
- `tests/books.test.js` - 도서 관리 및 '좋아요'
- `tests/carts.test.js` - 장바구니 작업

테스트 실행 명령어:

```bash
npm test
```

## **기여하기 (Contributing)**

1.  리포지토리를 포크(Fork)합니다.
2.  피처 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3.  변경 사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4.  브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5.  Pull Request를 엽니다.

## **라이선스**

이 프로젝트는 비공개이며 독점적입니다.

## **작성자**

JHParrrk

## **지원**

이슈나 질문이 있는 경우, GitHub 리포지토리에서 이슈를 열어주세요.
