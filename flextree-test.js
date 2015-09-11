var tests = {
  test1_1: {
    layout: "tree",
    data_set: "test1.json",
    sizing: "node-size-function",
    separation: 'default',
    spacing: 'null',
  },
  test1_2: {
    layout: "flextree", 
    data_set: "test1.json",
    sizing: "node-size-function",
    separation: 'default',
    spacing: 'null',
  },
  test2_1: {
    layout: "tree",
    data_set: "test2.json",
    sizing: "fixed-svg",
    separation: 'default',
    spacing: 'null',
  },
  test2_2: {
    layout: "flextree",
    data_set: "test2.json",
    sizing: "node-size-function",
    separation: 'default',
    spacing: 'null',
  },
  test3_1: {
    layout: "tree",
    data_set: "test3.json",
    sizing: "fixed-node-small",
    separation: 'default',
    spacing: 'null',
  },
  test3_2: {
    layout: "flextree",
    data_set: "test3.json",
    sizing: "fixed-node-small",
    separation: 'default',
    spacing: 'null',
  },
  test4: {
    layout: "flextree",
    data_set: "test4.json",
    sizing: "node-size-function",
    separation: 'default',
    spacing: 'null',
  },
};


// Variables for the different sizing options
var fixed_node_small = [25, 70]; // for nodeSize()
var fixed_node_big = [25, 200];   // for nodeSize()
var fixed_svg = [400, 500];       // for size()
function node_size_function(d) {  // for nodeSize()  #=> new!
  return [d.height || 25, d.width || 70];
}

// The node box is drawn smaller than the actual node width, to
// allow room for the diagonal
var nodebox_right_margin = 30;
// And smaller than the actual node height, for spacing
var nodebox_vertical_margin = 5;


$('#preset').on('change', function() {
    var config = set_preset();
    render(config, true);
});
$('#separation').on('change', function(e) {
  $('#spacing').val("null");
});
$('#spacing').on('change', function(e) {
  $('#separation').val("null");
});
$('#layout, #data_set, #sizing, #separation, #spacing').on('change', 
  function(e) {
    $('#preset').val("");
    render(config_from_form(), true);
  });


d3.select('#preset').selectAll('foo')
  .data(Object.keys(tests).sort())
  .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; })
;

// What to render initially:

//Object.keys(tests).sort().forEach(function(k) {
//  render(tests[k]);
//});
//
var config = set_preset();
render(config, true);



function render(config, reset) {
  reset = typeof reset !== "undefined" && reset;

  var layout_engine = config.layout == "tree" ? d3.layout.tree : d3.layout.flextree;
  var flextree = layout_engine();

  if (config.sizing == "fixed-node-small") {
    flextree.nodeSize(fixed_node_small);
  }
  else if (config.sizing == "fixed-node-big") {
    flextree.nodeSize(fixed_node_big);
  }
  else if (config.sizing == "fixed-svg") {
    flextree.size(fixed_svg);
  }
  else if (config.sizing == "node-size-function") {
    // Only works for flextree, not tree:
    flextree.nodeSize(node_size_function);
  }

  if (config.separation == "constant") {
    console.log("setting constant separation");
    flextree.separation(function() { return 1.5; });
  }
  else if (config.separation == "custom") {
    console.log("setting custom separation");
    flextree.separation(function(a, b) { 
      return (a._wrapper.x_size + b._wrapper.x_size) / 2 +
             (a.name.match('leaf') || b.name.match('leaf') ? 1 : 0);
    });
  }

  if (config.spacing == "constant") {
    console.log("setting constant spacing");
    flextree.spacing(function() { return 10; });
  }
  else if (config.spacing == "custom") {
    console.log("setting custom spacing");
    flextree.spacing(function(a, b) {
      return (a.name.match('leaf') || b.name.match('leaf') ? 30 : 0);
    });
  }
  //flextree.spacing(function(a, b) { return a.parent == b.parent ? 0 : 20;});

  if (reset) d3.selectAll("#drawing div").remove();
  var svg = d3.select("#drawing").append("div").append('svg');
  var svg_g = svg.append("g");

  var last_id = 0;

  var diagonal = d3.svg.diagonal()
      .source(function(d, i) {
          var s = d.source;
          return {
              x: s.x, 
              y: s.y + (s.width ? s.width - nodebox_right_margin: 0),
          };
      })
      .projection(function(d) { 
        return [d.y, d.x]; 
      });

  d3.json(config.data_set, function(error, root) {
    if (error) throw error;

    var nodes = flextree.nodes(root);

    var node = svg_g.selectAll(".node")
        .data(nodes, function(d) { 
          return d.id || (d.id = ++last_id); 
        })
      .enter().append("g")
        .attr("class", "node")
    ;

    // Reposition everything according to the layout
    node.attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")"; 
      })
      .append("rect")
        .attr("data-id", function(d) {
          set_width_height(d);  // do this now.
          return d.id;
        })
        .attr({
          x: 0,
          y: function(d) { 
            return -(d.height - nodebox_vertical_margin) / 2; 
          },
          rx: 6,
          ry: 6,
          width: function(d) { return d.width - nodebox_right_margin; },
          height: function(d) { 
            return d.height - nodebox_vertical_margin; 
          },
        });

    var text_elements = node.append("text")
        .attr({
          "id": function(d) { return d.id; },
          dy: "0.35em",
        })
        .text(function(d) { return d.name; });

    text_elements.attr({
      "dx": function(d) { 
        return (d.width - nodebox_right_margin) / 2;
      },
      "text-anchor": "middle",
    });

    var links = flextree.links(nodes);
    var links = svg_g.selectAll(".link")
        .data(links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);

    // Set the svg drawing size and translation
    // Note that the x-y orientations between the svg and the tree drawing are reversed
    var min_x = null,
        max_x = null,
        min_y = null,
        max_y = null;
    var nodes_to_visit = [root],
        node;
    while ((node = nodes_to_visit.pop()) != null) {
      min_x = min_x == null || node.y < min_x ? node.y : min_x;
      max_x = max_x == null || node.y > max_x ? node.y : max_x;
      min_y = min_y == null || node.x < min_y ? node.x : min_y;
      max_y = max_y == null || node.x > max_y ? node.x : max_y;
      var n, children;
      if ((children = node.children) && (n = children.length)) {
        while (--n >= 0) nodes_to_visit.push(children[n]);
      }
    }
    svg.attr({
      width: max_x - min_x + fixed_node_big[1],
      height: max_y - min_y + 200,
    });
    svg_g.attr("transform", "translate(0, " + (-min_y + 100) + ")");
  });
}

function set_preset() {
  var config = tests[$('#preset').val()];
  $('#layout').val(config.layout);
  $('#data_set').val(config.data_set);
  $('#sizing').val(config.sizing);
  $('#separation').val(config.separation);
  return config;
}

function config_from_form() {
  var config = {};
  config.layout = $('#layout').val();
  config.data_set = $('#data_set').val();
  config.sizing = $('#sizing').val();
  config.separation = $('#separation').val();
  config.spacing = $('#spacing').val();
  return config;
}


// Set the width and height if they're not already
function set_width_height(d) {
  if (!d.width || !d.height) {
    var size = node_size_function(d);
    if (!d.width) d.width = size[1];
    if (!d.height) d.height = size[0];
  }
}

