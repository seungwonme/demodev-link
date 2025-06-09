"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateLinkDescription(linkId: string, description: string) {
  const supabase = await createClient();
  
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }
  
  // 링크 소유자 확인
  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("user_id")
    .eq("id", linkId)
    .single();
    
  if (linkError || !link) {
    return { error: "링크를 찾을 수 없습니다." };
  }
  
  // 사용자 프로필 확인 (관리자 여부)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  // 소유자가 아니고 관리자도 아닌 경우 거부
  if (link.user_id !== user.id && profile?.role !== "admin") {
    return { error: "이 링크를 수정할 권한이 없습니다." };
  }
  
  // 설명 업데이트
  const { error: updateError } = await supabase
    .from("links")
    .update({ description: description.trim() || null })
    .eq("id", linkId);
    
  if (updateError) {
    console.error("Error updating link description:", updateError);
    return { error: "설명 업데이트 중 오류가 발생했습니다." };
  }
  
  return { success: true };
}