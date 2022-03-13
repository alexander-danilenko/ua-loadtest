export interface SiteInterface {
  id?: number;
  url: string;
  page: string;
  atack: boolean;
  need_parse_url: 1 | 0;
  page_time: number;
  protocol: 'http' | 'https';
  port: number;
}
