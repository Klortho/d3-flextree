import {select} from 'd3-selection';
import 'd3-selection-multi';
import {linkVertical} from 'd3-shape';
import flextree from '../flextree';
import treeSpecs from '../test/test-trees';
import {urlOpts} from '../test/utils';

const content = document.getElementById('content');
const contentSel = select(content);
const button = document.getElementById('spacing');
const options = urlOpts(document.location.href);
const treeFilter = t => !('tree' in options) || options.tree === t.i;
const results = Array(treeSpecs.length).fill(null);
const nodeSize = node => node.data.slice(0, 2);
const children = data => {
  const kd = data.slice(2);
  return kd.length === 0 ? null : kd;
};
let customSpacing = false;
const svg = {
  width: 400,
  height: 300,
  padding: 10,
};

function displayAll() {
  content.innerHTML = '';
  results.fill(null);
  treeSpecs.filter(treeFilter).forEach(displayTree);
}

const minSize = xy => tree => tree.nodes.reduce(
  (min, node) => Math.min(min, nodeSize(node)[xy]), Infinity);
const minXSize = minSize(0);
const minYSize = minSize(1);

function displayTree(treeSpec) {
  const layout = flextree({nodeSize});
  const tree = layout.hierarchy(treeSpec.data, children);
  if (customSpacing) {
    layout.spacing((a, b) => a.path(b).length * minXSize(tree) * 0.2);
  }
  let nextId = 0;
  tree.each(node => {
    node.id = nextId++;
    node.hue = Math.floor(Math.random() * 360);
  });
  layout(tree);
  results[treeSpec.num] = {
    spec: treeSpec,
    tree,
  };

  contentSel.append('h2').text(treeSpec.num + '. ' + treeSpec.desc);
  drawTree('actual', tree, treeSpec.num);
  if (!customSpacing) {
    setExpectedCoords(tree, treeSpec.expected);
    drawTree('expected', tree, treeSpec.num);
  }
}

function setExpectedCoords(node, coords) {
  node.x = coords[0];
  node.y = coords[1];
  (node.children || []).forEach((kidNode, i) =>
    setExpectedCoords(kidNode, coords.slice(2)[i]));
  return node;
}

function drawTree(label, tree) {
  const extents = tree.extents;
  const {width, height, padding} = svg;
  const scale = Math.min(width / (extents.right - extents.left),
    height / extents.bottom);
  const transX = -extents.left * scale;
  const div = contentSel.append('div').attr('class', 'tree');
  div.append('h3').text(label);
  const svgElem = div.append('svg')
    .attrs({
      width: width + 2 * padding,
      height: height + 2 * padding,
    });
  const drawing = svgElem.append('g')
    .attr('transform',
      `translate(${padding + transX} ${padding}) scale(${scale} ${scale})`);
  const boxPadding = {
    side: minXSize(tree) * 0.1,
    bottom: minYSize(tree) * 0.2,
  };
  const context = {drawing, scale, boxPadding};
  drawSubtree(context, tree);
}

function drawSubtree(context, node, parent=null) {
  const {drawing, scale, boxPadding} = context;
  const [width, height] = node.size;
  const {x, y} = node;
  drawing.append('rect')
    .attrs({
      'class': 'node',
      rx: 5 / scale,
      ry: 5 / scale,
      x: x - width / 2,
      y,
      width,
      height,
    });
  drawing.append('rect')
    .attrs({
      'class': 'inner-box',
      rx: 5 / scale,
      ry: 5 / scale,
      x: x - width / 2 + boxPadding.side,
      y,
      width: width - 2 * boxPadding.side,
      height: height - boxPadding.bottom,
      fill: `hsl(${node.hue}, 100%, 90%)`,
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
        source: [parent.x, parent.y + parent.size[1] -
          boxPadding.bottom],
        target: [node.x, node.y],
      }));
  }
  for (const kid of (node.children || [])) drawSubtree(context, kid, node);
}

button.addEventListener('click', () => {
  customSpacing = !customSpacing;
  button.textContent = customSpacing ? 'on' : 'off';
  displayAll();
});
treeSpecs.forEach((treeSpec, num) => treeSpec.num = num);
displayAll();

export default results;
