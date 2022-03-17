export interface ProxyInterface {
  id?: number;
  ip: string;
  auth?: string;
  scheme: 'http' | 'https' | 'socks4' | 'socks5';
}
