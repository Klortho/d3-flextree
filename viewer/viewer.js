const FlextreeViewer = (function() {
  // FIXME: implement vertical
  const defaults = {
    vertical: true,
    svg: {
      width: 500,
      height: 400,
    },
    box: {
      padding: {
        x: 2,
        y: 10,
      },
    },
    spacing: null,
    hue: data => ('hue' in data) ? data.hue : 0,
  };

  const FlextreeViewer = (treeData, options) => {
    const opts = utils.merge(defaults, options);

    const flextree = d3.flextree;
    const layout = flextree();
    if (opts.spacing !== null) layout.spacing(opts.spacing);
    const tree = layout.hierarchy(treeData);
    layout(tree);
    console.log(layout.dump(tree));

    const svg = d3.select('#content').append('svg').attrs({
      width: opts.svg.width,
      height: opts.svg.height,
    });
  /*
    svg.append('rect').attrs({
      fill: '#AAA',
      x: 0,
      y: 0,
      width: opts.svg.width,
      height: opts.svg.height,
    }); */
    const svgG = svg.append('g').attrs({
      transform: `translate(0, 0)`,
    });

    const nodes = tree.nodes;
    const boxXSize = node => node.data.size[0] - 2*opts.box.padding.x;
    const boxYSize = node => node.data.size[1] - opts.box.padding.y;

    const nodeSel = svgG.selectAll('g.node').data(nodes, d => d.id);
    const nodeEnter = nodeSel.enter().append('g').attrs({
      'class': 'node',
      transform: node => `translate(${node.x}, ${node.y})`,
    });
    nodeEnter.append('rect').attrs({
      'class': 'node',
      x: node => -node.data.size[0]/2,
      y: 0,
      width: node => node.data.size[0],
      height: node => node.data.size[1],
      rx: 5, ry: 5,
      fill: 'none',
      stroke: 'hsla(0, 100%, 0%, 0.2)',
      'stroke-width': 1,
      'stroke-dasharray': 5,
    });
    nodeEnter.append('rect').attrs({
      x: node => -boxXSize(node)/2 ,
      y: 0,
      width: boxXSize,
      height: boxYSize,
      fill: node => `hsl(${opts.hue(node.data)}, 100%, 70%)`,
      rx: 5, ry: 5,
    });

    const links = tree.links();
    const linkSel = svgG.selectAll('path.link')
      .data(links, link => link.target.id);
    const linkEnter = linkSel.enter();

    const linkPath = d3.linkVertical();
    linkPath.source(link => {
      const srcNode = link.source;
      return [srcNode.x, srcNode.y + boxYSize(srcNode)];
    });
    linkPath.target(link => {
      const trgNode = link.target;
      return [trgNode.x, trgNode.y];
    });
    linkEnter.append('path').attrs({
      'class': 'link',
      d: linkPath,
      fill: 'none',
      stroke: '#BBB',
      'stroke-width': 1,
    });

    const extents = tree.extents;
    const treeWidth = extents.right - extents.left;
    const treeHeight = extents.bottom - extents.top;
    const sX = opts.svg.width / treeWidth;
    const sY = opts.svg.height / treeHeight;
    const scale = Math.min(1, sX, sY);
    svgG.attrs({
      transform: `translate(${-scale*extents.left}), scale(${scale})`,
    });

    Object.assign(FlextreeViewer, {
      treeData,
      options,
      opts,
      flextree,
      layout,
      tree,
      svg,
      svgG,
    });
  };

  return FlextreeViewer;
})();
