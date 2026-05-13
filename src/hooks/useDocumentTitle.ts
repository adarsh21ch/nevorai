import { useEffect } from "react";

export function useDocumentTitle(title: string, suffix = "nnFlow by Nevorai") {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => {
      document.title = previous;
    };
  }, [title, suffix]);
}
