# tspu

`Technical tools for danger mitigation`

## Install

`npm i --save tspu`

## API

```js
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

type FirewallRuleDictionary =
  | {
      [key: string]: {
        in: number[];
      };
    }
  | {
      [key: string]: {
        not: {
          in: number[];
        };
      };
    };

type FirewallOptions = {
  rules: FirewallRuleDictionary;
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

session.blocked(); // true
```

```js
import { tcp } from "tspu";

const session = new tcp.Session();

session.feed(1, 2, 3, 4);
session.feed(new Uint16Array([1, 2, 3, 4]));
session.feed([1, 2, 3], [3, 4, 5]);
session.feed(new Uint16Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8]));

console.log(session.bytes); // all the bytes that have been feed
console.log(session.blocked());
```

Custom extensions

```js
const session = new tcp.Session();

session
  .extend([0x01, 0x03, 0x04])
  .extend([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

session
  .feed(new Uint8Array([0x01, 0x02, 0x03, 0x04]))
  .feed(new Uint8Array([0x05, 0x06, 0x07, 0x08]))
  .feed(new Uint8Array([0x5, 0x37, 0x13, 0x37]));

console.log(session.blocked());
```

Cipher manual block

```js
const session = new tcp.Session();
session.banCipher(["aes128-gcm-sha256", "aes128-sha", "aes128-sha"]);

session.feedCipher(["aes128-gcm-sha256", "aes128-sha", "aes128-sha"]);
session.blocked(); // true
```

Cipher autoblock based on diff between the known and the current cipher

```js
const session = new tcp.Session({ autoblock: true, sensitivity: 2 });

session.banCipher(["aes128-gcm-sha256", "aes128-sha", "aes128-sha"]);

session.feedCipher([
  "aes128-gcm-sha256",
  "aes128-sha",
  "___",
  "aes128-sha",
  "___",
]);

session.blocked(); // true
```

`tcp` module allows to subscribe to `blocked` event

```js
session.on("blocked", (reason) => {
  console.log(reason.ciphers);
});
```

`http2` module

```js
const session = {
  stream: {
    state: {
      localWindowSize: 16,
    },
  },
} as Http2ServerRequest;

const firewall = new http2.Firewall({
  rules: {
    localWindowSize: {
      in: [16],
    },
  },
});

firewall.legit(session); // true
```

## Test

```js
npm test
```
