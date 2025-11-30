'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundBackButton() {
  return (
    <Button
      size="lg"
      variant="outline"
      className="min-w-[200px] h-12 border-2 border-primary/30 bg-background/60 backdrop-blur-xl hover:bg-primary/5 hover:border-primary/50 transition-all"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      }}
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      이전 페이지로
    </Button>
  );
}
