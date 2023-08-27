# tspu

`Technical tools for danger mitigation`

## Install

`npm i --save tspu`

## API

```js
type Domain = string;
type Ip = string;

type DomainOrDomainEntries = Domain | [Domain, Ip][] | [Ip, Domain][];

type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: DomainOrDomainEntries) => boolean;
};

declare module "tspu" {
  export const http: Http;
}

```

### http

```js
const { http } = require("tspu");
```

`valid` - checks if raw http request is valid

```js
http.valid("GET /  HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n"); // false

http.valid("GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n"); // true
```

`blocked` - checks if raw http request is blocked

```js
http.blocked(
  "GET / HTTP/1.1\r\nHost: api.example.com\r\nUser-Agent: node\r\n",
  "example.com"
); // true

http.blocked(
  "GET / HTTP/1.1\r\nHost: exampled.com\r\nUser-Agent: node\r\n",
  "example.com"
); // false
```

Cross domains

```js
http.blocked("GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n", [
  ["example.com", "123.123.123.123:443"],
]); // false

http.blocked(
  "GET / HTTP/1.1\r\nHost: example.com:443\r\nUser-Agent: node\r\n",
  [
    ["example.com", "123.123.123.123:443"],
    ["example.com", "123.123.123.123:444"],
    ["example.com", "123.123.123.123:445"],
  ]
); // true
```

## Test

```js
npm test
```
