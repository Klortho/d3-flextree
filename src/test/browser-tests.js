const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const htmlFile = 'test/test.html';


const vcon = new jsdom.VirtualConsole();
vcon.sendTo(console);
const testPromise = new Promise(resolve => vcon.on('info', resolve));

JSDOM.fromFile(htmlFile, {
  runScripts: 'dangerously',
  resources: 'usable',
  virtualConsole: vcon,
  beforeParse(window) {
    window._inJsdom = true;
  },
}).then(() => {
  return testPromise;
}).then(failedCount => {
  process.exit(failedCount - 0);
});
