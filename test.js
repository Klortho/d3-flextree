$(document).ready(function() {


  function getJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json()
      }).catch(function(ex) {
        console.log('JSON parsing failed for ' + url + ": ", ex)
      });
  }

  try {

    getJSON("test-cases/tests.json")
      .then(
        function(test_cases) {

          console.log("%o", test_cases);

          // For each test case, fetch the original tree, and the expected.
          // (This isn't quite ideal -- I'd rather retrieve the tree and the 
          // expected in parallel, but I couldn't figure out how to do that.)
          // FIXME: check that I get good error reporting on JSON errors
          return Promise.all(
            test_cases.map(function(test_case) {
                return getJSON("test-cases/" + test_case.tree)
                  .then(function(tree_json) {
                    test_case.tree_json = tree_json;
                    return test_case;
                  })
                  .then(function(test_case) {
                    return getJSON("test-cases/" + test_case.name + ".expected.json")
                      .then(function(expected_json) {
                        test_case.expected_json = expected_json;
                        return test_case;
                      })
                  });
            })
          );
        }
      )
      .then(
        function(test_cases) {
          console.log("%o", test_cases);

          for (var i = 0; i < test_cases.length; ++i) {
            var test_case = test_cases[i];

            // FIXME: just run test16
            //continue;
            //if (test_case.name != 'test22') continue;

            if (test_case.skip) {
              $('#summary').append('<li>Skipping test ' + test_case.name + 
                ", because skip == true</li>");
              continue;
            }

            var layout_engine = d3.layout.tree();

            // gap
            if (test_case.gap == "separation-1") {
              layout_engine.separation(function(a, b) { return 1; });
            }
            else if (test_case.gap == "spacing-0") {
              layout_engine.spacing(function(a, b) { return 0; });
            }
            else if (test_case.gap == "spacing-custom") {
              layout_engine.spacing(function(a, b) {
                return a.parent == b.parent ? 
                  0 : layout_engine.rootXSize();
              })
            }

            // sizing
            if (test_case.sizing == "node-size-function") {
              layout_engine.nodeSize(function(t) {
                return [t.x_size, t.y_size];
              })
            }
            else if (test_case.sizing == "node-size-fixed") {
              layout_engine.nodeSize([50, 50]);
            }
            else if (test_case.sizing == "size") {
              layout_engine.size([200, 100]);
            }

            $('#summary').append('<li>Running test ' + test_case.name +
              "</li>");
            var tree = test_case.tree_json;
            var nodes = layout_engine.nodes(tree);

            print_results(test_case, true, tree);

            if (!tree_equals(tree, test_case.expected_json)) {
              fail(test_case.name + " failed: results != expected");
              print_results(test_case, false, test_case.expected_json);
            }
          }
        }
      );
  }
  catch(error) {
    alert("failed: " + error);
  }

  function print_results(test_case, results, tree) {
    $('body').append(
      "<div><p>Test " + test_case.name + " " +
      (results ? "results" : "expected") + ":</p>\n" +
      "<pre>" + JSON.stringify(tree, ["x", "y", "children"], 2) +
      "</pre></div>"
    );

  }

  function almost_equals(a, b) {
    if (a == 0 && b == 0) return true;
    return ( Math.abs((b-a) / (b+a)) < 0.000000000001 );
  }

  function tree_equals(a, b) {
    if (!almost_equals(a.x, b.x) || !almost_equals(a.y, b.y)) return false;

    var a_num_children = a.children ? a.children.length : 0;
    var b_num_children = b.children ? b.children.length : 0;
    if (a_num_children != b_num_children) return false;
    if (a_num_children > 0) {
      if (a.children.length != b.children.length) return false;
      var i;
      for (i = 0; i < a.children.length; ++i) {
        if (!tree_equals(a.children[i], b.children[i])) return false;
      }
    }
    return true;
  }

  function fail(e) {
    alert("Failed: " + (typeof e == "string" ? e : e.stack));
  }
});
