import test from 'ava';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const BrowserTester = require('./helpers/browser-tester.js');

test('test in browser, standalone', t => {
  const tester = new BrowserTester(t, false, 'test/browser-test-standalone.html');
  return tester.done;
});

test('test in browser, with d3', t => {
  const tester = new BrowserTester(t, false, 'test/browser-test-with-d3.html');
  return tester.done;
});
