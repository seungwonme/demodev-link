"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthResult =
  | {
      success: string;
      error?: undefined;
      data?: any;
    }
  | {
      error: string;
      success?: undefined;
      data?: any;
    };

export async function login(
  formData: FormData,
): Promise<AuthResult | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Login attempt for:", email);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return { error: error.message };
  }

  console.log("Login successful, user:", data.user?.email);

  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

export async function sendMagicLink(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "로그인 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.",
  };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "회원가입 이메일을 확인해주세요. 이메일 확인 후 로그인이 가능합니다.",
  };
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.",
  };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string;

  try {
    const supabase = await createClient();
    
    // 먼저 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 사용자가 없는 경우
    if (!user) {
      return { error: "인증 세션이 만료되었습니다. 다시 로그인해주세요." };
    }

    // 비밀번호 업데이트
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("비밀번호 업데이트 오류:", error);
      return { error: error.message };
    }

    // 세션 리프레시 - 새 세션 생성
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError) {
      console.error("세션 리프레시 오류:", refreshError);
      // 비밀번호는 변경되었지만 세션 리프레시에 실패한 경우
      return { success: "비밀번호가 변경되었습니다. 다시 로그인해주세요." };
    }

    // 페이지 리프레시를 위한
    revalidatePath("/", "layout");

    return {
      success: "비밀번호가 성공적으로 변경되었습니다.",
      data: refreshData,
    };
  } catch (e) {
    console.error("비밀번호 변경 중 예상치 못한 오류:", e);
    return { error: "비밀번호 변경 중 오류가 발생했습니다." };
  }
}

export async function signOut(): Promise<AuthResult | undefined> {
  try {
    const supabase = await createClient();
    
    // 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 사용자가 있을 때만 로그아웃 시도
    if (user) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("서버 로그아웃 오류:", error);
        return { error: error.message };
      }
    }

    // 세션 유무와 관계없이 페이지 리다이렉트
    revalidatePath("/", "layout");
    redirect("/");
  } catch (error) {
    console.error("로그아웃 처리 중 예상치 못한 오류:", error);
    // 오류가 발생해도 홈으로 리다이렉트
    revalidatePath("/", "layout");
    redirect("/");
  }
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 전화번호로 OTP를 발송하는 함수
 */
export async function sendPhoneOTP(formData: FormData): Promise<AuthResult> {
  const phone = formData.get("phone") as string;

  if (!phone) {
    return { error: "전화번호를 입력해주세요." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "인증 코드가 전송되었습니다. 문자메시지를 확인해주세요.",
    };
  } catch (error) {
    console.error("SMS OTP 발송 오류:", error);
    return { error: "SMS 발송 중 오류가 발생했습니다. 다시 시도해주세요." };
  }
}

/**
 * 전화번호 OTP 인증 확인 함수
 */
export async function verifyPhoneOTP(formData: FormData): Promise<AuthResult> {
  const phone = formData.get("phone") as string;
  const token = formData.get("token") as string;

  if (!phone || !token) {
    return { error: "전화번호와 인증코드를 모두 입력해주세요." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "인증이 완료되었습니다.",
      data,
    };
  } catch (error) {
    console.error("SMS OTP 확인 오류:", error);
    return { error: "인증 과정에서 오류가 발생했습니다. 다시 시도해주세요." };
  }
}
