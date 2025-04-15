"use server";

import UrlInputForm from "@/components/url/url-input-form";

export default async function HomeContainer() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">URL 단축기</h1>
          <p className="mt-2 text-muted-foreground">
            긴 URL을 짧고 간단하게 만들어보세요.
          </p>
        </div>
        <UrlInputForm />
      </div>
    </main>
  );
}
