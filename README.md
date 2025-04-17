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
```

4. 개발 서버 실행

```bash
pnpm dev
```

5. 브라우저에서 확인

브라우저에서 http://localhost:3000 을 열어 애플리케이션을 확인합니다.

## 데이터베이스 구성

이 프로젝트는 Supabase를 데이터베이스로 사용합니다. 다음 테이블을 생성해야 합니다:

### `links` 테이블

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  click_count INTEGER DEFAULT 0
);
```

### `link_clicks` 테이블

```sql
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);
```

### 클릭 카운트 증가 함수

```sql
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;
```

## 프로젝트 구조

```
├── src/
│   ├── actions/          # 서버 액션
│   ├── app/              # Next.js 앱 디렉토리
│   ├── components/       # 재사용 가능한 컴포넌트
│   ├── containers/       # 페이지 컨테이너
│   ├── lib/              # 유틸리티 및 헬퍼 함수
│   ├── services/         # 데이터 서비스
│   └── types/            # TypeScript 타입 정의
├── public/               # 정적 파일
├── .env.example          # 환경 변수 예제
└── README.md             # 프로젝트 설명
```

## 라이센스

MIT License
