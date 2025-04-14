import ClickAnalytics from "@/components/analytics/click-analytics";

export default function AnalyticsPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">링크 분석</h1>
      <ClickAnalytics />
    </main>
  );
}
