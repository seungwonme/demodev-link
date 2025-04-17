"use server";

import { LinkService } from "@/services/link.service";
import LinkList from "@/components/link-list";

export default async function Analytics() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">링크 분석</h1>
      <LinkList initialLinks={initialLinks} />
    </div>
  );
}
