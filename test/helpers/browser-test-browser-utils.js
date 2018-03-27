// Include this script at the top of HTML test pages.

// What environment are we running in?
const inNode = '_inNode' in window && window._inNode === true;

// The `assert` object has methods for most of the assertions defined by ava.
// Since ava doesn't run in the browser environment, this passes the arguments
// to the virtual console `info` method. When running under node/ava,
// the test runner will handle these by invoking the real ava assertion
// method with the arguments.

class Assertion {
  constructor(name, testArity, test) {
    this.name = name;
    this.test = test;
    this.testArity = testArity;
  }
  get function() {
    const func = inNode
      ? (...args) => {
          console.info(this.name, ...args)
        }
      : (...args) => {
          const msg = args.length > this.testArity ? ': ' + args[this.testArity] : '';
          const pass = this.test(...args);
          if (!pass) throw Error(`assertion ${this.name} failed${msg}`);
        };
    func.assertion = this;
    return func;
  }

  objectPair() {
    return {[this.name]: this.function};
  }
  static objectPair(assertion) {
    return assertion.objectPair();
  }
}

const assertionList = [
  ['pass', 0, () => true],
  ['fail', 0, () => false],
  ['truthy', 1, value => !!value],
  ['falsy', 1,  value => !value],
  ['true', 1, value => value === true],
  ['false', 1, value => value === false],
  ['is', 2, (value, expected) => Object.is(value, expected)],
  ['not', 2, (value, expected) => !Object.is(value, expected)],
  // FIXME: implement these
  ['deepEqual', 2, (value, expected) => false],
  ['notDeepEqual', 2, (value, expected) => false],
].map(data => new Assertion(...data));

const assert = Object.assign({}, ...assertionList.map(Assertion.objectPair));
