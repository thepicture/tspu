"use strict";

module.exports = {
  compare: (firstArray, secondArray) => {
    // https://stackoverflow.com/a/39811025
    return [
      ...secondArray.reduce(
        (accumulator, value) =>
          accumulator.set(value, (accumulator.get(value) || 0) - 1),
        firstArray.reduce(
          (accumulator, value) =>
            accumulator.set(value, (accumulator.get(value) || 0) + 1),
          new Map()
        )
      ),
    ].reduce(
      (accumulator, [value, count]) =>
        accumulator.concat(Array(Math.abs(count)).fill(value)),
      []
    ).length;
  },
};
