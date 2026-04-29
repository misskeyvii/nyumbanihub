import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Name, email and message are required.');
      return;
    }
    setSending(true);
    setError('');
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject || null,
      message: form.message,
    });
    if (insertError) { setError(insertError.message); setSending(false); return; }
    setSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-16">
        <div className="bg-emerald-700 px-4 py-14 text-center">
          <h1 className="text-white font-bold text-3xl">Contact Us</h1>
          <p className="text-emerald-100 text-sm mt-2">We're here to help. Send us a message and we'll respond within 24 hours.</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-gray-900 text-xl mb-4">Get in Touch</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Have a question about a listing, need help with your account, or want to report a scam? We're here for you.
              </p>
            </div>
            {[
              { icon: 'ri-whatsapp-fill', label: 'WhatsApp', value: '+254 700 000 000', href: 'https://wa.me/254700000000', color: 'text-[#25D366]' },
              { icon: 'ri-mail-fill', label: 'Email', value: 'support@nyumbanihub.co.ke', href: 'mailto:support@nyumbanihub.co.ke', color: 'text-emerald-600' },
              { icon: 'ri-map-pin-2-fill', label: 'Location', value: 'Nairobi, Kenya', href: '#', color: 'text-rose-500' },
              { icon: 'ri-time-fill', label: 'Hours', value: 'Mon–Sat, 8am–6pm EAT', href: '#', color: 'text-amber-500' },
            ].map(item => (
              <a key={item.label} href={item.href} className="flex items-start gap-4 group">
                <div className={`w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl flex-shrink-0 ${item.color}`}>
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">{item.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {success ? (
              <div className="text-center py-10">
                <i className="ri-checkbox-circle-fill text-emerald-500 text-5xl mb-4"></i>
                <p className="font-bold text-gray-900 text-lg">Message Sent!</p>
                <p className="text-gray-400 text-sm mt-1">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-emerald-600 hover:underline cursor-pointer">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-gray-900">Send a Message</h3>
                {error && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email *</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="your@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Subject</label>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Issue with my listing" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us how we can help..." className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 resize-none" />
                </div>
                <button type="submit" disabled={sending} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${sending ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
