$(document).ready(function() {

  try {
    d3.json("test-cases/tests.json", function(error, test_cases) {
      if (error) { fail(error); return; }

      test_cases.forEach(function(test_case) {

        var layout_engine = d3.layout.tree();

        // gap
        if (test_case.gap == "separation-1") {
          layout_engine.separation(function(a, b) { return 1; });
        }

        d3.json("test-cases/" + test_case.tree, function(error, tree) {
          if (error) { fail(error); return; }
          layout_engine.nodes(tree);
          print_results(test_case, tree);

          var expected_file = "test-cases/" + test_case.name + ".expected.json";
          d3.json(expected_file, function(error, expected) {
            if (error) { fail(error); return; }
            if (!tree_equals(tree, expected)) 
              fail(test_case.name + " failed: results != expected");
          })
        });
      });
    });
  }
  catch(error) {
    alert("failed: " + error);
  }

  function print_results(test_case, tree) {
    $('body').append(
      "<div><p>Test " + test_case.name + " results:</p>\n" +
      "<pre>" + JSON.stringify(tree, ["x", "y", "children"], 2) +
      "</pre></div>"
    );

  }

  function tree_equals(a, b) {
    if (a.x != b.x || a.y != b.y) return false;
    if (a.children && !b.children ||
        b.children && !a.children) return false;
    if (a.children) {
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
