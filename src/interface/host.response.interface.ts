import { ProxyInterface } from './proxy.interface';
import { SiteInterface } from './site.interface';

export interface HostResponseInterface {
  site: SiteInterface;
  proxy: ProxyInterface;
}
