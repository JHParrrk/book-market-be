# MariaDB Docker 배포 가이드

본 프로젝트는 MariaDB를 Docker 컨테이너 환경에서 실행하는 것을 권장합니다.

## 1. 기본 개념

- **Docker**: 호스트 환경(Windows/macOS/Linux)과 분리된 독립된 컨테이너 내에서 프로그램을 실행합니다. 환경 설정이 깔끔하게 유지되는 장점이 있습니다.
- **이미지(Image)**: MariaDB 실행에 필요한 모든 설정과 파일이 들어있는 설치 패키지입니다.

## 2. 실행 프로세스 (PowerShell/Terminal 기준)

### STEP 1: MariaDB 이미지 다운로드

```bash
docker pull mariadb
```

### STEP 2: 컨테이너 생성 및 실행

```bash
docker run --name mariadb -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mariadb
```

- `-p 3306:3306`: 로컬 포트와 컨테이너 포트 연결
- `-e MYSQL_ROOT_PASSWORD=root`: 관리자(root) 비밀번호 설정

### STEP 3: 컨테이너 내부 접속 및 DB 로그인

```bash
# 컨테이너 터미널 입장
docker exec -it mariadb /bin/bash

# MariaDB 로그인
mysql -u root -p
# 설정한 비밀번호(root) 입력
```

## 3. 초기 데이터베이스 설정

접속 후 아래 명령어를 통해 프로젝트용 데이터베이스를 생성합니다.

```sql
CREATE DATABASE bookstore;
USE bookstore;
```

이후 프로젝트 루트의 `database.ddl.txt` 파일 내용을 복사하여 실행하세요.
