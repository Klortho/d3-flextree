import {select} from 'd3-selection';
import 'd3-selection-multi';
import {linkVertical} from 'd3-shape';
import flextree from '../flextree';
import specs from '../test/test-trees';
import {urlOpts} from '../test/utils';

specs.forEach((spec, num) => spec.num = num);

const content = select('#content');
const options = urlOpts(document.location.href);
const treeFilter = t => !('tree' in options) || options.tree === t.i;
const results = [];

const svg = {
  width: 400,
  height: 300,
  padding: 10,
};

const minSize = (tree, xy) => tree.nodes.reduce(
  (min, n) => Math.min(min, n.data[xy === 'x' ? 0 : 1]), Infinity);
const customSpacing = select('#custom-spacing');
// Set the x, y coordinates of a tree from the `expected` data
const setCoords = (n, x, y, ...kidCoords) => {
  Object.assign(n, {x, y});
  (n.children || []).forEach((kid, i) => setCoords(kid, ...(kidCoords[i])));
}

const renderAll = () => {
  content.node().innerHTML = '';
  results.length = 0;
  specs.filter(treeFilter).forEach(renderTree);
};


const renderTree = spec => {
  content.append('h2').text(spec.num + '. ' + spec.desc);
  const context = results[spec.num] = {};

  const layout = context.layout = flextree({
    children: d => d.slice(2),
    nodeSize: n => n.data.slice(0, 2),
  });
  const tree = context.tree = layout.hierarchy(spec.data);
  if (customSpacing.node().checked)
    layout.spacing((a, b) => 0.2 * minSize(tree, 'x') * a.path(b).length);
  tree.nodes.forEach((n, i) => {
    n.id = i;
    n.hue = Math.floor(Math.random() * 360);
  });

  // compute and draw the results layout
  layout(tree);
  drawTree('results', context);

  if (!customSpacing.node().checked) {
    setCoords(tree, ...spec.expected);
    drawTree('expected', context);
  }
}

function drawTree(label, context) {
  const div = content.append('div').attr('class', 'tree');
  div.append('h3').text(label);

  const {width, height, padding} = svg;
  const svgElem = div.append('svg').attrs({
    width: width + 2 * padding,
    height: height + 2 * padding,
  });

  const {tree} = context;
  const extents = tree.extents;
  const scale = context.scale = Math.min(width / (extents.right - extents.left),
    height / extents.bottom);
  const transX = -extents.left * scale;
  context.drawing = svgElem.append('g')
    .attr('transform',
      `translate(${padding + transX} ${padding}) scale(${scale} ${scale})`);

  drawSubtree(tree, context);
}

function drawSubtree(node, context, parent=null) {
  const {layout, tree, drawing, scale} = context;
  const [width, height] = node.size;
  const {x, y} = node;
  drawing.append('rect').attrs({
    'class': 'node',
    rx: 5 / scale,
    ry: 5 / scale,
    x: x - width / 2,
    y,
    width,
    height,
  });

  const paddingSide = minSize(tree, 'x') * 0.1;
  const paddingBottom = minSize(tree, 'y') * 0.2;
  const box = drawing.append('rect').attrs({
    'class': 'inner-box',
    rx: 5 / scale,
    ry: 5 / scale,
    x: x - width / 2 + paddingSide,
    y,
    width: width - 2 * paddingSide,
    height: height - paddingBottom,
    fill: `hsl(${node.hue}, 100%, 90%)`,
  });
  box.node().addEventListener('mouseover', function(evt) {
    console.log(layout.dump(node));
  });

  drawing.append('text')
    .attrs({
      x: x,
      y: y + 3 / scale,
      fill: `hsl(${node.hue}, 70%, 60%)`,
      'text-anchor': 'middle',
      'alignment-baseline': 'hanging',
    })
    .styles({
      'font-family': 'sans-serif',
      'font-size': (12 / scale) + 'pt',
    })
    .text(node.data.id);

  if (parent) {
    drawing.append('path')
      .attr('d', linkVertical()({
        source: [parent.x, parent.y + parent.size[1] - paddingBottom],
        target: [node.x, node.y],
      }));
  }
  for (const kid of (node.children || [])) drawSubtree(kid, context, node);
}

/*
button.addEventListener('click', () => {
  customSpacing = !customSpacing;
  button.textContent = customSpacing ? 'on' : 'off';
  renderAll();
});
*/
renderAll();

export default {
  flextree,
  select,
  specs,
  urlOpts,
  content,
  options,
  treeFilter,
  results,
  svg,
  minSize,
  customSpacing,
  setCoords,
  renderAll,
  renderTree,
  drawTree,
  drawSubtree,
};
