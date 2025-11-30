import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Home, AlertCircle, Search } from 'lucide-react';
import NotFoundBackButton from './not-found-back-button';

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-muted/10 to-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-40 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl animate-in">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/20">
          <AlertCircle className="h-12 w-12 text-primary" />
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl sm:text-8xl font-black mb-4">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-300%">
            404
          </span>
        </h1>

        {/* Description */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 다시
          확인해주세요.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="min-w-[200px] h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              홈으로 돌아가기
            </Link>
          </Button>

          <NotFoundBackButton />
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-md border border-primary/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Search className="h-4 w-4" />
            <span className="font-medium">자주 찾는 페이지</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/shorten"
              className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all hover:scale-105"
            >
              URL 단축하기
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium transition-all hover:scale-105"
            >
              로그인
            </Link>
            <Link
              href="/admin/register"
              className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all hover:scale-105"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
