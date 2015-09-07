!function() {


  var tests = {
    test1_1: {
      layout: d3.layout.tree,
      data_set: "test1.json",
      // note that the sense of svg_size and size/nodeSize are reversed
      svg_size: [500, 200],
      tree_nodeSize: [30, 200],
    },
    test1_2: {
      layout: d3.layout.flextree, 
      data_set: "test1.json",
      svg_size: [500, 200],
      tree_nodeSize: function(d) {
        return [30, d.width + 40];
      }
    },
    test2_1: {
      layout: d3.layout.tree,
      data_set: "test2.json",
      svg_size: [450, 300],
      tree_size: [300, 400],
    },
    test2_2: {
      layout: d3.layout.flextree,
      data_set: "test2.json",
      svg_size: [450, 300],
      tree_nodeSize: function(d) {
        return [25, d.width + 40];
      }
    },
    test3_1: {
      layout: d3.layout.flextree,
      data_set: "test3.json",
      svg_size: [300, 500],
      tree_nodeSize: [40, 70],
    },
  };
  var config = tests.test1_2;


  var flextree = config.layout()
      .separation(function(a, b) { 
        return (a.parent == b.parent ? 1 : 1); 
      });

  if (config.tree_size) flextree.size(config.tree_size);
  else if (config.tree_nodeSize) flextree.nodeSize(config.tree_nodeSize);

  var diagonal = d3.svg.diagonal()
      .source(function(d, i) {
          var s = d.source;
          return {
              x: s.x, 
              y: s.y + (s.width ? s.width : 0),
          };
      })
      .projection(function(d) { 
        return [d.y, d.x]; 
      });

  var svg = d3.select("body").append("svg")
      .attr("width", config.svg_size[0])
      .attr("height", config.svg_size[1])
    .append("g")
  ;
  if (config.tree_nodeSize) {
    svg.attr("transform", "translate(0, " + config.svg_size[1] / 2 + ")");
  }

  var last_id = 0;

  d3.json(config.data_set, function(error, root) {
    if (error) throw error;

    // I had to create a new top-level method, nodeList, to first create the node list
    // hierarchy, before doing any of the layout. This will let me create the
    // text elements, which then give me the horizontal sizes of the nodes,
    // which are needed during layout.
    var node_list;
    if (config.layout === d3.layout.flextree) {
      node_list = flextree.nodeList(root);
    }
    else {
      node_list = flextree.nodes(root);
    }

    var node = svg.selectAll(".node")
        .data(node_list, function(d) { 
          return d.id || (d.id = ++last_id); 
        })
      .enter().append("g")
        .attr("class", "node")
    ;

    var text_elements = node.append("text")
        .attr({
          "id": function(d) { return d.id; },
          dy: "0.35em",
          transform: "translate(8)",
        })
        .text(function(d) { return d.name; });

    text_elements.attr({
      "dx": function(d) { 
        d.width = document.getElementById(d.id).getBBox()["width"] + 28;
        return (d.width - 18) / 2;
      },
      "text-anchor": "middle",
    });


    // Now do the layout
    var nodes = flextree.nodes(root);

    // Reposition everything according to the layout
    node.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .append("rect")
        .attr({
          "data-id": function(d) { return d.id; },
          x: 0,
          y: -10,
          rx: 6,
          ry: 6,
          width: function(d) { return d.width; },
          height: 20,
        });


    var links = flextree.links(nodes);


    var links = svg.selectAll(".link")
        .data(links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);




  });
}();
