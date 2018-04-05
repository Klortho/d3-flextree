import {flextree} from '../../index.js';
import {hierarchy} from 'd3-hierarchy';
import treeSpecs from './test-trees';


const expCoords = spec => Object.assign(
  { x: spec[0], y: spec[1] },
  spec.length > 2 ? { children: spec.slice(2).map(expCoords) } : null
);

const tests = test => {
  treeSpecs.forEach((spec, i) => {
    test('tree-' + i, t => {
      const tree = hierarchy(spec.data, d => d.slice(2));
      const layout = flextree({
        nodeSize: n => n.data.slice(0, 2),
      });
      layout(tree);
      const e = expCoords(spec.expected);
      t.deepClose(tree, e);
    });
  });
};

export default tests;
