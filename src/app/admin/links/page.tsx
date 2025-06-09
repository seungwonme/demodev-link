import { LinkService } from "@/features/links/actions/link.service";
import UrlInputForm from "@/features/links/components/url/url-input-form";
import LinkList from "@/features/links/components/link-list";

export default async function AdminLinksPage() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">링크 관리</h1>
      
      {/* Create new link section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">새 링크 생성</h2>
        <UrlInputForm />
      </div>

      {/* Links list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <LinkList initialLinks={initialLinks} />
      </div>
    </div>
  );
}