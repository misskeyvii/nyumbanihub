export const formatPhoneForWhatsApp = (phone: string | null | undefined) => {
  const digits = (phone || '').replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('254')) return digits;

  return digits;
};

export const createWhatsAppLink = (phone: string | null | undefined, message: string) => {
  const whatsappNumber = formatPhoneForWhatsApp(phone);
  if (!whatsappNumber) return '';

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};
