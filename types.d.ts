type Ip = string;
type Domain = string;

type DomainOrDomainEntries = Domain | [Domain, Ip][] | [Ip, Domain][];

type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: DomainOrDomainEntries) => boolean;
};

interface TcpSession {
  bytes: number[];

  blocked: () => boolean;
  feed: (...arrayOrInteger: number[] | number[][] | ArrayBuffer[]) => void;
}

type Tcp = {
  Session: new () => TcpSession;
};

declare module "tspu" {
  export const http: Http;
  export const tcp: Tcp;
}
