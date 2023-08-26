module.exports = {
  valid: (request) => {
    if (!request) return false;

    const segments = request.split("\r\n");

    const keys = segments.slice(1).map((line) => line.split(":"));

    const headers = keys.slice(0, -2);

    if (headers.some(([entry]) => !entry)) return false;
    if (headers.some(([key]) => /-{2,}/.test(key))) return false;
    if (headers.some(([key]) => key.trim() !== key)) return false;
    if (headers.some(([, value]) => !/^ [^ ]/.test(value))) return false;
    if (!/^[A-Z]+ [^ ]+ HTTP\/(0.9|1.0|1.1)$/.test(segments[0])) return false;
    if (headers.every(([key]) => /^[A-Z]+(-[A-Z]+)*$/.test(key))) return false;
    if (headers.every(([key]) => /^[a-z]+(-[a-z]+)*$/.test(key))) return false;

    for (const part of headers.flatMap(([key]) => key.split("-"))) {
      if (
        /[A-Z]/.test(part[0]) &&
        /([A-Z]+[a-z]+)|([a-z]+[A-Z]+)/.test(part.slice(1))
      )
        return false;
    }

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
