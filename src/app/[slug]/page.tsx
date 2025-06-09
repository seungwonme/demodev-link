"use server";

import { LinkService } from "@/features/links/actions/link.service";
import { Database } from "@/shared/types/supabase";

type LinkType = Database["public"]["Tables"]["links"]["Row"];

import { notFound, redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RedirectPage({ params }: Props) {
  const { slug } = await params;

  let link: LinkType | null = null; // link 변수를 try 블록 외부에서 접근 가능하도록 선언

  try {
    // 1. 링크 정보 가져오기
    link = await LinkService.getLinkBySlug(slug);

    // 2. 링크 정보가 없으면 notFound 호출 (여기서 함수 실행 중단)
    if (!link) {
      console.log(`Link not found for slug: ${slug}`);
      notFound();
    }

    // 3. 링크가 있으면 클릭 수 증가 시도
    await LinkService.incrementClickCount(slug);
  } catch (error) {
    // 4. 데이터베이스 조회/업데이트 중 발생한 예기치 못한 에러 처리
    console.error(`Error processing slug ${slug}:`, error);
    // 여기서도 notFound()를 호출하여 사용자에게 404 페이지를 보여줍니다.
    notFound();
  }

  // 5. try 블록이 성공적으로 완료되고 link 객체가 존재하면 리다이렉트 수행
  // 위에서 if (!link) 로 null 체크를 했으므로, 여기까지 오면 link는 반드시 존재합니다.
  // 하지만 명확성을 위해 한번 더 체크하는 것도 좋습니다.
  if (link) {
    console.log(`Redirecting slug ${slug} to: ${link.original_url}`);
    redirect(link.original_url); // try...catch 블록 밖에서 호출
  } else {
    // 이론적으로 이 코드는 실행되지 않아야 하지만, 방어적으로 추가
    console.error(
      `Link object was unexpectedly null for slug: ${slug} after try-catch.`,
    );
    notFound();
  }
}

// 메타데이터 설정 (수정)
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  let title = `리다이렉션 중... - ${slug}`;
  try {
    const link = await LinkService.getLinkBySlug(slug);
    if (link) {
      title = `Redirecting to ${link.original_url.substring(0, 30)}...`; // 예시
    }
  } catch (error) {
    console.error("Error fetching link for metadata:", error);
  }

  return {
    title: title,
    robots: {
      index: false,
      follow: true,
    },
  };
}
