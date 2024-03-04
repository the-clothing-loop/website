import type { i18n as I18n } from "i18next";

export type LocalizePath = (path: string, locale?: string) => string;

export default function useLocalizePath(i18n: I18n): LocalizePath {
  return (path: string, locale?: string) => {
    if (!locale) locale = i18n.language;
    const basePath = removeLocalizePath(path);

    return `/${locale}/${basePath}`;
  };
}

export function removeLocalizePath(path: string): string {
  return /^(\/\w\w)?\/(.*)/.exec(path)?.at(2) || "";
}
