# DemoLink 인증 및 권한 관리 개선 작업 상세 내역

## 1. 로그인 상태 관리 개선

### 1.1. 미들웨어 수정 (src/middleware.ts)

#### 라우트 패턴 수정

- 미들웨어 matcher 패턴에 `/api/:path*` 추가
  ```typescript
  export const config = {
    matcher: ["/profile/:path*", "/login", "/api/:path*"],
  };
  ```
- 이전에는 `/analytics/:path*`, `/profile/:path*`, `/login` 경로만 처리했으나, API 경로도 포함하여 인증 체크가 필요한 API 요청도 처리하도록 개선

#### 세션 체크 로직 강화

- `createClient` 호출 시 `persistSession: false` 설정을 유지하여 미들웨어에서는 항상 최신 세션 정보 확인
  ```typescript
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );
  ```
- 이를 통해 미들웨어 레벨에서 정확한 인증 상태 확인 가능

#### 라우팅 로직 최적화

- 비로그인 상태에서 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  ```typescript
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  ```
- 로그인 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트하여 불필요한 로그인 페이지 노출 방지
  ```typescript
  if (requestUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  ```

### 1.2. 세션 유지 설정 개선 (src/lib/supabase.ts)

#### 클라이언트 세션 유지 활성화

- Supabase 클라이언트 생성 시 `persistSession` 옵션을 `true`로 변경
  ```typescript
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
      },
    },
  );
  ```
- 이전에는 `false`로 설정되어 있어 페이지 새로고침 시 세션이 유지되지 않는 문제가 있었음
- 브라우저 스토리지에 세션 정보를 저장하여 페이지 이동 및 새로고침 시에도 로그인 상태 유지

## 2. 인증 기반 접근 제어 구현

### 2.1. URL 단축 기능 인증 필수화

#### 서버 액션 수정 (src/actions/shorten-url.ts)

- 액션 시작 시 Supabase 세션 체크 로직 추가

  ```typescript
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인되지 않은 경우 오류 반환
  if (!session) {
    throw new Error("URL 단축 기능은 로그인 후 이용 가능합니다.");
  }
  ```

- 오류 핸들링 개선: Error 인스턴스 확인 후 메시지 전달
  ```typescript
  catch (error) {
    console.error("Error shortening URL:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("URL을 단축하는 중 오류가 발생했습니다.");
  }
  ```

#### 서비스 레이어 수정 (src/services/link.service.ts)

- `createShortLink` 메서드에 세션 체크 로직 추가

  ```typescript
  // 현재 사용자의 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인되지 않은 경우 오류 반환
  if (!session) {
    throw new Error("URL 단축 기능은 로그인 후 이용 가능합니다.");
  }
  ```

- 이중 보안 체크로 클라이언트와 서버 모두에서 인증 검증

### 2.2. 링크 생성 시 사용자 정보 저장

#### 링크 생성 쿼리 수정 (src/services/link.service.ts)

- 링크 데이터에 현재 로그인한 사용자 ID 추가
  ```typescript
  const { data: link, error } = await supabase
    .from(this.TABLE_NAME)
    .insert([
      {
        slug,
        original_url: data.original_url,
        click_count: 0,
        user_id: session.user.id, // 현재 로그인한 사용자의 ID 저장
      },
    ])
    .select()
    .single();
  ```
- 이를 통해 사용자별 링크 관리 및 권한 체크의 기반 마련

## 3. UI/UX 개선

### 3.1. 네비게이션 바 개선 (src/components/nav.tsx)

#### 사용자 인증 상태 관리 추가

- 컴포넌트 로드 시 사용자 세션 확인 로직 추가

  ```typescript
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchUser();
  }, []);
  ```

#### 프로필 링크 조건부 접근 제어

- 프로필 링크 클릭 핸들러 추가
  ```typescript
  // 프로필 링크 클릭 핸들러
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push("/login");
    }
  };
  ```
- 네비게이션 바에 프로필 링크 추가 및 스타일 조건부 적용
  ```tsx
  <Link
    href="/profile"
    className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
      !user ? "opacity-50" : ""
    }`}
    onClick={handleProfileClick}
  >
    프로필
  </Link>
  ```

#### 인증 상태 컴포넌트 통합

- AuthStatus 컴포넌트 추가
  ```tsx
  <AuthStatus />
  ```
- 모바일 메뉴에도 동일한 접근 제어 적용
  ```tsx
  <Link
    href="/profile"
    className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground ${
      !user ? "opacity-50" : ""
    }`}
    onClick={(e) => {
      setIsOpen(false);
      handleProfileClick(e);
    }}
  >
    프로필
  </Link>
  <div className="px-3 py-2">
    <AuthStatus />
  </div>
  ```

### 3.2. URL 입력 폼 개선 (src/components/url/url-input-form.tsx)

#### 인증 상태 감지 로직 추가

- 컴포넌트에 로그인 상태 확인 기능 추가

  ```typescript
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      // 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuthStatus();
  }, []);
  ```

#### 폼 제출 시 인증 체크

- handleSubmit 함수에 로그인 상태 체크 로직 추가
  ```typescript
  // 로그인 상태 체크
  if (!isLoggedIn) {
    handleError("URL 단축 기능은 로그인 후 이용 가능합니다.");
    return;
  }
  ```

#### 조건부 UI 렌더링

