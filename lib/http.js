module.exports = {
  valid: (request) => {
    if (!request) return false;

    const segments = request.split("\r\n");

    const keys = segments
      .slice(1)
      .filter(Boolean)
      .map((line) => line.split(":"));

    if (!/^[A-Z]+ [^\s]+ HTTP\/(0.9|1.0|1.1)$/.test(segments[0])) return false;

    if (keys.some(([, [symbol]]) => symbol !== " ")) return false;
    if (keys.some(([key]) => /^[a-z-]+$/.test(key))) return false;
    if (keys.some(([key]) => /^[A-Z-]+$/.test(key))) return false;

    return true;
  },
  blocked: (request, domain) => {
    if (!request) return false;

    const lines = request.split("\r\n");

    for (const line of lines) {
      if (!line) return false;

      if (line.includes(domain)) return true;
    }

    return false;
  },
};
