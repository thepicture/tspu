"use strict";

class Firewall {
  options = {};

  constructor(options) {
    this.options = options;
  }

  legit(session) {
    if (!session?.stream?.state) {
      return false;
    }

    const { rules } = this.options;

    for (const [key, filter] of Object.entries(rules)) {
      const contradictingRulesDetected =
        Array.isArray(filter.in) &&
        Array.isArray(filter.not?.in) &&
        !filter.in.length &&
        !filter.not.in.length;

      if (contradictingRulesDetected) {
        throw new Error(`Contradicting rules detected for key ${key}`);
      }

      const value = session.stream.state[key];

      return this.#checkValueAgainstFilter(value, filter);
    }
  }

  #checkValueAgainstFilter(value, filter) {
    if (filter.in && !filter?.in?.includes(value)) {
      return false;
    }

    if (filter?.not?.in?.includes(value)) {
      return false;
    }

    if (filter.or) {
      for (const entry of filter.or || []) {
        if (this.#checkValueAgainstFilter(value, entry)) {
          return true;
        }
      }

      return false;
    }

    for (const entry of filter?.and || []) {
      if (!this.#checkValueAgainstFilter(value, entry)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  Firewall,
};
