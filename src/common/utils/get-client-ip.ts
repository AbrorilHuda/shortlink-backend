import { type Request } from 'express';

/**
 * Mengambil IP address asli dari request.
 * Menangani:
 * - X-Forwarded-For header (saat di balik proxy/load balancer)
 * - IPv6-mapped IPv4 (::ffff:x.x.x.x → x.x.x.x)
 * - IPv6 loopback (::1 → 127.0.0.1)
 */
export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];

  let ip: string | undefined;

  if (forwarded) {
    // X-Forwarded-For bisa berisi daftar IP, ambil yang pertama (IP client asli)
    ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      .split(',')[0]
      .trim();
  } else {
    ip = req.ip;
  }

  if (!ip) return undefined;

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // Normalize IPv6 loopback ke IPv4 loopback
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
}
