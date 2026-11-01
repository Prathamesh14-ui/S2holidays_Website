/** Builds a WhatsApp click-to-chat link (https://faq.whatsapp.com/5913398998672934). */
export function whatsappLink(number: string | undefined, message: string): string | null {
  const digits = (number || "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
