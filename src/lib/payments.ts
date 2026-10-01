"use client";

import { useCallback, useEffect, useState } from "react";

// Agent-only payment details. Deliberately NOT part of the shared store, activity feed, documents or chat context.
export type Payments = { titular: string; yape: string; banco: string; tipoCuenta: string; cuenta: string; cci: string };
export const EMPTY_PAYMENTS: Payments = { titular: "", yape: "", banco: "", tipoCuenta: "Ahorros", cuenta: "", cci: "" };
const KEY = "trato-agent-payments";

export function usePayments() {
  const [value, setValue] = useState<Payments>(EMPTY_PAYMENTS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setValue({ ...EMPTY_PAYMENTS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const save = useCallback((v: Payments) => {
    setValue(v);
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  }, []);
  return { value, save };
}

export const mask = (s: string) => (s ? `•••• ${s.slice(-4)}` : "—");

export function validatePayments(v: Payments): Partial<Record<keyof Payments, string>> {
  const e: Partial<Record<keyof Payments, string>> = {};
  if (v.yape && !/^\d{9}$/.test(v.yape)) e.yape = "El Yape debe tener 9 dígitos.";
  if (v.cuenta && !/^\d{8,20}$/.test(v.cuenta)) e.cuenta = "Usa entre 8 y 20 dígitos.";
  if (v.cci && !/^\d{20}$/.test(v.cci)) e.cci = "El CCI debe tener 20 dígitos.";
  if ((v.yape || v.cuenta || v.cci) && !v.titular.trim()) e.titular = "Indica el titular.";
  return e;
}
