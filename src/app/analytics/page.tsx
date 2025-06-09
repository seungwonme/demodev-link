import { LinkService } from "@/services/link.service";
import LinkList from "@/components/link-list";
import ClickAnalytics from "@/components/analytics/click-analytics";

export default async function Analytics() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">링크 분석</h1>
      
      <div className="mb-8">
        <ClickAnalytics />
      </div>
      
      <div>
        <LinkList initialLinks={initialLinks} />
      </div>
    </div>
  );
}
