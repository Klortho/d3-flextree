/* eslint-disable complexity, indent */
export const type = value => {
  const t = typeof value;
  return value === null || t === 'undefined' || t === 'number' ||
    t === 'string' || t === 'boolean' ? 'scalar'
    : t === 'function' ? 'function'
    : Array.isArray(value) ? 'array'
    : 'object';
};
/* eslint-enable complexity, indent */

// This returns true if the `actual` matches `expected` at every path at
// which expected is defined. If `expected` is a scalar, then `compare` is
// used to determine a match. If `expected` is a function, then that function,
// evaluated against `actual`, is used to determine a match. For
// `compare` or an `expected` function, a return value of
// `true` indicates a match; anything else is considered a mismatch.
// If there are any mismatches, then this returns an array of {path, desc}.
// If `findAll` is false, then the array will have only the first mismatch.
/* eslint-disable complexity */
export const deepCompare = compare => {
  const _dc = (actual, expected, failFast=true, path=[]) => {
    const mismatches = [];
    const mismatch = desc => {
      mismatches.push({ desc, path: path.slice() });
    };
    const t = type(expected);
    const aType = type(actual);

    if (t === 'function') {
      const result = expected(actual);
      if (result !== true) mismatch(result);
    }
    else if (t !== aType) {
      mismatch(`Expected type ${t}, found ${aType}`);
    }
    else if (t === 'scalar') {
      if (compare(actual, expected) !== true) {
        mismatch(`Expected value to match ${expected}, found ${actual}`);
      }
    }
    else if (t === 'array' || t === 'object') {
      for (const key of Object.keys(expected)) {
        if (!(key in actual)) {
          mismatch(`Missing expected key ${key}`);
          if (failFast) break;
        }
        const result = _dc(actual[key], expected[key], failFast, path.concat(key));
        if (result !== true) {
          mismatches.push(...result);
          if (failFast) break;
        }
      }
    }
    return mismatches.length === 0 ? true : mismatches;
  };
  return _dc;
};
/* eslint-enable complexity */

export const deepEqual =
  deepCompare((actual, expected) => Object.is(actual, expected));

export const round6 = number => {
  const v = Math.round(1000000 * number) / 1000000;
  return Math.abs(v) > 0.000001 ? v : 0;
};

export const close = (actual, expected) =>
  Object.is(actual, expected) || round6(+actual) === round6(+expected);

export const deepClose = deepCompare(close);
