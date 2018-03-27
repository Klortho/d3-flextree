const rnd6 = number => {
  const v = Math.round(1000000 * number) / 1000000;
  return Math.abs(v) > 0.000001 ? v : 0;
}
function kids(graph) {
  return graph.children || [];
}
function numKids(graph) {
  return kids(graph).length;
}
function makeTree(data) {
  const tree = { size: [data[0], data[1]] };
  if (data.length > 2) tree.children = data.slice(2).map(makeTree);
  return tree;
}
// very simple deep clone utility
function clone(obj) {
  const t = typeof obj;
  if (t === 'undefined') return undefined;
  if (obj === null || ['number', 'string', 'boolean'].indexOf(t) !== -1) return obj;
  if (Array.isArray(obj)) return obj.map(item => this.clone(item));
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = this.clone(obj[key]);
    return acc;
  }, {});
}
function _dumpLayout(layout, indent) {
  const log = str => console.log('  '.repeat(indent) + str);
  const hasKids = (layout.children || []).length > 0;
  log(`[ ${layout.x}, ${layout.y}, ` + (hasKids ? '' : '],'));
  if (hasKids) {
    layout.children.forEach(kid => _dumpLayout(kid, indent + 1));
    log('],');
  }
}
function dumpLayout(treeDesc, layout) {
  console.log(treeDesc);
  _dumpLayout(layout, 0);
}
function layoutEqual(t, actual, expected, address=[0]) {
  t.is(rnd6(actual.x), rnd6(expected[0]), 'node address: ' + address);
  t.is(rnd6(actual.y), rnd6(expected[1]), 'node address: ' + address);
  const expKids = expected.slice(2);
  t.is(numKids(actual), expKids.length, 'node address: ' + address);
  if (numKids(actual) === 0) return true;
  return kids(actual).map((akid, i) =>
    layoutEqual(t, akid, expKids[i], address.concat(i))
  ).every(result => result);
}

module.exports = {
  makeTree,
  clone,
  dumpLayout,
  layoutEqual,
};
