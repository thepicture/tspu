type Ip = string;
type Domain = string;

type DomainOrDomainEntries = Domain | [Domain, Ip][] | [Ip, Domain][];

type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: DomainOrDomainEntries) => boolean;
};

interface TcpSession {
  blocked: () => boolean;
  feed: (
    arrayOrInteger: Number[] | Number | ArrayBuffer | Array<number>
  ) => void;
}

type Tcp = {
  Session: TcpSession;
};

declare module "tspu" {
  export const http: Http;
  export const tcp: Tcp;
}
