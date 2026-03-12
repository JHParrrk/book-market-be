# **Book Market - Express REST API**

도메인 특성을 고려한 DB 정규화, 계층 쿼리 및 이중 토큰 인증 체계를 통한 보안/성능 최적화 철학이 담긴 온라인 서점 백엔드 서비스입니다.

[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.16.1-blue)](https://expressjs.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.x%2B-003545)](https://mariadb.org/)
[![Testing](https://img.shields.io/badge/Testing-Jest-C21325)](https://jestjs.io/)

---

## 🏗️ 프로젝트 개요 (Project Overview)

본 프로젝트는 **계층 주도 설계(Layered Architecture)**와 **도메인 중심의 최적화**를 통해 구축된 온라인 서점 시스템입니다. 단순한 CRUD를 넘어, 대용량 데이터 환경에서의 성능 가용성과 보안을 고려한 설계 결정을 포함하고 있습니다.

## 🎯 설계 목표 및 핵심 가치

- **보안 중심 인증**: 이중 토큰 체계(Access/Refresh)를 통한 보안 강화 및 세션 관리.
- **조회 성능 최적화**: 무한 계층 구조의 카테고리 검색 최적화 및 데이터 파티셔닝.
- **데이터 무결성**: 주문 시점의 스냅샷 저장을 통한 과거 이력 보존.
- **유지보수성**: Controller-Service-Repository 패턴을 통한 비즈니스 로직의 순수성 유지.

## ✨ 핵심 기술적 차별점 (Core Engineering Points)

### 🧠 1. 계층형 카테고리 검색 최적화 (Recursive CTE)

- **Problem**: 무한 뎁스(Depth) 카테고리 구조에서 하위 도서 전체를 찾기 위한 반복적인 DB 호출(N+1 문제) 발생.
- **Solution**: MariaDB의 **재귀 CTE(`WITH RECURSIVE`)**를 활용하여 단일 쿼리로 모든 하위 카테고리를 탐색, DB 호출 횟수를 획기적으로 절감하고 응답 속도를 개선했습니다.

### 🔐 2. 이중 토큰 인증 전략 및 자동화된 세션 관리

- **Structure**: 단기 만료 **Access Token**과 장기 만료 **Refresh Token** 체계를 도입했습니다.
- **Security**: 서버 DB(`refresh_tokens`)에 화이트리스트 기반 검증을 수행하여 유출 의심 시 즉시 무효화가 가능합니다.
- **Automation**: **Node-cron** 기반 배치 스크립트를 통해 만료된 토큰을 정기적으로 삭제하여 DB 리소스 낭비를 방지했습니다.

### 📊 3. 읽기 성능을 위한 수직 파티셔닝 (Vertical Partitioning)

- **Problem**: 도서 목록 조회 시 대용량 텍스트 컬럼(설명, 목차 등)으로 인한 불필요한 I/O 부하 발생.
- **Solution**: 핵심 정보(`books`)와 상세 정보(`book_details`)를 1:1 관계로 분리하여 리스트 조회 시 페이로드를 축소하고 스캔 성능을 극대화했습니다.

### 🛡️ 4. EXISTS 연산 기반의 인터랙션 쿼리 튜닝

- **Optimization**: '좋아요' 여부 판별 시 `LEFT JOIN` 대신 `EXISTS` 서브쿼리를 사용하여 첫 번째 매칭 발견 즉시 스캔을 중단하도록 최적화했습니다.

## 🛠 기술 스택 (Tech Stack)

### **Backend & Infrastructure**

- **Framework & Auth**: Node.js, Express.js, JWT (Access/Refresh Token)
- **Database**: MariaDB (InnoDB)
- **Infrastructure**: Node-cron (Batch Jobs), Docker (Mariadb)
- **Testing**: Jest, Supertest

## 📂 프로젝트 구조 (Project Structure)

```
book_market/
├── app.js                 # Express 애플리케이션 및 미들웨어 설정
├── bin/www                # 서버 진입점
├── modules/               # 도메인 기반 비즈니스 로직 (C-S-R 패턴)
│   ├── books/             # 도서 및 좋아요 관리
│   ├── carts/             # 장바구니 관리
│   ├── orders/            # 주문 및 배송 관리
│   ├── reviews/           # 리뷰 및 인터랙션
│   └── users/             # 회원가입, 로그인 및 권한 관리
├── middleware/            # 공통 인증/인가 및 에러 핸들링
├── script/                # 만료 토큰 정리 등 배치 스크립트
├── database/              # DB 커넥션 및 스키마 정의
└── tests/                 # 기능별 Jest 테스트 수트
```

## ⚙️ 시작하기 (Getting Started)

### 1. MariaDB 컨테이너 실행

별도 가이드를 참고하여 데이터베이스를 준비합니다.
📄 [MariaDB Docker 배포 가이드](DOCKER_MARIADB.md)

### 2. 환경 변수 설정

`.env` 파일을 생성하고 아래 항목을 설정합니다.

```env
PORT=3000
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. 설치 및 실행

```bash
# 의존성 설치
npm install

# 서버 실행
npm start

# 테스트 실행
npm test
```

## 📄 API Reference

기존 API 상세 정보는 [README_OLD.md](README_OLD.md)의 API 문서 섹션을 참고하세요.

## 📄 라이선스 (License)

본 프로젝트는 MIT License를 따릅니다.
