import { supabase } from './supabaseClient';
import { getDemoType } from './session';
import type { Sale } from '@/mocks/sales';

const KEY = 'nyumbani-pos-sales';

interface SaleRow {
  id: string;
  business_id: string;
  user_id: string | null;
  receipt_no: string;
  date: string;
  cashier: string;
  customer: string | null;
  items: Sale['items'];
  total: number | string;
  payment_method: string | null;
  status: string;
}

function readCache(): Sale[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Sale[];
    }
  } catch {
    // ignore malformed cache
  }
  return [];
}

function writeCache(sales: Sale[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sales));
  } catch {
    // ignore storage errors
  }
}

function mapRow(row: SaleRow): Sale {
  return {
    id: row.id,
    receiptNo: row.receipt_no,
    date: row.date,
    cashier: row.cashier,
    customer: row.customer ?? 'Walking Customer',
    items: Array.isArray(row.items) ? row.items : [],
    total: typeof row.total === 'number' ? row.total : Number(row.total),
    paymentMethod: row.payment_method ?? '',
    status: row.status === 'refunded' ? 'refunded' : 'completed',
  };
}

export function getSales(): Sale[] {
  return readCache();
}

export function getSalesForUser(name: string): Sale[] {
  return readCache().filter((sale) => sale.cashier === name);
}

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  const mapped = ((data ?? []) as SaleRow[]).map(mapRow);
  writeCache(mapped);
  return mapped;
}

export async function addSale(sale: Sale): Promise<void> {
  const next = [sale, ...readCache()];
  writeCache(next);

  try {
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase.from('sales').insert({
      id: sale.id,
      business_id: getDemoType(),
      user_id: authData.user?.id ?? null,
      receipt_no: sale.receiptNo,
      date: sale.date,
      cashier: sale.cashier,
      customer: sale.customer,
      items: sale.items,
      total: sale.total,
      payment_method: sale.paymentMethod,
      status: sale.status,
    });

    if (error) {
      console.error('Failed to persist sale:', error.message);
    }
  } catch (err) {
    console.error('Failed to persist sale:', err);
  }
}