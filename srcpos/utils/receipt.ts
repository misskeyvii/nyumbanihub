import { formatMoney } from '@/utils/format';

export interface ReceiptLine {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface ReceiptPayload {
  receiptNo: string;
  date: string;
  cashier: string;
  customer: string;
  businessName: string;
  address: string;
  phone: string;
  items: ReceiptLine[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashReceived: number;
  change: number;
}

const W = 540;
const PAD = 44;
const CONTENT_W = W - PAD * 2;
const BOTTOM_PAD = 48;
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number): void {
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

export async function buildReceiptCanvas(payload: ReceiptPayload): Promise<HTMLCanvasElement> {
  if (document.fonts && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch {
      // ignore font-loading hiccups and fall back to system fonts
    }
  }

  const cashLines = payload.paymentMethod === 'Cash' ? 2 : 0;
  const upperBound = PAD * 2 + 420 + payload.items.length * 60 + cashLines * 40 + 200;

  const temp = document.createElement('canvas');
  temp.width = W;
  temp.height = upperBound;
  const ctx = temp.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, upperBound);

  const setFont = (size: number, weight: number) => {
    ctx.font = `${weight} ${size}px ${FONT}`;
  };

  let y = PAD;

  // Header
  ctx.textAlign = 'center';
  setFont(24, 800);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillText(truncate(ctx, payload.businessName, CONTENT_W), W / 2, y + 26);
  y += 26 + 24;

  setFont(14, 400);
  ctx.fillStyle = '#525252';
  ctx.fillText(truncate(ctx, payload.address, CONTENT_W), W / 2, y);
  y += 20;
  ctx.fillText(truncate(ctx, `Tel: ${payload.phone}`, CONTENT_W), W / 2, y);
  y += 20 + 24;

  drawDivider(ctx, y);
  y += 1 + 16;

  // Meta info
  ctx.textAlign = 'left';
  const drawMeta = (label: string, value: string) => {
    setFont(14, 500);
    ctx.fillStyle = '#525252';
    ctx.fillText(label, PAD, y);
    ctx.textAlign = 'right';
    setFont(14, 600);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(truncate(ctx, value, CONTENT_W * 0.55), W - PAD, y);
    ctx.textAlign = 'left';
    y += 26;
  };

  drawMeta('Receipt No.', payload.receiptNo);
  drawMeta('Date', new Date(payload.date).toLocaleString('en-KE'));
  drawMeta('Cashier', payload.cashier);
  drawMeta('Customer', payload.customer);

  y += 2;
  drawDivider(ctx, y);
  y += 1 + 16;

  // Items
  payload.items.forEach((item) => {
    setFont(16, 600);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(truncate(ctx, item.name, CONTENT_W), PAD, y);
    y += 22;

    setFont(13, 400);
    ctx.fillStyle = '#737373';
    ctx.fillText(`${item.qty} x ${formatMoney(item.unitPrice)}`, PAD, y);
    ctx.textAlign = 'right';
    setFont(13, 600);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(formatMoney(item.unitPrice * item.qty, 0), W - PAD, y);
    ctx.textAlign = 'left';
    y += 22;
  });

  y += 2;
  drawDivider(ctx, y);
  y += 1 + 16;

  // Totals
  const drawTotalLine = (label: string, value: string, bold = false) => {
    if (bold) {
      setFont(18, 800);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(label, PAD, y);
      ctx.textAlign = 'right';
      ctx.fillText(value, W - PAD, y);
      ctx.textAlign = 'left';
      y += 30;
    } else {
      setFont(14, 500);
      ctx.fillStyle = '#525252';
      ctx.fillText(label, PAD, y);
      ctx.textAlign = 'right';
      setFont(14, 600);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(value, W - PAD, y);
      ctx.textAlign = 'left';
      y += 26;
    }
  };

  drawTotalLine('Subtotal', formatMoney(payload.subtotal));
  drawTotalLine('Discount', `- ${formatMoney(payload.discount)}`);
  drawTotalLine('TOTAL', formatMoney(payload.total), true);
  drawTotalLine('Payment', payload.paymentMethod);

  if (payload.paymentMethod === 'Cash') {
    drawTotalLine('Cash received', formatMoney(payload.cashReceived));
    drawTotalLine('Change', formatMoney(payload.change));
  }

  y += 2;
  drawDivider(ctx, y);
  y += 1 + 16;

  // Footer
  ctx.textAlign = 'center';
  setFont(15, 600);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillText('Thank you for your visit!', W / 2, y + 4);
  ctx.textAlign = 'left';

  const finalHeight = y + BOTTOM_PAD;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = finalHeight;
  const finalCtx = canvas.getContext('2d');
  if (!finalCtx) throw new Error('Canvas is not supported in this browser');
  finalCtx.drawImage(temp, 0, 0, W, finalHeight, 0, 0, W, finalHeight);

  return canvas;
}

export async function downloadReceiptImage(
  payload: ReceiptPayload,
  fileName: string,
): Promise<void> {
  const canvas = await buildReceiptCanvas(payload);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}