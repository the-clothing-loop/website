import { Component, DetailedHTMLProps, HTMLAttributes } from "react";
import sanitizeHtml, { IOptions } from "sanitize-html";

const defaultOptions: IOptions = {
  allowedTags: ["b", "i", "em", "strong", "a"],
  allowedAttributes: {
    a: ["href"],
  },
  allowedIframeHostnames: ["www.youtube.com"],
};

const sanitize = (dirty: string, options: IOptions) => ({
  __html: sanitizeHtml(dirty, { ...defaultOptions, ...options }),
});

export interface SanitizedHtmlProps {
  children: string;
  options?: Partial<IOptions>;
  className?: string;
}

export default function SanitizedHtml({
  children,
  options = {},
  ...args
}: SanitizedHtmlProps) {
  return (
    <div
      dangerouslySetInnerHTML={sanitize(children, {
        ...defaultOptions,
        ...options,
      })}
      {...args}
    />
  );
}
