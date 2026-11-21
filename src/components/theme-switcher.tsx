"use client";

import { useSyncExternalStore } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DEFAULT_THEME, MODE_LABELS, MODE_STORAGE_KEY, MODES, type Mode, THEME_STORAGE_KEY, THEMES, isMode, isThemeId, restoreSavedTheme } from "@/themes";

// テーマとライト・ダークの切り替え。選択はlocalStorageに置き、<html> のdata-theme / data-modeに反映する(docs/design-system.md 3.2)。
// 初期描画の反映はlayoutのThemeBootが済ませているので、ここは表示と変更だけを受け持つ。
// 現在の選択は <html> とlocalStorageを正としてuseSyncExternalStoreで読む(サーバー描画では既定値)

function readStorage<T>(key: string, guard: (v: unknown) => v is T, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return guard(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // プライベートモードなどで保存できなくても、表示の切り替えは続ける
  }
}

// 別タブの変更を <html> に反映する。keyがnullになるのは別タブのlocalStorage.clear()
function onStorage(e: StorageEvent) {
  if (e.key !== THEME_STORAGE_KEY && e.key !== MODE_STORAGE_KEY && e.key !== null) return;
  // 保存値が消えたり不正だったりするとrestoreSavedThemeはテーマに触らないので、再読み込みと同じ既定に戻しておく
  document.documentElement.dataset.theme = DEFAULT_THEME;
  restoreSavedTheme();
  emit();
}

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  // 「自動」のときはOSの設定変更に追従する
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getMode() === "auto") applyMode("auto");
  };
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onChange);
  };
}
function emit() {
  for (const l of listeners) l();
}

const getTheme = () => {
  const t = document.documentElement.dataset.theme;
  return isThemeId(t) ? t : DEFAULT_THEME;
};
const getMode = () => readStorage(MODE_STORAGE_KEY, isMode, "auto");

function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
  writeStorage(THEME_STORAGE_KEY, id);
  emit();
}

function applyMode(mode: Mode) {
  const dark = mode === "dark" || (mode === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.mode = dark ? "dark" : "light";
  writeStorage(MODE_STORAGE_KEY, mode);
  emit();
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
  const mode = useSyncExternalStore(subscribe, getMode, () => "auto" as Mode);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="テーマ">
          <Palette aria-hidden />
          <span className="hidden sm:inline">テーマ</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-3">
        <div role="group" aria-label="テーマ" className="grid grid-cols-4 gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.name}
              aria-pressed={theme === t.id}
              onClick={() => applyTheme(t.id)}
              className={`rounded-md border-2 p-1 ${theme === t.id ? "border-primary bg-primary/5 forced-colors:border-[Highlight]" : "border-transparent hover:bg-muted"}`}
            >
              {/* 縦3等分に塗ると国旗に見えるので、背景の上に主色の帯と差し色の点を置く */}
              <span className="flex h-9 items-center gap-1 rounded-sm border border-foreground/10 px-1.5 forced-color-adjust-none" style={{ backgroundColor: t.preview[1] }} aria-hidden>
                <span className="h-2.5 flex-1 rounded-full" style={{ backgroundColor: t.preview[0] }} />
                <span className="size-2.5 rounded-full" style={{ backgroundColor: t.preview[2] }} />
              </span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="明るさ" className="flex gap-1 border-t pt-2">
          {MODES.map((m) => (
            <Button key={m} type="button" size="sm" variant="ghost" aria-pressed={mode === m} className={`flex-1 ${mode === m ? "border-primary bg-primary/5 forced-colors:border-2 forced-colors:border-[Highlight]" : ""}`} onClick={() => applyMode(m)}>
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
