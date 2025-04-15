# PRD: Linkly 클론 URL 단축기 MVP

## 1. 📌 제품명

demodev-link

## 2. 🎯 제품 목표

링크를 입력하면 자동으로 짧은 URL을 생성해주고, 생성된 단축 URL로 접속하면 원본 링크로 리다이렉트되는 웹 서비스

## 3. 🧪 주요 기능 (MVP 기준)

기능 설명
URL 입력 및 단축 사용자가 긴 URL을 입력하면 자동으로 짧은 slug를 생성하고 DB에 저장
단축 URL 생성 생성된 URL은 ex) https://demodev-link.vercel.app/abc123 형식
단축 URL 접속 시 리다이렉트 사용자가 단축 URL에 접속하면 원본 URL로 이동
클릭 수 집계 단축 URL이 클릭될 때마다 click count 증가

## 4. 📐 화면 구성

1. 홈 페이지 (/)

   - URL 입력 필드
   - “단축하기” 버튼
   - 결과로 단축된 URL 노출

2. 리다이렉트 페이지 (/[slug])
   - slug를 기준으로 original URL을 조회
   - click count 증가
   - next/navigation의 redirect() 사용해 즉시 이동

## 5. 🛠 기술 스택

구분 기술
프레임워크 Next.js (App Router)
스타일링 Tailwind CSS
데이터베이스 Supabase (PostgreSQL 기반)
배포 Vercel (예정)

## 6. 🗃️ 데이터 모델

Table: links

| 필드명       | 타입          | 설명                   |
| ------------ | ------------- | ---------------------- |
| id           | uuid (PK)     | 고유 식별자            |
| slug         | text (unique) | 단축 URL 식별자        |
| original_url | text          | 원본 URL               |
| created_at   | timestamp     | 생성일자 (default now) |
| click_count  | int           | 클릭 횟수 (default 0)  |

## 7. ⚙️ 유저 플로우

1. 사용자 → /에서 긴 URL 입력
2. “단축하기” 클릭 → POST /api/links 호출
3. Supabase에 slug, original_url 저장
4. 사용자에게 단축된 링크 반환 (https://demodev-link.vercel.app/{slug})
5. 다른 사용자가 {slug}로 접속 시 원래 URL로 이동

## 8. 🚧 예외 처리

| 시나리오                  | 처리 방법                                              |
| ------------------------- | ------------------------------------------------------ |
| 존재하지 않는 slug로 접근 | 404 페이지 또는 “존재하지 않는 링크입니다” 메시지 표시 |
| Supabase 삽입 실패        | alert로 오류 메시지 노출                               |

## 9. 📈 향후 확장 기능 (선택)

| 기능              | 설명                                 |
| ----------------- | ------------------------------------ |
| 사용자 로그인     | 생성한 링크를 계정에 연동            |
| 커스텀 슬러그     | 사용자가 슬러그를 직접 지정 가능     |
| 클릭 분석         | 유입 경로, 기기, 시간대 등 통계 표시 |
| 삭제 및 만료 설정 | 유효 기간 설정, 링크 삭제 기능       |
