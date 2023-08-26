# tspu

`Technical tools for danger mitigation`

## Install

`npm i --save tspu`

## API

```js
type Http = {
  valid: (request: string) => boolean;
  blocked: (request: string, domain: string) => boolean;
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

## Test

```js
npm test
```
