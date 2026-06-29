// Cryptographic hash function for high-security employee login
export async function hashPIN(pin: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(pin + "APOCUTE_SALT_2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback simple hash if crypto is not supported in iframe sandbox
    let hash = 0;
    const combined = pin + "APOCUTE_SALT_2026";
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

// Format number to Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate unique invoice ID
export function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `INV/${dateStr}/${randNum}`;
}

// Calculate loyalty points (e.g. 1 point per Rp 10,000 spent)
export function calculateLoyaltyPoints(total: number): number {
  return Math.floor(total / 10000);
}
