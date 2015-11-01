#!/usr/bin/env node

// This can be run either from the command line, or from another Node script.

var lazy = require("lazy"),
    fs = require('fs'),
    readline = require('readline');

  
exports.exec = function() {
  return new Promise(function(resolve, reject) {

    var state = 0;
    var module_str = '(function() {\n\n';

    var tree_lines = readline.createInterface({
      input: fs.createReadStream('d3/src/layout/tree.js')
    });

    tree_lines
      .on('line', function (line) {
        if (state == 0) {
          if (line.match(/\/\//)) {
            module_str += line + "\n";
            state = 3;
          }
        }
        else if (state == 3) {
          if (line.match(/d3\.layout\.tree =/)) {
            module_str += (line.replace("d3.layout.tree", "d3.layout.flextree") + "\n");
            state = 1;
          }
          else {
            module_str += line + "\n";
          }
        }
        else if (state == 1) {
          module_str += line + "\n";
        }

      })
      .on('close', function() {

        // We also need d3_layout_hierarchyRebind and d3_layout_hierarchyLinks from hierarchy.js
        var hierarchy_lines = readline.createInterface({
          input: fs.createReadStream('d3/src/layout/hierarchy.js')
        });
        hierarchy_lines
          .on('line', function(line) {
            if (state == 1) {
              if (line.match(/function d3_layout_hierarchyLinks\(/) ||
                  line.match(/function d3_layout_hierarchyRebind\(/)) 
              {
                module_str += line + "\n";
                state = 2;
              }
            }
            else if (state == 2) {
              module_str += line + "\n";
              if (line.match(/^\s*\}\s*$/)) {
                state = 1;
              }
            }
          })
          .on('close', function() {
            module_str += '\n\n})();\n';

            fs.writeFile("dist/d3-flextree.js", module_str, function(err) {
              if (err) throw err;
              resolve();
            });

          })
        ;
      });
  });
};

if (!module.parent) {
  exports.exec();
}
