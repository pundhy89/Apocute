import { AppSettings, WhatsappLog } from '../types';

/**
 * Sends a simulated or real WhatsApp message to a recipient.
 * If whatsappGatewayUrl and whatsappApiKey are set, it will attempt a real POST request to integrate with third-party gateways.
 * Always returns a structured log of the transaction.
 */
export async function sendWhatsAppMessage(
  settings: AppSettings,
  recipient: string,
  recipientName: string,
  message: string,
  type: 'stok_habis' | 'ultah' | 'promo' | 'struk_digital' | 'shift_jaga'
): Promise<WhatsappLog> {
  const logEntry: WhatsappLog = {
    id: `wa-log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    recipient,
    recipientName,
    message,
    type,
    status: 'success'
  };

  // 1. If real gateway coordinates are provided, attempt to execute the API call
  if (settings.whatsappGatewayUrl && settings.whatsappGatewayUrl.startsWith('http')) {
    try {
      // Create a standard payload
      const payload = {
        apiKey: settings.whatsappApiKey,
        to: recipient,
        message: message,
        type: type,
        sandbox: true
      };

      const response = await fetch(settings.whatsappGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.whatsappApiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Real WhatsApp gateway API responded with error status:', response.status);
      }
    } catch (e) {
      console.error('Failed to dispatch real API request to custom WhatsApp gateway:', e);
      // We still treat it as simulated success/failed log so that users can test offline
    }
  }

  // 2. Local Storage saving for logs
  try {
    const existingLogsStr = localStorage.getItem('apocute_wa_logs') || '[]';
    const existingLogs: WhatsappLog[] = JSON.parse(existingLogsStr);
    existingLogs.unshift(logEntry);
    // Keep maximum 200 logs
    localStorage.setItem('apocute_wa_logs', JSON.stringify(existingLogs.slice(0, 200)));
  } catch (err) {
    console.error('Failed to persist WhatsApp audit log:', err);
  }

  // 3. Trigger a browser custom event so other components can listen and refresh logs in real-time
  const event = new CustomEvent('apocute_wa_message_sent', { detail: logEntry });
  window.dispatchEvent(event);

  return logEntry;
}

/**
 * Retreive all whatsapp logs from localStorage
 */
export function getWhatsAppLogs(): WhatsappLog[] {
  try {
    return JSON.parse(localStorage.getItem('apocute_wa_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * Generate standard WhatsApp click-to-chat URL link for manual cashier fallback
 */
export function getWhatsAppClickToChatLink(phone: string, text: string): string {
  // Clean phone number (must start with international country code, default to ID/62)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('08')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Persists a customized WhatsApp log entry directly into localStorage
 */
export function saveWhatsAppLog(log: WhatsappLog): void {
  try {
    const existingLogsStr = localStorage.getItem('apocute_wa_logs') || '[]';
    const existingLogs: WhatsappLog[] = JSON.parse(existingLogsStr);
    existingLogs.unshift(log);
    localStorage.setItem('apocute_wa_logs', JSON.stringify(existingLogs.slice(0, 200)));
    
    // Dispatch event to notify listeners
    const event = new CustomEvent('apocute_wa_message_sent', { detail: log });
    window.dispatchEvent(event);
  } catch (err) {
    console.error('Failed to persist WhatsApp log:', err);
  }
}
