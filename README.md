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

### tcp

```js
const { tcp } = require("tspu");

const session = new tcp.Session();

session.feed(0x04, 0x00, 0x00, 0x00); // openvpn handshake
session.feed(0x13, 0x37, 0x13, 0x37);
const actual = session.blocked(); // true
```

```js
import { tcp } from "tspu";

const session = new tcp.Session();
session.feed(1, 2, 3, 4);
session.feed(new Uint16Array([1, 2, 3, 4]));
session.feed([1, 2, 3], [3, 4, 5]);
session.feed(new Uint16Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8]));

console.log(session.bytes); // number array of the whole bytes feed
console.log(session.blocked());
```

## Test

```js
npm test
```
