"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">ページを表示できませんでした</h1>
      <p className="text-muted-foreground">
        読み込みの途中でエラーが起きました。もう一度試しても直らないときは、少し時間を置くか、トップから開き直してください。
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => retry()}>もう一度試す</Button>
        <Link href="/" className="underline">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
