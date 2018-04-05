import {close, deepEqual, deepClose} from './compare';

export class Assertion {
  constructor(name, arity, test) {
    this.name = name;
    this.test = test;
    this.arity = arity;
  }
  get function() {
    const func = (...args) => {
      const msg =
        args.length > this.arity ? ': ' + args[this.arity]
          : ', arguments: ' + args;
      const pass = this.test(...args);
      if (!pass) throw Error(`assertion '${this.name}' failed${msg}`);
    };
    func.assertion = this;
    return func;
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
  ['deepEqual', 2, (value, expected) => deepEqual(value, expected) === true],
  ['notDeepEqual', 2, (value, expected) => deepEqual(value, expected) !== true],
  ['close', 2, (value, expected) => close(value, expected)],
  ['deepClose', 2, (value, expected) => deepClose(value, expected) === true],
  ['notDeepClose', 2, (value, expected) => deepClose(value, expected) !== true],
].map(data => new Assertion(...data));

export default Object.assign({},
  ...assertionList.map(a => ({ [a.name]: a.function }))
);
