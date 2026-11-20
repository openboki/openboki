"use client";

import { useRef, useState } from "react";
import { resetUnitProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// 完了した単元を未完了に戻す前の確認(Issue #492)。単元の一覧とIDEの完了の案内が使う

interface Props {
  unitId: string;
  unitTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 戻し終えたときに呼ぶ */
  onReset: () => void;
  /** 戻したあとは開いたボタンが消えるので、代わりにフォーカスを置く先 */
  focusAfterReset: () => void;
}

export function ResetUnitDialog({ unitId, unitTitle, open, onOpenChange, onReset, focusAfterReset }: Props) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const done = useRef(false);

  const reset = async () => {
    setPending(true);
    setFailed(false);
    try {
      await resetUnitProgress(unitId);
      done.current = true;
      onReset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setFailed(false);
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(e) => {
          if (!done.current) return;
          done.current = false;
          e.preventDefault();
          focusAfterReset();
        }}
      >
        <DialogHeader>
          <DialogTitle>「{unitTitle}」を未完了に戻しますか</DialogTitle>
          <DialogDescription>ステップ1から未回答で始まります。これまでの回答の記録は残ります。</DialogDescription>
        </DialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            未完了に戻せませんでした。通信を確かめて、もう一度試してください。
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button onClick={reset} disabled={pending}>
            未完了に戻す
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
