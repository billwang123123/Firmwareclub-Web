import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type Props = { children: string };

export function Markdown({ children }: Props) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
