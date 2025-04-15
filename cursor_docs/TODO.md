# TODO

## 1. 초기 프로젝트 설정

- [x] Supabase 프로젝트 생성 및 연결
- [x] 환경 변수 설정 (.env)

## 2. 데이터베이스 설정

- [x] Supabase에 'links' 테이블 생성
  - id (uuid, PK)
  - slug (text, unique)
  - original_url (text)
  - created_at (timestamp)
  - click_count (int)

## 3. 컴포넌트 개발

- [x] URL 입력 폼 컴포넌트 (/components/url-input-form.tsx)
- [x] 결과 표시 컴포넌트 (/components/shortened-url-result.tsx)
- [x] 로딩 상태 컴포넌트 (/components/ui/loading.tsx)
- [x] 에러 메시지 컴포넌트 (/components/ui/error-message.tsx)

## 4. 페이지 구현

- [x] 메인 페이지 레이아웃 구현 (/)
- [x] 리다이렉트 페이지 구현 (/[slug])
- [x] 404 페이지 구현

## 5. 기능 구현

- [x] URL 단축 로직 구현 (/actions/shorten-url.ts)
- [x] 리다이렉트 로직 구현 (/actions/redirect-url.ts)
- [x] 클릭 수 집계 로직 구현

## 6. 테스트 및 배포

- [x] 기능 테스트
- [x] Vercel 배포 설정

## 7. 추가 기능

- [x] 클릭 수 집계 시각화 기능 추가
- [ ] supabase 사용자 인증 기능 추가
- [ ] 오류 처리 강화

https://posthog.com/tutorials/nextjs-supabase-signup-funnel
https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
