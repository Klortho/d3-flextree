import {flextree} from '../../index.js';
import {hierarchy} from 'd3-hierarchy';
import {version} from '../../package.json';

// Several different ways of representing the same tree.
export const treeData = {
  default: {
    name: 'algert',
    size: [1, 1],
    children: [
      { name: 'blat',
        size: [2, 4],
      },
      { name: 'cluckoo',
        size: [3, 1],
        children: [
          { name: 'dornk',
            size: [4, 1],
          },
        ],
      },
    ],
  },
  customSize: {
    name: 'algert',
    width: 1, height: 1,
    children: [
      { name: 'blat',
        width: 2, height: 4,
      },
      { name: 'cluckoo',
        width: 3, height: 1,
        children: [
          { name: 'dornk',
            width: 4, height: 1,
          },
        ],
      },
    ],
  },
  customChildren: {
    name: 'algert',
    size: [1, 1],
    kids: [
      { name: 'blat',
        size: [2, 4],
      },
      { name: 'cluckoo',
        size: [3, 1],
        kids: [
          { name: 'dornk',
            size: [4, 1],
          },
        ],
      },
    ],
  },
  allCustom:
  [ 'algert', 1, 1,
    [ 'blat', 2, 4 ],
    [ 'cluckoo', 3, 1,
      [ 'dornk', 4, 1 ],
    ],
  ],
};

export const expected = {
  default: {
    x: 0, y: 0,
    children: [
      { x: -1.75, y: 1 },
      { x: 1.25, y: 1,
        children: [
          { x: 1.25, y: 2 },
        ],
      },
    ],
  },
  sizeConst: {
    x: 0, y: 0,
    children: [
      { x: -1, y: 2 },
      { x: 1, y: 2,
        children: [
          { x: 1, y: 4 },
        ],
      },
    ],
  },
  sizeScaled: {
    x: 0, y: 0,
    children: [
      { x: -3.5, y: 2 },
      { x: 2.5, y: 2,
        children: [
          { x: 2.5, y: 4 },
        ],
      },
    ],
  },
  spacingConst: {
    x: 0, y: 0,
    children: [
      { x: -2, y: 1 },
      { x: 1.5, y: 1,
        children: [
          { x: 1.5, y: 2 },
        ],
      },
    ],
  },
  spacingFunc: {
    x: 0, y: 0,
    children: [
      { x: -3.75, y: 1 },
      { x: 3.25, y: 1,
        children: [
          { x: 3.25, y: 2 },
        ],
      },
    ],
  },
  bothFunc: {
    x: 0, y: 0,
    children: [
      { x: -5.5, y: 2 },
      { x: 4.5, y: 2,
        children: [
          { x: 4.5, y: 4 },
        ],
      },
    ],
  },
};

const getName = node => node.data.name;
const ref = eNode => aNode => getName(aNode) === getName(eNode);

