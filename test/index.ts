import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { http, tcp } from "../index";

describe("http", () => {
  describe("valid", () => {
    it("should return false on empty request", () => {
      const expected = false;
      const request = "";

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on all lowercased http headers", () => {
      const expected = false;
      const request = `GET / HTTP/1.1\r\nhost: example.com\r\nuser-agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on all uppercase http headers", () => {
      const expected = false;
      const request = `GET / HTTP/1.1\r\nHOST: example.com\r\nUSER-AGENT: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return true on pascal-case http headers", () => {
      const expected = true;
      const request = `GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on pascal-case http headers with uppercase at end", () => {
      const expected = false;
      const request = `GET / HTTP/1.1\r\nHost: example.com\r\nUser-AgenT: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on pascal-case http headers with uppercase at middle of word", () => {
      const expected = false;
      const request = `GET / HTTP/1.1\r\nHost: example.com\r\nUser-AgEnt: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on no space after semicolon", () => {
      const expected = false;
      const request = `GET / HTTP/1.1\r\nHost:example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on additional spaces in request line before method", () => {
      const expected = false;
      const request = `GET  / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on additional spaces in request line after method", () => {
      const expected = false;
      const request = `  GET  / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on additional spaces in request line after path", () => {
      const expected = false;
      const request = `GET /  HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return true on valid request line", () => {
      const expected = true;
      const request = `GET /path/to/file HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on mixed pascal-case header keys", () => {
      const expected = false;
      const request = `GET /path/to/file HTTP/1.1\r\nHost: example.com\r\nUser-AgEnt: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on malformed headers spacing", () => {
      const expected = false;
      const request = `GET /path/to/file HTTP/1.1\r\nAccept: text/html\r\n\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on not one space after semicolon", () => {
      const expected = false;
      const request = `GET /path/to/file HTTP/1.1\r\nAccept: text/html\r\nHost:  example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return false on space before semicolon", () => {
      const expected = false;
      const request = `GET /path/to/file HTTP/1.1\r\nAccept: text/html\r\nHost : example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });

    it("should return true on special upper-case headers", () => {
      const expected = true;
      const request = `GET /path/to/file HTTP/1.1\r\nDNT: 1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n`;

      const actual = http.valid(request);

      assert.strictEqual(actual, expected);
    });
  });

  describe("blocked", () => {
    const domain = "example.com";

    it("should return false for empty request", () => {
      const expected = false;
      const request = "";

      const actual = http.blocked(request, domain);

      assert.strictEqual(actual, expected);
    });

    it("should return true for example.com domain request", () => {
      const expected = true;
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domain);

      assert.strictEqual(actual, expected);
    });

    it("should return true for api.example.com domain request", () => {
      const expected = true;
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domain);

      assert.strictEqual(actual, expected);
    });

    it("should return false for api.exampled.com domain request with body containing example.com", () => {
      const expected = false;
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.exampled.com\r\nUser-Agent: node\r\n\r\nexample.com";

      const actual = http.blocked(request, domain);

      assert.strictEqual(actual, expected);
    });

    it("should return false for api.exampled.com domain request with empty", () => {
      const expected = false;
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.exampled.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domain);

      assert.strictEqual(actual, expected);
    });

    it("should return true for blocked ip request with many domains", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: 123.123.123.123\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should return true for blocked domain request with many domains", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should return true for blocked domain request and port with many domains", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: 123.123.123.123:443\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should return true for blocked domain request and port should not matter with many domains", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: 123.123.123.123:1337\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should return false for blocked domain request and port should not matter with many domains", () => {
      const expected = false;
      const domains = [["example.com", "123.123.123.123"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: 123.123.123.124:1337\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not block other but given ports in domain with port if specified in domain", () => {
      const expected = false;
      const domains = [["example.com", "123.123.123.123:443"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com:80\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should block given port in domain with port if specified in domain host", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123:80"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com:80\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should block subdomain", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123:80"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com:80\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not block domain without port and ip specifying port", () => {
      const expected = false;
      const domains = [["example.com", "123.123.123.123:443"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should block domain without port and ip specifying port", () => {
      const expected = true;
      const domains = [["example.com", "123.123.123.123:443"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com:443\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should block domain without port but with ip specifying port in one of domains", () => {
      const expected = true;
      const domains = [
        ["example.com", "123.123.123.123:1335"],
        ["example.com", "123.123.123.123:1336"],
        ["example.com", "123.123.123.123:1337"],
        ["example.com", "123.123.123.123:1338"],
      ];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com:1337\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not block subdomain if subdomain in domains specified and given another", () => {
      const expected = false;
      const domains = [["api.example.com", "123.123.123.123:80"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: abi.example.com:80\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should block request without host", () => {
      const expected = true;
      const domains = [["api.example.com", "123.123.123.123:80"]];
      const request = "GET /path/to/file HTTP/1.1\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not depend on order of domain entries when domain and port", () => {
      const expected = true;
      const domains = [["123.123.123.123:80", "example.com"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com:80\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not depend on order of domain entries when domain and no port", () => {
      const expected = true;
      const domains = [["123.123.123.123", "example.com"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not depend on order of domain entries when subdomain and no port", () => {
      const expected = true;
      const domains = [["123.123.123.123", "api.example.com"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: api.example.com\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });

    it("should not depend on order of domain entries when ip", () => {
      const expected = true;
      const domains = [["123.123.123.123", "api.example.com"]];
      const request =
        "GET /path/to/file HTTP/1.1\r\nHost: 123.123.123.123\r\nUser-Agent: node\r\n\r\n";

      const actual = http.blocked(request, domains);

      assert.strictEqual(actual, expected);
    });
  });
});

describe("tcp", () => {
  const openvpnHandshake = [0x04, 0x00, 0x00, 0x00];

  it("should detect openvpn with comma separated arguments", () => {
    const expected = true;
    const session = new tcp.Session();

    session.feed(...openvpnHandshake);
    session.feed(0x13, 0x37, 0x13, 0x37);
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should detect openvpn with array argument", () => {
    const expected = true;
    const session = new tcp.Session();

    session.feed(openvpnHandshake);
    session.feed([0x13, 0x37, 0x13, 0x37]);
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should detect openvpn with typed array", () => {
    const expected = true;
    const session = new tcp.Session();

    session.feed(new Uint8Array(openvpnHandshake));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should ignore unbanned protocol", () => {
    const expected = false;
    const session = new tcp.Session();

    session.feed(new Uint8Array([0x03, 0x00, 0x00, 0x00]));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should detect openvpn with leading zero bytes", () => {
    const expected = true;
    const session = new tcp.Session();

    session.feed(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    session.feed(new Uint8Array(openvpnHandshake));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should allow to make extensions that block", () => {
    const expected = true;
    const session = new tcp.Session();
    session.extend([0x01, 0x02, 0x03, 0x04]);

    session.feed(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    session.feed(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should allow to make extensions that block with custom logic", () => {
    const expected = true;
    const session = new tcp.Session();
    session.extend((originalBytes) => originalBytes[7] === 0x08);

    session.feed(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    session.feed(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should allow to make extensions that ignore legitimate bytes", () => {
    const expected = false;
    const session = new tcp.Session();
    session.extend([0x02, 0x03, 0x04, 0x05]);

    session.feed(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    session.feed(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    session.feed(new Uint8Array([0x13, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should allow fluent usage", () => {
    const expected = true;
    const session = new tcp.Session();
    session
      .extend([0x01, 0x03, 0x04])
      .extend([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

    session
      .feed(new Uint8Array([0x01, 0x02, 0x03, 0x04]))
      .feed(new Uint8Array([0x05, 0x06, 0x07, 0x08]))
      .feed(new Uint8Array([0x5, 0x37, 0x13, 0x37]));
    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });

  it("should not block with empty bytes", () => {
    const expected = false;
    const session = new tcp.Session();

    const actual = session.blocked();

    assert.strictEqual(actual, expected);
  });
});
