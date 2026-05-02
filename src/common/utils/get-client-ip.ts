import { type Request } from 'express';

export function isPrivateOrLocalIp(ip: string): boolean {
  // IPv6 loopback / link-local / ULA (simple checks)
  if (ip === '::1') return true;
  if (ip.startsWith('fe80:')) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;

  // Basic IPv4 private/local ranges
  if (ip === '0.0.0.0') return true;
  if (ip.startsWith('127.')) return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true;

  // 172.16.0.0/12
  if (ip.startsWith('172.')) {
    const secondOctet = Number(ip.split('.')[1]);
    if (
      Number.isFinite(secondOctet) &&
      secondOctet >= 16 &&
      secondOctet <= 31
    ) {
      return true;
    }
  }

  return false;
}

export function getClientIp(req: Request): string | undefined {
  // Prioritas header yang umum dipakai oleh reverse proxy / CDN
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  const xRealIp = req.headers['x-real-ip'];
  const forwarded = req.headers['x-forwarded-for'];

  let ip: string | undefined;

  if (cfConnectingIp) {
    ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
  } else if (xRealIp) {
    ip = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  } else if (forwarded) {
    // X-Forwarded-For bisa berisi daftar IP, ambil yang pertama (IP client asli)
    ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      .split(',')[0]
      .trim();
  } else {
    ip = req.ip;
  }

  if (!ip) return undefined;

  ip = ip.trim();

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // Normalize IPv6 loopback ke IPv4 loopback
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
}
