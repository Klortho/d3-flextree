// Require this module at the top of the ava test scripts for browser tests.

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const channelNames = ['log', 'info', 'warn', 'error'];

// This utility function makes a Promise, and then binds the resolve and reject
// callbacks to the promise object itself.
function makePromise() {
  var resolve, reject;
  const p = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return Object.assign(p, {resolve, reject});
}

// Encapsulates the handler and the history for one of the virtual console's
// methods ('log', 'error', etc.)
class ConsoleChannel {
  constructor(vcon, name, verbose) {
    Object.assign(this, {
      name,
      verbose,
      history: [],
    });
    // Set the handler on the virtual console
    vcon.on(name, (...args) => {
      this.history.push(args);
      // optionally log it to the real console
      if (verbose || name === 'log')
        console[name](`Virtual console.${name}: `, ...args);
      if ('postProcess' in this) this.postProcess(...args);
    });
  }
  get objectPair() {
    return {[this.name]: this};
  }
}

class BrowserTester {
  constructor(t, verbose, htmlFile) {
    Object.assign(this, {
      t,
      verbose,
      htmlFile,
    });

    const vcon = new jsdom.VirtualConsole();
    const channels = Object.assign({},
      ...channelNames.map(name =>
        (new ConsoleChannel(vcon, name, verbose)).objectPair)
    );

    // `domDone` will be resolved (or rejected) when the test
    // script running under jsdom logs the word "done" to `console.info`.
    const domDone = makePromise();

    // The virtual console.info channel listens for 'done', and then
    // resolves (or rejects) domDone.
    const {info, error} = channels;
    info.postProcess = (...args) => {
      if (args.length === 1 && args[0] === 'done') {
        if (error.history.length === 0) {
          domDone.resolve();
        }
        else {
          domDone.reject('Virtual console.error messages: ' +
            error.history.join('\n  '));
        }
      }
    };

    // `done` is resolved when all of the test assertions passed here from
    // the dom script are completed
    const done = domDone.then(() => {
      info.history.forEach(assertData => {
        if (assertData.length === 1 && assertData[0] === 'done') return;
        const [name, ...args] = assertData;
        t[name](...args);
      });
      return 'done';
    });

    const dom = JSDOM.fromFile(htmlFile, {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole: vcon,
      beforeParse(window) {
        window._inNode = true;
      },
    });

    Object.assign(this, {
      vcon,
      channels,
      domDone,
      done,
      dom,
    });
  }
}

Object.assign(BrowserTester, {
  channelNames,
  makePromise,
  ConsoleChannel,
});

module.exports = BrowserTester;
