import EventEmitter from "node:events";
import { Http2ServerRequest, StreamState } from "node:http2";

type Ip = string;
type Domain = string;
type Bytes = number[];
type Ciphers = string[];

type DomainOrDomainEntries = Domain | [Domain, Ip][] | [Ip, Domain][];

type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: DomainOrDomainEntries) => boolean;
};

type SessionOptions = {
  autoblock?: boolean;
  sensitivity?: number;
};

type FirewallRule =
  | {
      in: number[];
    }
  | {
      not: {
        in: number[];
      };
    }
  | {
      or?: FirewallRule[];
      and?: FirewallRule[];
    };

type FirewallRuleDictionary = {
  [key: string]: FirewallRule;
};

interface TcpSession extends EventEmitter {
  bytes: Bytes;
  extensions: Bytes;

  blocked: () => boolean;
  feed: (...arrayOrInteger: Bytes | Bytes[] | ArrayBuffer[]) => this;
  extend: (...arrayOrInteger: Bytes | Bytes[] | ArrayBuffer[]) => this;
  banCipher: (ciphers: Ciphers) => this;
  feedCipher: (ciphers: Ciphers) => this;
}

interface Firewall {
  state: FirewallOptions;

  legit: (session: Http2ServerRequest) => boolean;
}

type Tcp = {
  Session: new (options?: SessionOptions) => TcpSession;
};

type Http2 = {
  Firewall: new (options?: FirewallOptions) => Firewall;
};

export const http2: Http2;
export const http: Http;
export const tcp: Tcp;
