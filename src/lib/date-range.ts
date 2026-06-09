import { endOfDay, endOfMonth, isValid, parseISO, startOfDay, startOfMonth } from "date-fns";

/** Inicio del día en ISO UTC (para query `from`). */
export function toQueryFromDate(date: string): string | undefined {
  if (!date) return undefined;
  const parsed = parseISO(date);
  if (!isValid(parsed)) return undefined;
  return startOfDay(parsed).toISOString();
}

/** Fin del día en ISO UTC (para query `to`). */
export function toQueryToDate(date: string): string | undefined {
  if (!date) return undefined;
  const parsed = parseISO(date);
  if (!isValid(parsed)) return undefined;
  return endOfDay(parsed).toISOString();
}

/** Rango del mes calendario actual (inicio y fin inclusive). */
export function currentMonthRange(now = new Date()) {
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return {
    start,
    end,
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

/** True si `iso` cae dentro de [start, end] inclusive. */
export function isWithinRange(iso: string, start: Date, end: Date): boolean {
  const parsed = parseISO(iso);
  if (!isValid(parsed)) return false;
  return parsed >= start && parsed <= end;
}

/** Valida que from <= to cuando ambos están presentes. */
export function isValidDateRange(from: string, to: string): boolean {
  if (!from || !to) return true;
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  if (!isValid(fromDate) || !isValid(toDate)) return false;
  return fromDate <= toDate;
}
