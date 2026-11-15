import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ErrorPage from "./error";

// Issue #305: 実行時エラーのときにNext.jsの既定画面になり、再試行もトップへの導線も無かった
test("エラー画面に再試行のボタンとトップへのリンクが出る", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const retry = vi.fn();
  render(<ErrorPage error={new Error("boom")} retry={retry} />);

  expect(screen.getByRole("heading", { level: 1, name: "ページを表示できませんでした" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "トップへ戻る" })).toHaveAttribute("href", "/");
  fireEvent.click(screen.getByRole("button", { name: "もう一度試す" }));
  expect(retry).toHaveBeenCalledTimes(1);
});
