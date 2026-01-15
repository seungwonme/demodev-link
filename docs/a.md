# Claude Code의 200K 한계를 뛰어넘는 방법 - Repomix + Gemini 무료 활용법

## 인트로 (Hook)

안녕하세요. 오늘은 Claude Code를 사용하면서 겪는 가장 큰 불편함, 바로 **200K 토큰 컨텍스트 한계**를 해결하는 방법을 알려드리겠습니다.

"아 코드베이스가 커서 Claude가 전체 맥락을 못 보네..."
"컨텍스트가 부족해서 자꾸 엉뚱한 코드를 생성하네..."

이런 경험 다들 있으시죠?

오늘 소개하는 방법을 쓰면, **무료로** 여러분의 전체 코드베이스를 AI에게 제공할 수 있습니다.

---

## 1. Claude Code의 현실적인 한계

Claude Code는 정말 강력한 도구입니다. 하지만 한 가지 명확한 한계가 있어요.

바로 **200K 토큰 컨텍스트 윈도우**입니다.

여기서 200K가 전부 코드에 사용되는 게 아닙니다.

- **시스템 프롬프트**: 약 10-20K 토큰
- **MCP 도구 정의**: 도구당 수천 토큰 (많으면 100K 이상!)
- **이전 대화 기록**: 누적됨
- **실제 코드에 쓸 수 있는 공간**: 생각보다 적음

실제로 Claude Code는 75% 사용률(약 150K)에서 자동 압축을 시작합니다. 왜냐하면 추론을 위한 여유 공간(약 50K)이 필요하기 때문이죠.

중간 규모 이상의 프로젝트라면, 전체 코드베이스를 Claude에게 한 번에 보여주는 건 사실상 불가능합니다.

---

## 2. Gemini의 압도적인 컨텍스트 윈도우

여기서 Gemini가 등장합니다.

**Gemini 2.0 Flash**: 1M (100만) 토큰 컨텍스트
**Gemini 2.0 Pro**: 2M (200만) 토큰 컨텍스트

Claude의 200K와 비교하면 **5배에서 10배** 차이가 납니다.

### 그리고 가장 중요한 점: Google AI Studio에서 무료로 사용 가능

| 모델 | 무료 티어 제한 |
|------|----------------|
| Gemini 2.5 Pro | 분당 5회, 하루 100회 |
| Gemini 2.5 Flash | 분당 10회, 하루 250회 |
| Gemini 2.0 Flash | 분당 15회, 하루 200회, **1M 토큰 컨텍스트** |

네, 맞습니다. **무료**로 100만 토큰짜리 컨텍스트 윈도우를 사용할 수 있습니다.

물론 속도 제한이 있지만, 코드베이스 분석이나 계획 수립에는 충분합니다.

---

## 3. Repomix: 코드베이스를 AI-친화적으로 패키징

자, 그럼 어떻게 우리 코드베이스를 Gemini에게 전달할까요?

여기서 **Repomix**라는 도구가 빛을 발합니다.

### Repomix란?

Repomix는 여러분의 코드베이스를 **하나의 파일로 패키징**해주는 도구입니다.

```bash
# 설치 없이 바로 실행
npx repomix
```

이 한 줄이면 끝입니다.

실행하면 `repomix-output.xml` (또는 markdown) 파일이 생성되는데, 이 파일 안에:

- 프로젝트 디렉토리 구조
- 모든 소스 코드 파일 내용
- 파일별 토큰 수
- 전체 토큰 수 요약

이 모든 게 AI가 이해하기 쉬운 형태로 정리됩니다.

### Repomix의 핵심 기능

1. **Git-Aware**: `.gitignore`를 자동으로 인식해서 `node_modules` 같은 건 알아서 제외
2. **보안 체크**: Secretlint 내장으로 API 키 같은 민감 정보 유출 방지
3. **토큰 카운팅**: LLM 컨텍스트 제한에 맞춰 토큰 수를 미리 계산

---

## 4. 실전 워크플로우: Cursor처럼 사용하기

이제 실제로 어떻게 활용하는지 보여드릴게요.

### Step 1: Repomix로 코드베이스 패키징

```bash
cd your-project
npx repomix
```

### Step 2: Google AI Studio 접속

