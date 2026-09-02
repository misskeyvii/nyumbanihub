import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { getSession } from '@/utils/session';
import { formatMoney } from '@/utils/format';
import { buildReceiptCanvas, downloadReceiptImage, type ReceiptPayload } from '@/utils/receipt';

type Tone = 'primary' | 'accent' | 'secondary';

interface Category {
  id: string;
  category_id: string;
  name: string;
  icon: string;
  tone: Tone;
}

interface Product {
  id: string;
  product_id: string;
  name: string;
  selling_price: number;
  buying_price: number;
  stock: number;
  min_stock: number;
  category_id: string;
  status: string;
}

interface Sellable {
  id: string;
  productId: string;
  name: string;
  price: number;
  buyingPrice: number;
  category: string;
  available: boolean;
  icon: string;
  tone: Tone;
  stock: number;
  minStock: number;
}

interface CartLine {
  item: Sellable;
  qty: number;
}

interface Receipt {
  receiptNo: string;
  date: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customer: string;
  cashReceived: number;
  change: number;
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-700',
  secondary: 'bg-secondary-100 text-secondary-700',
};

const paymentMethods = [
  { id: 'Cash', icon: 'ri-cash-line' },
  { id: 'M-PESA', icon: 'ri-smartphone-line' },
  { id: 'Card', icon: 'ri-bank-card-line' },
  { id: 'Bank', icon: 'ri-bank-line' },
];

