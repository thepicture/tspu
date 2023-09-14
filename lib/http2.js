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

      for (const [operator, values] of Object.entries(filter)) {
        switch (operator) {
          case "in": {
            if (values.every((entry) => entry !== value)) {
              return false;
            }

            break;
          }
          case "not": {
            for (const [inOperator, inValues] of Object.entries(filter.not)) {
              switch (inOperator) {
                case "in": {
                  if (inValues.some((entry) => entry === value)) {
                    return false;
                  }

                  break;
                }
              }
            }
          }
        }
      }
    }

    return true;
  }
}

module.exports = {
  Firewall,
};
