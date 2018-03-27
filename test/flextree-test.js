import test from 'ava';
const util = require('util');
const d3 = require('../dist/d3-flextree');
const treeData = require('./helpers/test-trees').trees;
const testUtils = require('./helpers/test-utils');

const flextree = d3.flextree,
      hierarchy = d3.hierarchy,
      Node = hierarchy.prototype.constructor;

const inspect = obj => util.inspect(obj, {depth: null});
const dump = (name, obj) => console.log(name + ': ' + inspect(obj));

test('test exports', t => {
  t.is(typeof flextree, 'function');
  const layout = flextree();
  t.is(typeof layout, 'function');
});

treeData.forEach((testTree, i) => {
  test(`test layout of tree ${i}: ${testTree.desc}`, t => {
    const layout = flextree(),
          tree = testUtils.makeTree(testTree.data),
          ltree = layout(tree);
    return testUtils.layoutEqual(t, ltree, testTree.expected);
  });
});

treeData.forEach((testTree, i) => {
  test(`test overridden accessors, tree ${i}: ${testTree.desc}`, t => {
    const opts = {
            nodeSize: d => d.slice(0, 2),
            children: d => d.slice(2),
          },
          layout = flextree(opts),
          ltree = layout(testTree.data);
    return testUtils.layoutEqual(t, ltree, testTree.expected);
  });
});