[aistudio.google.com](https://aistudio.google.com) 으로 이동합니다.

### Step 3: 코드베이스 업로드 + 질문

생성된 `repomix-output.xml` 파일을 업로드하고, 원하는 질문을 합니다.

예를 들어:
- "이 프로젝트의 전체 아키텍처를 설명해줘"
- "인증 플로우가 어떻게 동작하는지 분석해줘"
- "이 기능을 구현하려면 어떤 파일들을 수정해야 할까?"

### 코드 작성 요청 vs 계획 문서

여기서 중요한 팁입니다.

Gemini에게 직접 코드를 작성해달라고 요청해도 됩니다. 하지만 제가 추천하는 방법은 **계획 문서를 먼저 받는 것**입니다.

왜냐하면:

1. **전체 맥락을 파악한 상세한 계획**을 받을 수 있음
2. 이 계획을 다시 Claude Code나 Cursor에 넣으면 **더 정확한 코드 생성**
3. 계획 단계에서 잘못된 방향을 **미리 수정** 가능

실제로 많은 개발자들이 이 워크플로우를 사용합니다:

```
Repomix → Gemini (계획 수립) → Claude Code/Cursor (실행)
```

이렇게 하면 Cursor의 유료 기능 없이도 비슷한 경험을 할 수 있습니다.

---

## 5. 코드베이스가 너무 클 때: Include/Ignore 패턴 활용

자, 여기서 한 가지 문제가 생길 수 있습니다.

"내 프로젝트가 너무 커서 Repomix 출력이 100만 토큰을 넘어요..."

걱정 마세요. Repomix는 강력한 필터링 기능을 제공합니다.

### Include 패턴: 필요한 것만 포함

```bash
# TypeScript 파일만 포함
npx repomix --include "**/*.ts,**/*.tsx"

# src 디렉토리만 포함
npx repomix --include "src/**/*"

# 여러 패턴 조합
npx repomix --include "src/**/*.ts,**/*.md"
```

### Ignore 패턴: 불필요한 것 제외

```bash
# 테스트 파일 제외
npx repomix --ignore "**/*.test.ts,**/*.spec.ts"

# 특정 디렉토리 제외
npx repomix --ignore "docs/**,examples/**"

# 로그 파일 제외
npx repomix --ignore "**/*.log,tmp/**"
```

### 설정 파일로 영구 저장

매번 옵션을 입력하기 귀찮다면, `repomix.config.json`을 만드세요:

```json
{
  "include": ["src/**/*", "lib/**/*"],
  "ignore": {
    "customPatterns": ["**/*.test.ts", "**/*.spec.ts", "docs/**"]
  },
  "output": {
    "style": "xml",
    "filePath": "repomix-output.xml"
  }
}
```

이제 `npx repomix`만 실행하면 설정이 자동 적용됩니다.

### 실전 팁: 기능별로 분리 패키징

대형 프로젝트라면 전체를 한 번에 패키징하지 말고, **기능별로 분리**하세요:

```bash
# 인증 관련만
npx repomix --include "src/features/auth/**/*" -o auth-context.xml

# API 관련만
npx repomix --include "src/app/api/**/*" -o api-context.xml

# 특정 기능 작업 시 관련 부분만
npx repomix --include "src/features/payments/**/*,src/lib/stripe/**/*" -o payments-context.xml
```

이렇게 하면 작업에 필요한 부분만 정확히 Gemini에게 전달할 수 있습니다.

---

## 6. 더 쉬운 방법: Claude Code에게 Repomix 실행 맡기기

"옵션 외우기 귀찮은데... 그냥 Claude Code한테 시키면 안 돼요?"

네, 가능합니다. Claude Code에게 직접 Repomix를 실행하라고 시킬 수 있어요.

```
"src/features/auth 폴더만 repomix로 패키징해줘"
```

이렇게 요청하면 Claude Code가 알아서 명령어를 만들어서 실행합니다.

### 하지만 문제가 있습니다

Claude Code가 Repomix 명령어를 **정확하게 기억하지 못할 수 있습니다**.

- 옵션 이름을 잘못 쓰거나
- glob 패턴 문법이 틀리거나
- 없는 옵션을 만들어내거나

AI가 hallucination(환각)을 일으킬 수 있다는 거죠.

특히 Repomix처럼 자주 업데이트되는 도구는, Claude의 학습 데이터에 최신 버전이 반영되지 않았을 가능성이 높습니다.

---

## 7. 해결책: MCP 서버로 Repomix 연동하기

여기서 **MCP (Model Context Protocol)** 가 등장합니다.

MCP는 Claude Code에 외부 도구를 **공식적으로 연결**하는 프로토콜입니다. MCP로 Repomix를 연결하면:

1. Claude Code가 Repomix의 **정확한 옵션과 사용법**을 알게 됨
2. 환각 없이 **올바른 명령어**를 실행
3. 결과물을 바로 컨텍스트에 로드 가능

### MCP 설정 방법 (1분이면 끝)

터미널에서 **딱 한 줄**만 입력하면 됩니다:

```bash
claude mcp add repomix -- npx -y repomix --mcp
```

끝입니다. 정말 이게 전부예요.

이 명령어가 하는 일:
- `claude mcp add`: Claude Code에 MCP 서버 추가
- `repomix`: 서버 이름 (원하는 이름으로 변경 가능)
- `-- npx -y repomix --mcp`: 실행할 명령어

### 설정 확인하기

제대로 설정됐는지 확인하려면:

```bash
claude mcp list
```

`repomix`가 목록에 보이면 성공입니다.

### (참고) 수동 설정 방법

만약 JSON으로 직접 설정하고 싶다면, `~/.claude.json` 또는 프로젝트의 `.mcp.json`에 추가:

```json
{
  "mcpServers": {
    "repomix": {
      "command": "npx",
      "args": ["-y", "repomix", "--mcp"]
    }
  }
}
```

---

## 8. MCP 연동 후 실제 사용 예시

MCP를 설정하고 나면, Claude Code와의 대화가 완전히 달라집니다.

### 예시 1: 기본 패키징

**프롬프트:**
```
현재 프로젝트를 repomix로 패키징해줘
```

**Claude Code 응답:**
```
pack_codebase 도구를 사용해서 현재 디렉토리를 패키징하겠습니다.

[MCP 도구 실행: pack_codebase]
- directory: /Users/you/your-project
- style: xml

패키징 완료! 총 45,230 토큰, 127개 파일이 포함되었습니다.
```

### 예시 2: 특정 폴더만 패키징

**프롬프트:**
```
src/features/auth 폴더만 repomix로 패키징하고 테스트 파일은 제외해줘
```

**Claude Code 응답:**
```
[MCP 도구 실행: pack_codebase]
- directory: /Users/you/your-project
- includePatterns: src/features/auth/**/*
- ignorePatterns: **/*.test.ts,**/*.spec.ts

완료! auth 관련 코드만 추출했습니다. 총 8,420 토큰.
```

### 예시 3: GitHub 저장소 분석

**프롬프트:**
```
https://github.com/vercel/next.js 저장소의 src/client 폴더를 분석해줘
```

**Claude Code 응답:**
```
[MCP 도구 실행: pack_remote_repository]
- remote: vercel/next.js
- includePatterns: packages/next/src/client/**/*

원격 저장소를 클론하고 패키징했습니다...
```

### 예시 4: 패키징 후 바로 분석

**프롬프트:**
```
이 프로젝트를 repomix로 패키징하고, 전체 아키텍처를 설명해줘
```

Claude Code가 MCP로 패키징 → 결과를 컨텍스트에 로드 → 바로 분석까지 한 번에 처리합니다.

---

## 9. MCP의 진짜 장점: Grep과 검색 기능

MCP로 연결하면 `pack_codebase` 말고도 유용한 도구들이 있습니다:

### grep_repomix_output: 패키징 결과 내 검색

```
패키징 결과에서 "useAuth" 훅이 사용된 부분을 모두 찾아줘
```

Claude Code가 `grep_repomix_output` 도구로 정확히 검색합니다.

### read_repomix_output: 특정 부분만 읽기

대용량 패키징 결과에서 특정 라인만 읽을 수 있어요. 컨텍스트를 효율적으로 사용할 수 있습니다.

### file_system_read_file: 개별 파일 읽기

패키징 없이 특정 파일만 빠르게 확인할 때 사용합니다.

---

## 10. 정리: 전체 워크플로우

오늘 배운 내용을 정리하면:

### 방법 1: 수동 워크플로우 (Gemini 활용)

```
npx repomix → repomix-output.xml 생성 → Google AI Studio 업로드 → 계획 수립 → Claude Code로 실행
```

**장점**: 무료로 1M+ 토큰 컨텍스트 활용
**단점**: 수동으로 파일 옮기는 과정 필요

### 방법 2: MCP 연동 워크플로우 (자동화)

```bash
# 1회 설정
claude mcp add repomix -- npx -y repomix --mcp
```

```
Claude Code에게 자연어로 요청 → MCP가 정확한 명령 실행 → 결과 자동 로드
```

**장점**: 한 번 설정하면 자연어로 모든 작업 가능, 환각 없음
**단점**: Claude Code 컨텍스트 내에서만 사용 (200K 제한)

### 추천 조합

| 상황 | 추천 방법 |
|------|-----------|
| 전체 아키텍처 파악, 대규모 계획 | **Gemini + 수동 패키징** |
| 특정 기능 작업, 빠른 분석 | **Claude Code + MCP** |
| 둘 다 필요할 때 | MCP로 패키징 → XML 파일을 Gemini에 업로드 |

### 핵심 명령어 요약

```bash
# Repomix 기본 실행
npx repomix

# 특정 폴더만 포함
npx repomix --include "src/**/*"

# 테스트 파일 제외
npx repomix --ignore "**/*.test.ts"

# MCP 서버 추가 (1회만)
claude mcp add repomix -- npx -y repomix --mcp

# MCP 서버 확인
claude mcp list
```

---

## 마무리

오늘 다룬 내용:

1. **Claude Code 200K 한계**와 실제 사용 가능한 컨텍스트
2. **Gemini 무료 티어**로 1M 토큰 컨텍스트 활용하기
3. **Repomix**로 코드베이스 패키징하는 법
4. **Include/Ignore 패턴**으로 필요한 부분만 추출
5. **MCP 연동**으로 Claude Code에서 자동화하기

이제 여러분도 대형 코드베이스를 무료로, 효과적으로 다룰 수 있습니다.

도움이 되셨다면 좋아요와 구독 부탁드립니다. 감사합니다!

---

## 참고 링크

- Repomix 공식 사이트: https://repomix.com
- Google AI Studio: https://aistudio.google.com
- Repomix GitHub: https://github.com/yamadashy/repomix
