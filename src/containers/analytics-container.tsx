import ClickAnalytics from "@/components/analytics/click-analytics";

export default function AnalyticsContainer() {
  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">링크 분석</h1>
        <ClickAnalytics />
      </div>
    </main>
  );
}
