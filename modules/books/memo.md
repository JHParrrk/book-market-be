### **`AND b.category_id IN (...)` SQL 구문 상세 분석**

이 SQL 구문은 `WITH RECURSIVE`를 사용하여 정의된 **CTE(Common Table Expression)**의 결과를 서브쿼리로 활용하여, 특정 카테고리 및 그에 속한 모든 하위 카테고리의 도서를 필터링하는 역할을 합니다.

### **1. 전체 구조 분석**

SQL

- `- books 테이블의 category_id가 서브쿼리 결과 목록에 포함되는지 확인한다.
AND b.category_id IN ( -- 이 서브쿼리는 CTE를 사용하여 카테고리 ID 목록을 생성한다. WITH RECURSIVE CategoryTree AS ( ... ) SELECT id FROM CategoryTree
)`
- **`AND b.category_id IN (...)`**: `books` 테이블의 `category_id`가 괄호 안의 서브쿼리가 반환하는 **ID 목록**에 포함되는 경우를 `TRUE`로 판단하는 조건절이다.
- **`WITH RECURSIVE ...`**: SQL 표준 기능으로, 재귀적인(반복적인) 데이터 탐색을 가능하게 하는 임시 결과 집합(CTE)을 정의한다. 여기서는 `CategoryTree`라는 이름의 CTE를 정의하고 있다.

---

### **2. 재귀 CTE `CategoryTree` 문법 상세 설명**

`WITH RECURSIVE CategoryTree AS (...)` 구문은 두 가지 핵심 부분으로 구성된다.

SQL

- `- Anchor Member (기본 멤버 또는 시작점)
SELECT id FROM categories WHERE id = ?
UNION ALL
-- Recursive Member (재귀 멤버 또는 반복 부분)
SELECT c.id FROM categories c
JOIN CategoryTree ct ON c.parent_id = ct.id`

**1) Anchor Member (앵커 멤버): 재귀의 시작점**

- `SELECT id FROM categories WHERE id = ?`
- 이 부분은 재귀 탐색의 **시작점**을 정의한다.
- `?`에 사용자가 선택한 최상위 카테고리 ID(예: '국내도서'의 ID)가 전달되면, 해당 ID를 첫 번째 결과로 `CategoryTree`에 포함시킨다.
- 이 쿼리는 단 한 번만 실행되며, 재귀의 기반이 된다.

**2) Recursive Member (재귀 멤버): 반복 탐색**

- `SELECT c.id FROM categories c JOIN CategoryTree ct ON c.parent_id = ct.id`
- 이 부분은 **반복적으로 실행**되며, 계층 구조를 한 단계씩 아래로 탐색한다.
- `JOIN CategoryTree ct ON c.parent_id = ct.id`가 핵심이다. 이는 **이전 단계에서 `CategoryTree`에 포함된 ID(`ct.id`)를 부모 ID(`c.parent_id`)로 가지는 자식 카테고리를 찾는** 역할을 한다.
- 이 쿼리는 더 이상 하위 카테고리를 찾을 수 없을 때까지(결과가 없을 때까지) 반복적으로 실행된다.

**3) `UNION ALL`**

- Anchor Member의 결과와 Recursive Member가 반복 실행되며 생성하는 모든 결과를 하나로 합치는 역할을 한다.
- `UNION` 대신 `UNION ALL`을 사용하는 이유는 중복 제거 과정을 생략하여 성능을 높이기 위함이다. (카테고리 ID는 고유하므로 중복될 일이 없다.)

---

### **3. 단계별 실행 흐름 (Execution Flow)**

`category_id = 1` ('국내도서')을 기준으로 탐색하는 경우를 예로 들어 설명한다.

**[Iteration 0] - Anchor Member 실행**

1. `SELECT id FROM categories WHERE id = 1`이 실행된다.
2. `CategoryTree`의 임시 결과 집합은 `{1}`이 된다.

**[Iteration 1] - Recursive Member 첫 번째 실행**

1. `JOIN CategoryTree ct ON c.parent_id = ct.id` 쿼리가 실행된다. 현재 `ct.id`는 `1`이다.
2. `... WHERE c.parent_id = 1` 과 동일하게 동작하여 `parent_id`가 1인 자식 카테고리들(예: '소설'(ID: 2), '경제/경영'(ID: 3))을 찾는다.
3. 이번 반복의 결과로 `{2, 3}`이 생성된다.
4. `UNION ALL`에 의해 `CategoryTree`의 임시 결과 집합은 `{1, 2, 3}`으로 확장된다.

**[Iteration 2] - Recursive Member 두 번째 실행**

1. 다시 `JOIN CategoryTree ct ON c.parent_id = ct.id` 쿼리가 실행된다. 이번에는 이전 반복의 결과인 `{2, 3}`을 `ct.id`로 사용한다.
2. `... WHERE c.parent_id IN (2, 3)` 과 동일하게 동작한다.
3. `parent_id`가 2인 자식 카테고리(예: '현대소설'(ID: 10))와 `parent_id`가 3인 자식 카테고리(예: '마케팅'(ID: 15))를 찾는다.
4. 이번 반복의 결과로 `{10, 15}`가 생성된다.
5. `UNION ALL`에 의해 `CategoryTree`의 임시 결과 집합은 `{1, 2, 3, 10, 15}`로 확장된다.

**[Iteration N] - 종료 조건**

- 이 과정은 Recursive Member가 더 이상 어떠한 행도 반환하지 않을 때(즉, 더 이상 하위 카테고리가 없을 때)까지 반복된다.

**최종 결과 반환**

- 모든 반복이 끝나면, `SELECT id FROM CategoryTree` 쿼리가 최종적으로 누적된 `CategoryTree`의 모든 ID 목록(`{1, 2, 3, 10, 15, ...}`)을 반환한다.
- 이 목록이 `AND b.category_id IN (...)` 조건절에 사용되어, '국내도서'를 포함한 모든 하위 카테고리에 속한 도서들을 한 번에 필터링하게 된다.