export default function PosSale() {
  const session = getSession();
  const business = { posId: session?.posId || 'POS', businessName: session?.businessName || 'Nyumbani POS', address: 'Nairobi, Kenya', phone: '+254 700 000000' };

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState({ id: 'walk-in', name: 'Walking Customer' });
  const [customerOpen, setCustomerOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    loadProductsAndCategories();
  }, []);

  async function loadProductsAndCategories() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load categories
      const { data: categoriesData } = await supabase
        .from('pos_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load products
      const { data: productsData } = await supabase
        .from('pos_products')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  const categoryTone = useMemo(() => {
    const map: Record<string, Tone> = {};
    categories.forEach((category) => {
      map[category.category_id] = category.tone;
    });
    return map;
  }, [categories]);

  const sellables: Sellable[] = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      productId: product.product_id,
      name: product.name,
      price: product.selling_price,
      buyingPrice: product.buying_price,
      category: product.category_id || 'Other',
      available: product.stock > 0,
      icon: 'ri-shopping-bag-line',
      tone: categoryTone[product.category_id || ''] || 'secondary',
      stock: product.stock,
      minStock: product.min_stock,
    }));
  }, [products, categoryTone]);

  const filterCategories = useMemo(() => {
    return ['All', ...categories.map((category) => category.name)];
  }, [categories]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sellables.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = !term || item.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, sellables]);

  const addToCart = (item: Sellable) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.item.id === item.id);
      if (existing) {
        return prev.map((line) =>
          line.item.id === item.id ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.item.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line,
        )
        .filter((line) => line.qty > 0),
    );
  };

  const removeLine = (id: string) => {
    setCart((prev) => prev.filter((line) => line.item.id !== id));
  };

  const subtotal = cart.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const discountValue = discount ? Math.min(parseFloat(discount) || 0, subtotal) : 0;
  const total = subtotal - discountValue;
  const cashValue = cashReceived ? parseFloat(cashReceived) || 0 : 0;
  const change = paymentMethod === 'Cash' ? Math.max(0, cashValue - total) : 0;

  const completeSale = async () => {
    if (cart.length === 0) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to complete a sale');
        return;
      }

      const receiptNo = `${business.posId}-${Math.floor(1000 + Math.random() * 9000)}`;
      const saleDate = new Date().toISOString();
      
      // Save sale to database
      const { error } = await supabase
        .from('pos_sales')
        .insert({
          user_id: user.id,
          sale_id: `s-${Date.now()}`,
          receipt_no: receiptNo,
          cashier: session?.name || 'Cashier',
          customer_name: customer.name,
          items: cart.map((line) => ({
            productId: line.item.productId,
            name: line.item.name,
            qty: line.qty,
            unitPrice: line.item.price,
            buyingPrice: line.item.buyingPrice,
          })),
          total,
          payment_method: paymentMethod,
          status: 'completed',
          date: saleDate,
        });

      if (error) {
        console.error('Failed to save sale:', error);
        alert('Failed to save sale. Please try again.');
        return;
      }

      setReceipt({
        receiptNo,
        date: saleDate,
        items: cart,
        subtotal,
        discount: discountValue,
        total,
        paymentMethod,
        customer: customer.name,
        cashReceived: cashValue,
        change,
      });
    } catch (error) {
      console.error('Sale error:', error);
      alert('An error occurred while completing the sale');
    }
  };

  const resetSale = () => {
    setReceipt(null);
    setCart([]);
    setDiscount('');
    setCashReceived('');
    setCustomer({ id: 'walk-in', name: 'Walking Customer' });
    setPaymentMethod('Cash');
  };

  const buildPayload = (): ReceiptPayload => ({
    receiptNo: receipt?.receiptNo ?? '',
    date: receipt?.date ?? new Date().toISOString(),
    cashier: session?.name || 'Cashier',
    customer: receipt?.customer ?? '',
    businessName: business.businessName,
    address: business.address,
    phone: business.phone,
    items:
      receipt?.items.map((line) => ({
        name: line.item.name,
        qty: line.qty,
        unitPrice: line.item.price,
      })) ?? [],
    subtotal: receipt?.subtotal ?? 0,
    discount: receipt?.discount ?? 0,
    total: receipt?.total ?? 0,
    paymentMethod: receipt?.paymentMethod ?? 'Cash',
    cashReceived: receipt?.cashReceived ?? 0,
    change: receipt?.change ?? 0,
  });

  const handlePrint = async () => {
    if (!receipt) return;
    const canvas = await buildReceiptCanvas(buildPayload());
    const dataUrl = canvas.toDataURL('image/png');

    // Use a hidden in-page frame instead of window.open, which avoids popup
    // blockers and guarantees the image is fully loaded before printing.
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'absolute';
    frame.style.left = '-9999px';
    frame.style.top = '0';
    frame.style.width = '620px';
    frame.style.height = '900px';
    frame.style.border = '0';
    document.body.appendChild(frame);

    const frameDoc = frame.contentDocument;
    const frameWin = frame.contentWindow;
    if (!frameDoc || !frameWin) {
      document.body.removeChild(frame);
      return;
    }

    frame.addEventListener('load', () => {
      frameWin.focus();
      frameWin.print();
      // window.print() is blocking in most browsers, so this runs after it closes.
      setTimeout(() => {
        if (frame.parentNode) document.body.removeChild(frame);
      }, 300);
    });

    frameDoc.open();
    frameDoc.write(
      `<html><head><title>${receipt.receiptNo}</title><style>html,body{margin:0;padding:24px;background:#ffffff;}img{max-width:100%;height:auto;display:block;margin:0 auto;box-shadow:0 0 0 1px #e5e5e5;}</style></head><body><img src="${dataUrl}" alt="Receipt ${receipt.receiptNo}" /></body></html>`,
    );
    frameDoc.close();
  };

  const handleDownload = async () => {
    if (!receipt) return;
    await downloadReceiptImage(buildPayload(), receipt.receiptNo);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">New Sale</h1>
            <div className="relative w-full sm:w-80">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-foreground-400">
                <i className="ri-search-line text-sm" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={type === 'hotel' ? 'Search food & drinks…' : 'Search product or scan barcode…'}
                className="h-10 w-full rounded-lg border border-background-200 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {filterCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === category
                    ? 'bg-foreground-950 text-background-50'
                    : 'bg-background-50 text-foreground-600 hover:bg-background-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div
            data-product-shop="true"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
          >
            {filteredItems.map((item) => {
              const low =
                item.stock !== undefined &&
                item.minStock !== undefined &&
                item.stock <= item.minStock;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                  className="group rounded-lg border border-background-200 bg-background-50 p-3 text-left transition-all hover:border-primary-300 hover:bg-primary-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClasses[item.tone]}`}>
                      <i className={`${item.icon} text-lg`} />
                    </span>
                    {!item.available ? (
                      <span className="rounded-full bg-foreground-200 px-2 py-0.5 text-[10px] font-bold text-foreground-600">
                        {type === 'hotel' ? 'N/A' : 'OUT'}
                      </span>
                    ) : low ? (
                      <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold text-accent-700">
                        LOW
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-400">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary-700">
                      {formatMoney(item.price, 0)}
                    </span>
                    {item.stock !== undefined && (
                      <span className="text-xs text-foreground-400">Stock {item.stock}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-lg border border-dashed border-background-300 bg-background-50 p-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
                <i className="ri-search-line text-2xl" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground-700">No items found</p>
              <p className="mt-1 text-sm text-foreground-500">Try a different search or category.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 flex flex-col rounded-lg border border-background-200 bg-background-50">
            <div className="border-b border-background-200 p-4">
              <h2 className="font-heading text-base font-bold text-foreground-950">Current Sale</h2>
            </div>

            <div className="border-b border-background-200 p-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCustomerOpen((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-lg border border-background-200 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 transition-colors hover:bg-background-100"
                >
                  <span className="flex h-5 w-5 items-center justify-center text-foreground-400">
                    <i className="ri-user-line" />
                  </span>
                  <span className="flex-1 text-left font-medium">{customer.name}</span>
                  <i className="ri-arrow-down-s-line text-foreground-500" />
                </button>
                {customerOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-background-200 bg-background-50 p-1.5 shadow-lg">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCustomer(c);
                          setCustomerOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground-700 hover:bg-background-100"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                          {c.name.charAt(0)}
                        </span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {customer.id === c.id && <i className="ri-check-line text-primary-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-72 flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
                    <i className="ri-shopping-cart-line text-2xl" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-foreground-600">Cart is empty</p>
                  <p className="mt-1 text-xs text-foreground-400">Tap items to add them here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((line) => (
                    <div key={line.item.id} className="flex items-start gap-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground-900">
                          {line.item.name}
                        </p>
                        <p className="text-xs text-foreground-400">
                          {formatMoney(line.item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQty(line.item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-background-200 text-foreground-600 hover:bg-background-100"
                        >
                          <i className="ri-subtract-line" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-foreground-900">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(line.item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-background-200 text-foreground-600 hover:bg-background-100"
                        >
                          <i className="ri-add-line" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-400 hover:bg-accent-100 hover:text-accent-700"
                      >
                        <i className="ri-close-line" />
                      </button>
                      <span className="w-16 whitespace-nowrap text-right text-sm font-semibold text-foreground-900">
                        {formatMoney(line.item.price * line.qty, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-background-200 p-4">
              <div className="flex items-center justify-between">
                <label htmlFor="discount" className="text-sm text-foreground-600">
                  Discount (KSh)
                </label>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="h-9 w-28 rounded-md border border-background-200 bg-background-50 px-2.5 text-right text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="space-y-1.5 border-t border-dashed border-background-200 pt-3 text-sm">
                <div className="flex justify-between text-foreground-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-600">
                  <span>Discount</span>
                  <span>- {formatMoney(discountValue)}</span>
                </div>
                <div className="flex justify-between pt-1 font-heading text-lg font-bold text-foreground-950">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground-700">Payment method</p>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs font-semibold transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100'
                      }`}
                    >
                      <i className={method.icon} />
                      <span className="whitespace-nowrap">{method.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="flex items-center justify-between">
                  <label htmlFor="cashReceived" className="text-sm text-foreground-600">
                    Cash received
                  </label>
                  <input
                    id="cashReceived"
                    type="number"
                    min="0"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="h-9 w-28 rounded-md border border-background-200 bg-background-50 px-2.5 text-right text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              )}

              {paymentMethod === 'Cash' && cashReceived && (
                <div className="flex justify-between rounded-md bg-accent-100 px-3 py-2 text-sm">
                  <span className="font-medium text-accent-800">Change due</span>
                  <span className="font-bold text-accent-800">{formatMoney(change)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={completeSale}
                disabled={cart.length === 0}
                className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="ri-check-double-line" />
                Complete Sale · {formatMoney(total, 0)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg bg-background-50">
            <div className="bg-foreground-950 px-6 py-5 text-center text-background-50">
              <p className="font-heading text-lg font-bold">{session?.businessName || "Your Business"}</p>
              <p className="mt-0.5 text-xs text-background-50/80">{business.address}</p>
              <p className="text-xs text-background-50/80">{business.phone}</p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 space-y-1 text-sm text-foreground-600">
                <div className="flex justify-between">
                  <span>Receipt No.</span>
                  <span className="font-medium text-foreground-900">{receipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium text-foreground-900">
                    {new Date(receipt.date).toLocaleString('en-KE')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier</span>
                  <span className="font-medium text-foreground-900">{session?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-medium text-foreground-900">{receipt.customer}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-background-300 py-3">
                {receipt.items.map((line) => (
                  <div key={line.item.id} className="mb-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-foreground-900">
                        {line.item.name}
                        <span className="text-foreground-500"> × {line.qty}</span>
                      </span>
                      <span className="whitespace-nowrap font-medium text-foreground-900">
                        {formatMoney(line.item.price * line.qty, 0)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-400">
                      {formatMoney(line.item.price)} each
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 border-t border-dashed border-background-300 pt-3 text-sm">
                <div className="flex justify-between text-foreground-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-600">
                  <span>Discount</span>
                  <span>- {formatMoney(receipt.discount)}</span>
                </div>
                <div className="flex justify-between font-heading text-lg font-bold text-foreground-950">
                  <span>Total</span>
                  <span>{formatMoney(receipt.total)}</span>
                </div>
                <div className="flex justify-between text-foreground-600">
                  <span>Payment</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
                {receipt.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-foreground-600">
                      <span>Cash received</span>
                      <span>{formatMoney(receipt.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-foreground-600">
                      <span>Change</span>
                      <span>{formatMoney(receipt.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-700">
                <i className="ri-checkbox-circle-line" />
                <span className="font-semibold">Sale completed successfully</span>
              </div>
              <p className="mt-1 text-center text-xs text-foreground-500">
                Thank you for your visit!
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-background-200 text-sm font-semibold text-foreground-700 hover:bg-background-100"
                >
                  <i className="ri-printer-line" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-background-200 text-sm font-semibold text-foreground-700 hover:bg-background-100"
                >
                  <i className="ri-download-line" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={resetSale}
                  className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 text-sm font-semibold text-background-50 hover:bg-primary-600"
                >
                  <i className="ri-add-line" />
                  New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}