const tests = test => {
  // eslint-disable-next-line no-console
  const log = test.verbose ? console.log.bind(console) : () => {};

  test('exports', t => {
    t.is(typeof flextree, 'function');
    const layout = flextree();
    t.is(typeof layout, 'function');
    t.is(flextree.version, version);
  });

  test('flextree hierarchy, defaults', t => {
    const layout = flextree();
    const tree = layout.hierarchy(treeData.default);
    const [algert, blat, cluckoo, dornk] = tree.nodes;
    layout(tree);
    log(layout.dump(tree));

    t.deepClose(algert, {
      parent: null, depth: 0, height: 2, length: 4,
      size: [1, 1], xSize: 1, ySize: 1,
      noChildren: false, hasChildren: true, numChildren: 2,
      firstChild: ref(blat), lastChild: ref(cluckoo),
      x: 0, y: 0,
      top: 0, bottom: 1, left: -0.5, right: 0.5,
      nodeExtents: { top: 0, bottom: 1, left: -0.5, right: 0.5 },
      extents: { top: 0, bottom: 5, left: -2.75, right: 3.25 },
    }, 'algert');

    t.deepClose(blat, {
      parent: ref(algert), depth: 1, height: 0, length: 1,
      size: [2, 4], xSize: 2, ySize: 4,
      noChildren: true, hasChildren: false, numChildren: 0,
      firstChild: null, lastChild: null,
      x: -1.75, y: 1,
      top: 1, bottom: 5, left: -2.75, right: -0.75,
      nodeExtents: { top: 1, bottom: 5, left: -2.75, right: -0.75 },
      extents: { top: 1, bottom: 5, left: -2.75, right: -0.75 },
    }, 'blat');

    t.deepClose(cluckoo, {
      parent: ref(algert), depth: 1, height: 1, length: 2,
      size: [3, 1], xSize: 3, ySize: 1,
      noChildren: false, hasChildren: true, numChildren: 1,
      firstChild: ref(dornk), lastChild: ref(dornk),
      x: 1.25, y: 1,
      top: 1, bottom: 2, left: -0.25, right: 2.75,
      nodeExtents: { top: 1, bottom: 2, left: -0.25, right: 2.75 },
      extents: { top: 1, bottom: 3, left: -0.75, right: 3.25 },
    }, 'cluckoo');

    t.deepClose(dornk, {
      parent: ref(cluckoo), depth: 2, height: 0, length: 1,
      size: [4, 1], xSize: 4, ySize: 1,
      noChildren: true, hasChildren: false, numChildren: 0,
      firstChild: null, lastChild: null,
      x: 1.25, y: 2,
      top: 2, bottom: 3, left: -0.75, right: 3.25,
      nodeExtents: { top: 2, bottom: 3, left: -0.75, right: 3.25 },
      extents: { top: 2, bottom: 3, left: -0.75, right: 3.25 },
    }, 'dornk');

    t.deepClose(tree, expected.default);
  });

  test('d3 hierarchy, all defaults', t => {
    const layout = flextree();
    const tree = hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('flextree hierarchy, nodeSize constant arg', t => {
    const layout = flextree({ nodeSize: [2, 2] });
    const tree = layout.hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.sizeConst);
  });

  test('d3 hierarchy, nodeSize constant chained', t => {
    const layout = flextree().nodeSize([2, 2]);
    const tree = hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.sizeConst);
  });

  test('flextree hierarchy, nodeSize accessor arg', t => {
    const layout = flextree({
      nodeSize: n => [n.data.width, n.data.height],
    });
    const tree = layout.hierarchy(treeData.customSize);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('flextree hierarchy, nodeSize accessor & scale chained', t => {
    const layout = flextree()
      .nodeSize(n => [2 * n.data.width, 2 * n.data.height]);
    const tree = layout.hierarchy(treeData.customSize);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.sizeScaled);
  });

  test('d3 hierarchy, nodeSize scale chained', t => {
    const layout = flextree()
      .nodeSize(n => n.data.size.map(v => 2*v));
    const tree = hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.sizeScaled);
  });

  test('flextree hierarchy, spacing constant chained', t => {
    const layout = flextree().spacing(0.5);
    const tree = layout.hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.spacingConst);
  });

  test('d3 hierarchy, spacing constant arg', t => {
    const layout = flextree({ spacing: 0.5 });
    const tree = hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.spacingConst);
  });

  test('flextree hierarchy, spacing function arg', t => {
    const layout = flextree({
      spacing: (n0, n1) => n0.path(n1).length,
    });
    const tree = layout.hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.spacingFunc);
  });

  test('d3 hierarchy, spacing function, chained', t => {
    const layout = flextree().spacing((n0, n1) => n0.path(n1).length);
    const tree = hierarchy(treeData.default);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.spacingFunc);
  });

  test('flextree hierarchy, nodeSize & spacing function args', t => {
    const layout = flextree({
      nodeSize: n => [2 * n.data.width, 2 * n.data.height],
      spacing: (n0, n1) => n0.path(n1).length,
    });
    const tree = layout.hierarchy(treeData.customSize);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.bothFunc);
  });

  test('d3 hierarchy, nodeSize & spacing function args', t => {
    const layout = flextree({
      nodeSize: n => [2 * n.data.width, 2 * n.data.height],
      spacing: (n0, n1) => n0.path(n1).length,
    });
    const tree = hierarchy(treeData.customSize);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.bothFunc);
  });

  test('flextree hierarchy, children arg to hierarchy', t => {
    const layout = flextree();
    const tree = layout.hierarchy(treeData.customChildren, d => d.kids || []);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('flextree hierarchy, children arg to flextree', t => {
    const layout = flextree({children: d => d.kids});
    const tree = layout.hierarchy(treeData.customChildren);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('flextree hierarchy, children chained', t => {
    const layout = flextree()
      .children(d => d.kids);
    const tree = layout.hierarchy(treeData.customChildren);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('d3 hierarchy, children', t => {
    const layout = flextree();
    const tree = hierarchy(treeData.customChildren, d => d.kids);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.default);
  });

  test('flextree hierarchy, all custom args', t => {
    const layout = flextree({
      nodeSize: n => n.data.slice(1, 3).map(v => 2*v),
      spacing: (n0, n1) => n0.path(n1).length,
      children: d => {
        const kd = d.slice(3);
        return kd.length ? kd : null;
      },
    });
    const tree = layout.hierarchy(treeData.allCustom);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.bothFunc);
  });

  test('flextree hierarchy, all custom chained', t => {
    const layout = flextree()
      .nodeSize(n => n.data.slice(1, 3).map(v => 2*v))
      .spacing((n0, n1) => n0.path(n1).length)
      .children(d => {
        const kd = d.slice(3);
        return kd.length ? kd : null;
      });
    const tree = layout.hierarchy(treeData.allCustom);
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.bothFunc);
  });

  test('d3 hierarchy, all custom', t => {
    const layout = flextree({
      nodeSize: n => n.data.slice(1, 3).map(v => 2*v),
      spacing: (n0, n1) => n0.path(n1).length,
    });
    const tree = hierarchy(treeData.allCustom, d => d.slice(3));
    layout(tree);
    log(layout.dump(tree));
    t.deepClose(tree, expected.bothFunc);
  });

  // Not recommended.
  test('reuse layout with changing options', t => {
    const layout = flextree();
    const tree0 = layout.hierarchy(treeData.default);
    layout(tree0);
    log(layout.dump(tree0));
    t.deepClose(tree0, expected.default);

    // Switch to custom spacing; the layout of the same tree should be different
    layout.spacing((n0, n1) => n0.path(n1).length);
    layout(tree0);
    log(layout.dump(tree0));
    t.deepClose(tree0, expected.spacingFunc);

    // Switch to custom nodeSize, the custom spacing should remain.
    layout.nodeSize(n => n.data.size.map(v => v*2));
    layout(tree0);
    // Although the new nodeSize is reflected in the layout, it is not stored
    // in the tree0 hierarchy itself, so we have to pass an accessor to `dump`.
    log(layout.dump(tree0));
    t.deepClose(tree0, expected.bothFunc);

    // Change the children accessor, and remove custom spacing. This will
    // still work, because the hierarchy is not effected.
    layout.children(d => d.kids).spacing(0);
    layout(tree0);
    log(layout.dump(tree0));
    t.deepClose(tree0, expected.sizeScaled);
  });

  test('copy method', t => {
    const layout = flextree()
      .nodeSize(n => n.data.slice(1, 3).map(v => 2*v))
      .spacing((n0, n1) => n0.path(n1).length)
      .children(d => {
        const kd = d.slice(3);
        return kd.length ? kd : null;
      });
    const tree = layout.hierarchy(treeData.allCustom);
    t.true(tree instanceof hierarchy);
    const copy = tree.copy();
    t.true(copy instanceof hierarchy);
    t.is(tree.children[0].data, copy.children[0].data);

    layout(tree);
    log('tree layout:');
    log(layout.dump(tree));

    layout(copy);
    log('copy layout:');
    log(layout.dump(copy));

    t.deepClose(copy, expected.bothFunc);
  });


};

export default tests;
