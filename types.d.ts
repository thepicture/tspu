type Ip = string;
type Domain = string;
type Bytes = number[];
type Ciphers = string[];

type DomainOrDomainEntries = Domain | [Domain, Ip][] | [Ip, Domain][];

type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: DomainOrDomainEntries) => boolean;
};

interface TcpSession {
  bytes: Bytes;
  extensions: Bytes;

  blocked: () => boolean;
  feed: (...arrayOrInteger: Bytes | Bytes[] | ArrayBuffer[]) => this;
  extend: (...arrayOrInteger: Bytes | Bytes[] | ArrayBuffer[]) => this;
  banCipher: (ciphers: Ciphers) => this;
  feedCipher: (ciphers: Ciphers) => this;
}

type Tcp = {
  Session: new () => TcpSession;
};

declare module "tspu" {
  export const http: Http;
  export const tcp: Tcp;
}
