# 데모 링크 (Demo Link)

## 소개

[월부 개발 블로그](https://medium.com/weolbu/%EC%9B%94%EB%B6%80%EC%9D%98-%EC%9E%90%EC%B2%B4-%EB%8B%A8%EC%B6%95-url%EA%B0%9C%EB%B0%9C%EA%B8%B0-3e174e02bb1f)에 있는 글을 보고 만든 단축 URL 서비스입니다. 긴 URL을 짧은 링크로 변환하여 공유하기 쉽게 만들어주는 서비스입니다.

## 기능

- 단축 URL 생성 및 관리
- 단축 URL 리다이렉션
- 클릭 통계 및 분석
- 모바일 친화적인 UI/UX

## 기술 스택

- [Next.js 15](https://nextjs.org/) - React 프레임워크
- [TypeScript](https://www.typescriptlang.org/) - 정적 타입 언어
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [pnpm](https://pnpm.io/) - 패키지 매니저

## 설치 및 실행

### 전제 조건

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상
- Supabase 계정

### 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/demo-link.git
cd demo-link
```

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 다음 변수들을 설정합니다:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key  # 관리자 기능에 필요
```

4. 개발 서버 실행

```bash
pnpm dev
```

5. 브라우저에서 확인

브라우저에서 http://localhost:3000 을 열어 애플리케이션을 확인합니다.

## 초기 관리자 설정

이 애플리케이션은 사용자 승인 시스템을 사용합니다. 첫 관리자 계정을 설정하려면:

1. **대화형 스크립트 사용 (권장)**
   ```bash
   pnpm run seed:admin
   ```

2. **SQL을 통한 직접 설정**
   - Supabase 대시보드의 SQL 에디터 사용
   - 자세한 방법은 [관리자 설정 가이드](docs/ADMIN_SETUP.md) 참조

3. **환경 변수를 통한 자동 승인**
   - `.env.local`에 `INITIAL_ADMIN_EMAIL` 설정
   - 해당 이메일로 가입 시 자동으로 관리자 권한 부여

📚 **자세한 설정 방법은 [관리자 설정 가이드](docs/ADMIN_SETUP.md)를 참조하세요.**

## 데이터베이스 구성

이 프로젝트는 Supabase를 데이터베이스로 사용합니다. 

### 마이그레이션 실행

```bash
pnpm run db:push
```

### 주요 테이블 구조

#### `profiles` 테이블 (사용자 프로필)
- `id`: 사용자 ID (auth.users 참조)
- `email`: 이메일 주소
- `role`: 사용자 역할 (user/admin) - PostgreSQL enum
- `status`: 계정 상태 (pending/approved/rejected) - PostgreSQL enum
- `created_at`, `updated_at`: 타임스탬프
- `approved_at`, `approved_by`: 승인 정보
- `rejected_at`, `rejected_by`, `rejection_reason`: 거절 정보

#### `links` 테이블 (단축 URL)
- `id`: 링크 ID
- `slug`: 단축 URL 슬러그
- `original_url`: 원본 URL
- `user_id`: 생성한 사용자 ID
- `click_count`: 클릭 수
- `created_at`: 생성 시간

#### `link_clicks` 테이블 (클릭 기록)
- `id`: 클릭 ID
- `link_id`: 링크 ID 참조
- `clicked_at`: 클릭 시간
- `user_agent`: 사용자 에이전트
- `ip_address`: IP 주소

### 데이터베이스 타입 생성

타입스크립트 타입을 Supabase 스키마에서 자동 생성:

```bash
pnpm run gen:types
```

## 프로젝트 구조

```
├── src/
│   ├── app/              # Next.js 앱 디렉토리
│   │   ├── admin/        # 관리자 페이지
│   │   └── [slug]/       # 동적 리다이렉션 페이지
│   ├── features/         # 기능별 모듈
│   │   ├── auth/         # 인증 관련 기능
│   │   ├── links/        # 링크 관리 기능
│   │   └── analytics/    # 분석 기능
│   ├── shared/           # 공유 모듈
│   │   ├── components/   # 공통 컴포넌트
│   │   ├── types/        # 공통 타입
│   │   └── utils/        # 유틸리티 함수
│   └── lib/              # 외부 라이브러리 설정
├── supabase/
│   └── migrations/       # 데이터베이스 마이그레이션
├── scripts/              # 유틸리티 스크립트
│   └── seed-admin.ts     # 관리자 생성 스크립트
├── docs/                 # 문서
│   └── ADMIN_SETUP.md    # 관리자 설정 가이드
├── public/               # 정적 파일
├── .env.example          # 환경 변수 예제
└── README.md             # 프로젝트 설명
```

## 주요 기능

### 사용자 관리 시스템
- 사용자 가입 시 관리자 승인 필요
- 역할 기반 접근 제어 (RBAC)
- 관리자 대시보드에서 사용자 관리

### URL 단축 기능
- Snowflake 알고리즘 기반 고유 ID 생성
- 사용자별 링크 관리
- 실시간 클릭 통계

### 관리자 기능
- 사용자 승인/거절
- 역할 변경 (user/admin)
- 전체 링크 및 통계 관리

## 라이센스

MIT License
