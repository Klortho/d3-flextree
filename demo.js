$(document).ready(function() {


  function getJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json()
      }).catch(function(ex) {
        console.log('JSON parsing failed for ' + url + ": ", ex)
      });
  }



  var test_case,
      engine;

  // FIXME: these are going to need to be dynamic, based on average node size:

  // The node box is drawn smaller than the actual node width, to
  // allow room for the diagonal
  var nodebox_right_margin = 0;
  // And smaller than the actual node height, for spacing
  var nodebox_vertical_margin = 0;

  getJSON("test-cases/tests.json")
    .then(function(test_cases) {

      console.log("%o", test_cases);

      // which test?
      var m = document.location.href.match(/.*?\?(.*)/);
      var test = m ? m[1] : "test01";
      $('#test-name').text(test);

      test_case = test_cases.find(function(tc) {
        return tc.name == test;
      })
      if (!test_case) {
        $('#header').after("<p>not found</p>");
        throw("Requested test case not found");
      }



      engine = d3.layout.tree();

      return getJSON("test-cases/" + test_case.tree);
    })
    .then(function(tree) {
      console.log("tree = %o", tree);


      // gap
      if (test_case.gap == "separation-1") {
        engine.separation(function(a, b) { return 1; });
      }
      else if (test_case.gap == "spacing-0") {
        engine.spacing(function(a, b) { return 0; });
      }
      else if (test_case.gap == "spacing-custom") {
        engine.spacing(function(a, b) {
          return a.parent == b.parent ? 
            0 : engine.rootXSize();
        })
      }

      // sizing
      if (test_case.sizing == "node-size-function") {
        engine.nodeSize(function(t) {
          return [t.x_size, t.y_size];
        })
      }
      else if (test_case.sizing == "node-size-fixed") {
        engine.nodeSize([50, 50]);
      }
      else if (test_case.sizing == "size") {
        engine.size([200, 100]);
      }

      var nodes = engine.nodes(tree);

      var svg = d3.select("#drawing").append("div").append('svg');
      var svg_g = svg.append("g");

      var last_id = 0;

      var diagonal = d3.svg.diagonal()
          .source(function(d, i) {
            var s = d.source;
            return {
                x: s.x, 
                y: s.y + (s.y_size ? s.y_size - nodebox_right_margin: 0),
            };
          })
          .projection(function(d) { 
            return [d.y, d.x]; 
          });


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
              return d.id;
            })
            .attr({
              x: 0,
              y: function(d) { 
                return -(d.x_size - nodebox_vertical_margin) / 2; 
              },
              rx: 6,
              ry: 6,
              width: function(d) { return d.y_size - nodebox_right_margin; },
              height: function(d) { 
                return d.x_size - nodebox_vertical_margin; 
              },
            });

/*
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
  });
*/
    })

    .catch(function(err) {
      console.error("Caught error: " + err);
    });
});
