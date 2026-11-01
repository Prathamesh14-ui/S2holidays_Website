import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichText as RichTextValue } from "@/lib/types";
import { cn } from "@/lib/format";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value, className }: { value?: RichTextValue; className?: string }) {
  if (!value?.length) return null;
  return (
    <div className={cn("prose-s2", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
