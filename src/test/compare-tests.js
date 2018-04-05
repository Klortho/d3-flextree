import {deepEqual, deepClose} from './compare';

const tests = test => {
  test('deepEqual types', t => {
    t.true(deepEqual(0, 0));
    t.true(deepEqual(null, null));
    t.true(deepEqual(NaN, NaN));
    t.true(deepEqual(false, false));

    t.true(deepEqual([], []));
    t.true(deepEqual({}, {}));

    const resultA = deepEqual(5, []);
    t.true(Array.isArray(resultA));
    t.is(resultA.length, 1);
    const ra0 = resultA[0];
    t.true('desc' in ra0);
    t.is(typeof ra0.desc, 'string');
    t.true(ra0.desc.includes('type'));
    t.true('path' in ra0);
    t.true(Array.isArray(ra0.path));
    t.is(ra0.path.length, 0);

    t.is(deepEqual([[]], [[]]), true);
  });

  test('deepEqual values', t => {
    const actual = [0, 'a', false, {}];
    t.true(deepEqual(actual, [0, 'a', false, {}]));
    // test that it only compares keys in expected
    t.true(deepEqual(actual, [0, 'a']));
    // test expected array missing a middle value
    const expA = [0];
    expA[2] = false;
    t.true(deepEqual(actual, expA));

    const resultB = deepEqual(actual, [0, 9, 'a']);
    t.true(Array.isArray(resultB) && resultB.length === 1 &&
      ('desc' in resultB[0]) && typeof resultB[0].desc === 'string' &&
      resultB[0].desc.includes('value'));
  });

  const testArr = () => {
    let undefined;
    const arr = [];
    arr[1] = null;
    arr[2] = undefined;
    arr[5] = -5;
    arr[7] = NaN;
    arr[8] = {};
    arr[9] = 100;
    return arr;
  };
  const testObj = () => {
    const obj = {
      a: 123,
      '-2': [ 4, true, null ],
      'false': {
        ca: 7.8,
        'class': NaN,
        n: [ 7, 8, { yabble: 'blop' } ],
      },
      cat: 'scratch',
      bat: 7,
    };
    obj[2] = 2;
    return obj;
  };

  test('deepEqual nested', t => {
    t.true(deepEqual(testArr(), testArr()), 'test array equal to itself');

    const expA = [];
    expA[7] = NaN;
    t.true(deepEqual(testArr(), expA), 'sparse expected array');

    t.true(deepEqual(testObj(), testObj()), 'test object equal to itself');

    const expB = testObj();
    delete expB['-2'];
    delete expB['false'].ca;
    t.true(deepEqual(testObj(), expB), 'sparse expected object');
  });

  test('deepClose', t => {
    const actA = testArr();
    const expA = testArr();
    expA[9] = 100.00000001;
    t.true(Array.isArray(deepEqual(actA, expA)), 'arrays close but not equal');
    const closeA = deepClose(actA, expA);
    t.true(closeA, 'arrays are close');

    const actB = testObj();
    const expB = testObj();
    delete expB.cat;
    expB['false'].ca += 0.000000001;
    t.true(Array.isArray(deepEqual(actB, expB)), 'objects not equal');
    t.true(deepClose(actB, expB), 'objects are close');
  });

  test('failFast off', t => {
    t.true(deepEqual(testArr(), testArr(), false));

    const actA = testObj();
    const expA = testObj();
    expA.bat = 7.01;
    expA['false'].n[2].yabble = 'bloop';
    const ra = deepEqual(actA, expA, false);
    t.is(ra.length, 2);
    const ra0 = ra[0];
    t.true(ra0.desc.includes('bloop') && ra0.desc.includes('blop'));
    const ra0p = ra[0].path;
    t.is(ra0p[0], 'false');
    t.is(ra0p[1], 'n');
    t.is(ra0p[2], '2');
    t.is(ra0p[3], 'yabble');
  });

  test('expected function', t => {
    const actA = testObj();
    const expA = testObj();
    expA['false'].n[2].yabble = str => str.length === 4;
    expA.cat = str => str.length === 7;
    const resA = deepEqual(actA, expA);
    t.true(resA);

    const actB = actA;
    const expB = testObj();
    expB.cat = str => str.length === 6;
    const resB = deepEqual(actB, expB);
    t.true(Array.isArray(resB));
  });
};

export default tests;
