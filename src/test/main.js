import tester from './tester';
import compareTests from './compare-tests';
import apiTests from './api-tests';
import layoutTests from './layout-tests';

const test = tester({
  verbose: false,
  failFast: true,
});

compareTests(test);
apiTests(test);
layoutTests(test);

test.done();
