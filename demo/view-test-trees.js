import {select} from 'd3-selection';
import 'd3-selection-multi';
import {linkVertical} from 'd3-shape';
import {flextree} from '../src/flextree.js';
import {trees} from '../test/helpers/test-trees.js';

const content = document.getElementById('content'),
      contentSel = select(content),
      button = document.getElementById('spacing'),
      href = document.location.href,
      qmarkI = href.indexOf('?'),
      queryStr = qmarkI === -1 ? '' : href.substr(qmarkI + 1),
      selTree = queryStr.length > 0 ? queryStr - '0' : null,
      treeFilter = t => selTree === null || selTree === t.i,
      accessors = {
        nodeSize: d => d.slice(0, 2),
        children: d => d.slice(2),
      },
      results = Array(trees.length).fill(null);

trees.forEach((tree, treeI) => {
  tree.i = treeI;
  const setId = (() => {
    var nextId = 0;
    return data => data.id = nextId++;
  })();
  const setIds = stdata => {
    setId(stdata);
    accessors.children(stdata).forEach(setIds);
  };
  setIds(tree.data);
});


var customSpacing = false;
button.addEventListener('click', () => {
  customSpacing = !customSpacing;
  button.textContent = customSpacing ? 'on' : 'off';
  displayAll();
});

const minSizes = ds => ds.reduce((mins, d) => {
  const size = accessors.nodeSize(d);
  return [ Math.min(mins[0], size[0]),
           Math.min(mins[1], size[1]) ];
  }, [Infinity, Infinity]);

const generationGap = (nodeA, nodeB) => {
  const aas = nodeA.ancestors(),
        bas = nodeB.ancestors(),
        c = aas.find(aa => bas.indexOf(aa) !== -1);
  return Math.max(aas.indexOf(c), bas.indexOf(c));
}

const dataList = d =>
  [d].concat(...accessors.children(d).map(kd => dataList(kd)));

const opts = rootData => {
  const _dataList = dataList(rootData),
        _minSizes = minSizes(_dataList),
        cSpacing = (da, db) => da.node.path(db.node).length * _minSizes[0] * 0.2;

  const _opts = {
    svg: {
      width: 400,
      height: 300,
      padding: 10,
    },
    box: {
      padding: {
        side: _minSizes[0] * 0.1,
        bottom: _minSizes[1] * 0.2,
      },
    },
    accessors: Object.assign({},
      accessors,
      customSpacing ? {spacing: cSpacing} : null
    ),
  };
  return _opts;
};

function displayAll() {
  content.innerHTML = '';
  results.fill(null);
  trees.filter(treeFilter).forEach(displayTree);
}

function displayTree(tree) {
  const rootData = tree.data,
        _opts = opts(rootData),
        layout = flextree(_opts.accessors),
        root = layout.wrap(rootData).initTree();
  contentSel.append('h2').text(tree.i + '. ' + tree.desc);
  root.nodes.forEach(n => {
    n.data.node = n;
  });
  layout(root);
  root.nodes.forEach(n => {
    n.hue = Math.floor(Math.random() * 360);
  });
  results[tree.i] = root;
  drawTree('actual', root, tree.i, _opts);
  if (!customSpacing) {
    setExpectedCoords(root, tree.expected);
    drawTree('expected', root, tree.i, _opts);
  }
}

function setExpectedCoords(node, coords) {
  node.x = coords[0];
  node.y = coords[1];
  node.children.forEach((kidNode, i) =>
    setExpectedCoords(kidNode, coords.slice(2)[i]));
  return node;
}

function drawTree(label, tree, i, opts) {
  const extents = tree.extents,
        svgSize = opts.svg,
        {width, height, padding} = svgSize,
        scaleX = width / (extents.right - extents.left),
        scaleY = height / extents.bottom,
        scale = Math.min(scaleX, scaleY),
        transX = -extents.left * scale;

  const div = contentSel.append('div').attr('class', 'tree');
  div.append('h3').text(label);
  const svg = div.append('svg')
    .attrs({
      width: width + 2 * padding,
      height: height + 2 * padding,
    });
  const drawing = svg.append('g')
    .attr('transform',
      `translate(${padding + transX} ${padding}) ` +
      `scale(${scale} ${scale})`);
  //console.log('tree #' + i + ', scale: ' + scale);
  drawSubtree(drawing, scale, tree, opts);
}


function drawSubtree(drawing, scale, node, opts, parent=null) {
  const [width, height] = node.size,
        {x, y} = node,
        {box} = opts;
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
      x: x - width / 2 + box.padding.side,
      y,
      width: width - 2 * box.padding.side,
      height: height - box.padding.bottom,
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
          box.padding.bottom],
        target: [node.x, node.y]
      }));
  }
  for (const kid of node.children)
    drawSubtree(drawing, scale, kid, opts, node);
}

displayAll();

export default {
  flextree,
  select,
  linkVertical,
  trees,
  content,
  contentSel,
  button,
  accessors,
  customSpacing,
  minSizes,
  generationGap,
  dataList,
  opts,
  displayAll,
  displayTree,
  setExpectedCoords,
  drawTree,
  drawSubtree,
  results,
};
