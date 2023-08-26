type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: string) => boolean;
};

declare module "tspu" {
  export const http: Http;
}
