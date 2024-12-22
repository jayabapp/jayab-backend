import { SHA1 } from 'crypto-js';
import { UAParser } from 'ua-parser-js';

export function createGuestBrowserFingerprint(headers: Headers): string {
  //TODO: get a uuid from client for more security
  const parser = new UAParser(headers);
  const p = parser.getResult();
  const salt = 'kian-b2c-$#';

  const fingerprint = `${p.device.vendor}-${p.browser.name}-${salt}`;
  const hash = SHA1(fingerprint).toString();
  return hash;
}
