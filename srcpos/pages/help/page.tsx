import { useState, type FormEvent } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { inputCls, labelCls, primaryBtn } from '@/utils/ui';

const faqs = [
  {
    q: 'How do I add a new product?',
    a: 'Go to Products from the sidebar, then click "Add Product". Fill in the name, price, stock and supplier, then save. You can also add a barcode so it can be scanned at checkout.',
  },
  {
    q: 'How do I make a sale?',
    a: 'Open "New Sale" from the sidebar, search or scan a product, add it to the cart, choose a customer and payment method, then complete the sale. A receipt is generated automatically.',
  },
  {
    q: 'How does stock update automatically?',
    a: 'Every time a sale is completed, stock decreases automatically. Restocks and adjustments are tracked in the Inventory section with a full movement history.',
  },
  {
    q: 'Can I add employees?',
    a: 'Yes. Under Employees you can create accounts for cashiers, managers, stock managers and accountants, each with their own access level.',
  },
  {
    q: 'What happens when my subscription expires?',
    a: 'Your data is never deleted. You will see a renewal prompt and can renew from the Subscription page. A Nyumbani Link administrator can also reactivate your account.',
  },
  {
    q: 'How do I get a receipt reprinted?',
    a: 'After a sale, you can print, download or reprint the receipt from the transaction. Receipts are formatted for standard thermal printers.',
  },
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get('website_alt') || '').trim();

    if (honeypot) {
      setStatus('success');
      setMessage('Thanks for reaching out! Our support team will get back to you shortly.');
      form.reset();
      return;
    }

    formData.delete('website_alt');
    setStatus('sending');
    setMessage('');

    try {
      const params = new URLSearchParams();
      formData.forEach((value, key) => params.append(key, String(value)));

      const response = await fetch('https://readdy.ai/api/form/d9v259p63aqc1tdvap50', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const responseText = await response.text();
      let parsed: { code?: string; meta?: { message?: string; detail?: string }; message?: string } = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = {};
      }

      const serverMsg = parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText;
      const isSpam = typeof serverMsg === 'string' && (serverMsg.includes('spam') || serverMsg.includes('form data is spam'));

      if (response.ok && parsed?.code === 'OK') {
        setStatus('success');
        setMessage('Thanks for reaching out! Our support team will get back to you shortly.');
        form.reset();
      } else if (isSpam) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      } else {
        setStatus('error');
        setMessage(typeof serverMsg === 'string' && serverMsg ? serverMsg : 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Help & Support" subtitle="Find answers or reach our team whenever you need a hand." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Email Support', value: 'support@nyumbanilink.com', icon: 'ri-mail-line', tone: 'bg-primary-100 text-primary-700' },
          { label: 'WhatsApp', value: '+254 700 000 000', icon: 'ri-whatsapp-line', tone: 'bg-secondary-100 text-secondary-700' },
          { label: 'Business Hours', value: 'Mon–Sat · 8am–6pm', icon: 'ri-time-line', tone: 'bg-accent-100 text-accent-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${s.tone}`}>
              <i className={`${s.icon} text-lg`} />
            </span>
            <p className="mt-3 text-sm text-foreground-500">{s.label}</p>
            <p className="mt-0.5 font-semibold text-foreground-950">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="rounded-md border border-background-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-foreground-900">{faq.q}</span>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground-400">
                    <i className={`${openFaq === i ? 'ri-subtract-line' : 'ri-add-line'}`} />
                  </span>
                </button>
                {openFaq === i && (
                  <p className="border-t border-background-200 px-4 py-3 text-sm leading-relaxed text-foreground-600">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <h2 className="font-heading text-base font-bold text-foreground-950">Contact Support</h2>
          <p className="mb-4 text-xs text-foreground-500">Send us a message and we'll reply as soon as we can.</p>

          <form id="support-form" data-readdy-form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="support-name">Your name</label>
                <input id="support-name" name="name" type="text" className={inputCls} placeholder="Jane Doe" required />
              </div>
              <div>
                <label className={labelCls} htmlFor="support-email">Email</label>
                <input id="support-email" name="email" type="email" className={inputCls} placeholder="you@email.com" required />
              </div>
              <div>
                <label className={labelCls} htmlFor="support-topic">Topic</label>
                <select id="support-topic" name="topic" className={inputCls}>
                  <option>General question</option>
                  <option>Billing & subscription</option>
                  <option>Technical issue</option>
                  <option>Feature request</option>
                  <option>Account access</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="support-message">Message</label>
                <textarea
                  id="support-message"
                  name="message"
                  className="h-28 w-full rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="How can we help?"
                  maxLength={500}
                  required
                />
              </div>

              <div className="hp-field" aria-hidden="true">
                <label htmlFor="support-website">Website</label>
                <input id="support-website" name="website_alt" type="text" tabIndex={-1} autoComplete="off" readOnly />
              </div>

              {status !== 'idle' && (
                <p className={`rounded-md px-3 py-2 text-sm ${status === 'error' ? 'bg-accent-100 text-accent-800' : 'bg-primary-100 text-primary-800'}`}>
                  {message}
                </p>
              )}

              <button type="submit" disabled={status === 'sending'} className={`${primaryBtn} w-full disabled:opacity-60`}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}