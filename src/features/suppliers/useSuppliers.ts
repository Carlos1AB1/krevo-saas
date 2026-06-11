import { useState, useCallback } from "react";

const STORAGE_KEY = "krevo_suppliers";

function readStorage(): string[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? (JSON.parse(v) as string[]) : [];
  } catch {
    return [];
  }
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<string[]>(readStorage);

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSuppliers((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed].sort((a, b) => a.localeCompare(b, "es"));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((name: string) => {
    setSuppliers((prev) => {
      const next = prev.filter((s) => s !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { suppliers, add, remove };
}
