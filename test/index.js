const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const { http } = require("..");

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
  });
});
