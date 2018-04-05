import assert from './assert';

const defaults = {
  verbose: false,
  failFast: false,
  /* eslint-disable no-console */
  log: console.log.bind(console),
  error: console.error.bind(console),
  /* eslint-disable no-console */
};
const tester = opts => {
  const options = Object.assign({}, defaults, opts);
  const {verbose, failFast, log, error} = options;
  const results = [];
  let failedCount = 0;
  const test = (desc, testFunc) => {
    if (failedCount > 0 && failFast) return;
    try {
      if (verbose) log(`Test ${desc}`);
      testFunc(assert);
      if (verbose) log('passed');
      results.push([desc, true]);
    }
    catch(err) {
      error(`Test ${desc} failed: `, err);
      results.push([desc, false]);
      failedCount++;
    }
  };
  const done = () => {
    if (failedCount === 0) {
      log('All passed');
    }
    else {
      if (failFast) error('Failed');
      else error(`Failed ${failedCount} of ${results.length}`);
    }
    if (typeof process === 'undefined') {
      console.info(failedCount);
    }
    else {
      process.exit(failedCount);
    }
  };
  Object.assign(test, options, {
    results,
    done,
  });
  return test;
};

export default tester;
