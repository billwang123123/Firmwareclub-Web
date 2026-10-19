"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

type Props = {
  value: string;
  onChange: (v: string) => void;
  height?: number;
  placeholder?: string;
};

export function MdEditor({ value, onChange, height = 320, placeholder }: Props) {
  return (
    <div data-color-mode="light" className="dark:hidden">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        preview="live"
        textareaProps={{ placeholder }}
      />
    </div>
  );
}