- 로그인 상태 로딩 중일 때 로딩 인디케이터 표시
  ```tsx
  // 아직 로그인 상태 확인 중이라면 로딩 표시
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  ```
- 비로그인 상태일 때 안내 메시지 및 로그인 버튼 표시
  ```tsx
  // 로그인하지 않은 경우 안내 메시지 표시
  if (isLoggedIn === false) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 mr-2 text-yellow-500 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-700">
              URL 단축 기능은 로그인 후 이용 가능합니다.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }
  ```

### 3.3. 반응형 디자인 강화

#### 모바일 메뉴 구조 최적화

- 메뉴 버튼과 데스크톱 메뉴 위치 조정하여 일관된 UI 제공

  ```tsx
  {
    /* Desktop menu */
  }
  <div className="hidden md:flex md:items-center md:space-x-4">
    {/* 네비게이션 아이템들 */}
  </div>;

  {
    /* Mobile menu button */
  }
  <div className="flex md:hidden">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    >
      <span className="sr-only">메뉴 열기</span>
      {isOpen ? (
        <XMarkIcon className="block h-6 w-6" />
      ) : (
        <Bars3Icon className="block h-6 w-6" />
      )}
    </button>
  </div>;
  ```

#### 모바일 메뉴 접근성 개선

- 모바일 메뉴에 프로필 링크 동작 및 스타일 일관성 유지
  ```tsx
  <Link
    href="/profile"
    className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground ${
      !user ? "opacity-50" : ""
    }`}
    onClick={(e) => {
      setIsOpen(false);
      handleProfileClick(e);
    }}
  >
    프로필
  </Link>
  ```

## 4. 코드 구조 및 타입 개선

### 4.1. 타입 정의 개선 (src/types/supabase.ts)

#### 데이터베이스 타입 정리

- Database 타입 내에 테이블 구조 상세 정의
  ```typescript
  export type Database = {
    public: {
      Tables: {
        link_clicks: {
          Row: {
            clicked_at: string | null;
            id: string;
            ip_address: string | null;
            link_id: string;
            user_agent: string | null;
          };
          // Insert, Update 타입들...
          Relationships: [
            {
              foreignKeyName: "link_clicks_link_id_fkey";
              columns: ["link_id"];
              isOneToOne: false;
              referencedRelation: "links";
              referencedColumns: ["id"];
            },
          ];
        };
        // links 테이블 정의...
      };
      // 기타 정의들...
    };
  };
  ```

#### 타입 참조 방식 개선

- 기존 인터페이스 대신 데이터베이스 스키마 타입 직접 참조

  ```typescript
  // 이전
  // export interface Link { ... }
  // export interface LinkClick { ... }

  // 개선
  export type Link = Database["public"]["Tables"]["links"]["Row"];
  export type LinkClick = Database["public"]["Tables"]["link_clicks"]["Row"];
  ```

### 4.2. 에러 처리 강화

#### 일관된 에러 처리 패턴 적용

- 모든 try-catch 블록에서 Error 인스턴스 확인 후 메시지 전달
  ```typescript
  try {
    // 코드...
  } catch (error) {
    console.error("Error message:", error);
    if (error instanceof Error) {
      throw error; // 원본 에러 그대로 전달
    }
    throw new Error("기본 에러 메시지"); // 알 수 없는 에러 타입일 경우
  }
  ```

#### 사용자 친화적 오류 메시지

- 구체적인 오류 상황에 맞는 메시지 제공

  ```typescript
  // 예: 인증 관련 오류
  throw new Error("URL 단축 기능은 로그인 후 이용 가능합니다.");

  // 예: 데이터베이스 조회 오류
  throw new Error("단축 URL 생성 중 오류가 발생했습니다.");
  ```

## 5. 테마 지원 개선

#### 다크 모드 스타일 추가

- 링크 리스트의 Card 컴포넌트에 다크 모드 hover 스타일 추가
  ```tsx
  <Card
    key={link.id}
    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
    onClick={() =>
      setSelectedLink(selectedLink?.id === link.id ? null : link)
    }
  >
  ```

#### 테마 전환 UI 구현

- 데스크톱과 모바일 환경에서 일관된 테마 전환 버튼 구현

  ```tsx
  {
    /* 데스크톱 테마 버튼 */
  }
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  >
    <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    <span className="sr-only">테마 변경</span>
  </Button>;

  {
    /* 모바일 테마 버튼 */
  }
  <Button
    variant="ghost"
    size="sm"
    className="justify-start"
    onClick={() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setIsOpen(false);
    }}
  >
    <SunIcon className="mr-2 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    테마 변경
  </Button>;
  ```

## 6. 기타 개선사항

### 6.1. 코드 포맷팅 통일

- 일관된 들여쓰기 및 코드 스타일 적용
- 주석 추가로 코드 가독성 향상

### 6.2. 안정성 검증

- 모든 경로 및 기능에 대한 동작 테스트 수행
- 로그인/로그아웃 시 페이지 리다이렉트 및 URL 단축 기능 접근 제어 검증

## 요약 및 효과

이번 작업은 인증 기반 접근 제어를 구현하여 로그인한 사용자만 URL 단축 기능을 사용할 수 있도록 개선했습니다. 보안 측면에서 서버 액션과 서비스 레이어 양쪽에서 인증 체크를 수행하여 이중 보안을 적용하였고, UI/UX 측면에서는 로그인 상태에 따라 적절한 인터페이스를 제공함으로써 사용자 경험을 향상시켰습니다. 또한 미들웨어, 타입 시스템, 에러 처리 등 다양한 측면에서의 개선을 통해 전반적인 코드 품질과 유지보수성을 높였습니다.
