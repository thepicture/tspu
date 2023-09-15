module.exports = {
  valid: (request) => {
    if (!request) return false;

    if (request.includes("\t")) return false;

    const segments = request.split("\r\n");

    try {
      if (decodeURI(segments[0]).includes("..")) throw 0;
      if (decodeURI(segments[0]).includes("\x00")) throw 0;
    } catch {
      return false;
    }

    const keys = segments.slice(1).map((line) => line.split(":"));

    const headers = keys.slice(0, -2);

    if (headers.some(([entry]) => !entry)) return false;
    if (headers.some(([, , entry]) => entry)) return false;
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
    const isDomainArray = Array.isArray(domain);

    if (isDomainArray && !domain.length) return false;

    if (!request) return false;

    const lines = request.split("\r\n");

    const [host, port] = (
      lines.find((line) => line.toLowerCase().startsWith("host"))?.split(":") ||
      []
    )
      .slice(1)
      .map((segment) => segment.trim());

    if (!host) return true;

    for (const line of lines) {
      if (!line) return false;

      if (isDomainArray) {
        for (const [site, ip] of domain) {
          const [siteIp, sitePort] = ip.split(":");

          const hostPort = [host, port].join(":");

          if (siteIp && sitePort) {
            if (hostPort.endsWith([site, sitePort].join(":"))) return true;
            if (hostPort.endsWith([siteIp, sitePort].join(":"))) return true;

            continue;
          }

          if ([site, ip].includes(host)) return true;
          if ([site, ip].includes(hostPort)) return true;
        }

        continue;
      }

      if (line.includes(domain)) return true;
    }

    return false;
  },
};
