import { LinkService } from "@/features/links/actions/link.service";
import LinkList from "@/features/links/components/link-list";
import ClickAnalytics from "@/features/analytics/components/click-analytics";

export default async function AdminAnalyticsPage() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">링크 분석</h1>
      
      <div className="mb-8">
        <ClickAnalytics />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <LinkList initialLinks={initialLinks} />
      </div>
    </div>
  );
}