/////////////////////////////////////////////////////////////////////////////
// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
d3.layout.flextree = function() {
  var hierarchy = d3.layout.hierarchy().sort(null).value(null);

  // Configuration defaults
  var separation = defaultSeparation;
  var size = [1, 1];     // width, height; null if we're using nodeSize
  var nodeSize = null;

  // The node size can be specified in one of three ways, and the following
  // computed variables simplify the handling
  //   size    nodeSize     nodeSizeFixed  nodeSizeFunc
  //   [x,y]     null         [1,1]         null        # scale drawing at end
  //   null      [x,y]        [x,y]         null
  //   null      function     null          function
  var nodeSizeFixed = null;
  var nodeSizeFunc = null;

  var nodes;

  function defaultSeparation(a, b) {
    if (nodeSizeFixed) {
      var scale = nodeSizeFixed[0];
      return a.parent == b.parent ? scale : 2 * scale;
    }
    else {
      return (getXSize(a) + getXSize(b)) / 2;
    }
  }

  // lazy get the x and y sizes, and cache them on the node
  function getXSize(n) {
    if (nodeSizeFixed) {
      return nodeSizeFixed[0];
    }
    else if (typeof n.x_size != "undefined") {
      return n.x_size;
    }
    else {
      var s = nodeSizeFunc(n);
      n.y_size = s[1];
      return n.x_size = s[0];
    }
  }
  function getYSize(n) {
    if (nodeSizeFixed) {
      return nodeSizeFixed[1];
    }
    else if (typeof n.y_size != "undefined") {
      return n.y_size;
    }
    else {
      var s = nodeSizeFunc(n);
      n.x_size = s[0];
      return n.y_size = s[1];
    }
  }

  function flextree(d, i) {
    // This produces the array of all of the nodes in the tree
    var nodes = hierarchy.call(this, d, i);

    // root_ is the root of the tree. By convention, the real tree nodes that
    // the user passed in are referred to by "_", and the wrapped nodes by
    // variables without "_".
    var root_ = nodes[0];

    // root is a wrapper around the root node
    var root = wrapTree(root_);

    // "Walk zero" sets the y-coordinates, which depend only on the y_size of
    // the ancestor nodes. When nodeSize is a function, we'll set x_size 
    // and y_size on every node, as well
    d3_layout_hierarchyVisitBefore(root, function(n) {
      var n_ = n._;
      var ns = nodeSizeFixed || nodeSizeFunc(n_);
      if (nodeSizeFunc) {
        console.log("setting node x_size = " + ns[0] + ", y_size = " + ns[1]);
        n_.x_size = ns[0];
        n_.y_size = ns[1];
      }

      var np_ = n.parent._;
      n_.y = np_.y + getYSize(np_);
    });


    // Compute the layout using Buchheim et al.'s algorithm.
    d3_layout_hierarchyVisitAfter(root, firstWalk);
    root.parent.modifier = -root.prelim;
    d3_layout_hierarchyVisitBefore(root, secondWalk);


    // If a fixed node size is specified, scale x and y.
    if (nodeSize) {
      d3_layout_hierarchyVisitBefore(root_, function(node) {
        var ns = typeof nodeSize == "function" ? nodeSize(node) : nodeSize;
        //node.x *= 25;
        //node.y = node.depth * ns[1];
      });
    }

    // If a fixed tree size is specified, scale x and y based on the extent.
    // Compute the left-most, right-most, and depth-most nodes for extents.
    else {
      var left = root_;
      var right = root_;
      var bottom = root_;

      d3_layout_hierarchyVisitBefore(root_, function(node) {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
        if (node.depth > bottom.depth) bottom = node;
      });
      var tx = separation(left, right) / 2 - left.x,
          kx = size[0] / (right.x + separation(right, left) / 2 + tx),
          ky = size[1] / (bottom.depth || 1);
      d3_layout_hierarchyVisitBefore(root_, function(node) {
        node.x = (node.x + tx) * kx;
        node.y = node.depth * ky;
      });
    }

    return nodes;
  }

  // This gets called only once, to wrap all of the nodes in the tree into
  // objects that will be used throughout the layout algorithm.
  // First it creates a fake wrapper for the 
  // non-existent parent of the root node, and then pushes that onto the queue.
  // Then, for every node that's popped off the queue,
  // this wraps the *children* of that node, and then pushes the child's wrapper
  // onto the queue. Finally, this returns the wrapped version of root, which is
  // the child of the fake wrapper of the non-existent parent.
  // Note that the fake parent of root is used as a shortcut in lots of other places.
  // I tried to get rid of it, but it is not a good idea.

  // FIXME: I changed the names of the wrapper members from single-character to
  // more meaningful names. I guess I should change them back, after everything 
  // is working, for efficiency? Or, does the minifier do that?

  function wrapTree(root_) {
    var fake_root_parent = {
      A: null, 
      _: { 
        children: [root_],
        x: nodeSizeFunc ? 0 : -nodeSizeFixed[0],
        y: nodeSizeFunc ? 0 : -nodeSizeFixed[1],
        y_size: 0,
        x_size: 0,
      },
    };

    var queue = [fake_root_parent];
    var node;
    while ((node = queue.pop()) != null) {
      var children_ = (node._.children || []).slice();
      var children = node.children = [];
      var n = children_.length;
      for (var child_num = 0; child_num < n; ++child_num) {
        var child_ = children_[child_num];
        // wrap the child
        var child = {
          _: child_,    // source node
          parent: node,
          A: null,            // default ancestor
          ancestor: null,
          prelim: 0,
          modifier: 0,
          change: 0,
          shift: 0,
          thread: null,
          child_num: child_num,
        };
        children.push(child);
        // QUESTION: why does the ancestor point to the self-same element?
        child.ancestor = child;
        queue.push(child);
      }
    }

    var root = fake_root_parent.children[0];
    return root;
  }

  // FIRST WALK
  // Computes a preliminary x-coordinate for v. 
  // This is applied recursively to the children of v, as well as the function
  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
  // node v is placed to the midpoint of its outermost children.
  function firstWalk(v) {
    var children = v.children;
    // siblings is really "siblings and self"
    var siblings = v.parent.children;

    var left_sibling = v.child_num ? siblings[v.child_num - 1] : null;

    if (children.length) {
      d3_layout_treeShift(v);
      var midpoint = (children[0].prelim + children[children.length - 1].prelim) / 2;
      if (left_sibling) {
        v.prelim = left_sibling.prelim + separation(v._, left_sibling._);
        v.modifier = v.prelim - midpoint;
      } 
      else {
        v.prelim = midpoint;
      }
    } 
    else if (left_sibling) {
      // It's a leaf node, and it has a left sibling
      v.prelim = left_sibling.prelim + separation(v._, left_sibling._);
    }
    // If it's a leaf node with no left sibling, prelim and modifier default to 0.

    v.parent.A = apportion(v, left_sibling, v.parent.A || siblings[0]);
  }

  // SECOND WALK
  // Computes all real x-coordinates by summing up the modifiers recursively.
  function secondWalk(v) {
    v._.x = v.prelim + v.parent.modifier;
    v.modifier += v.parent.modifier;
  }


  // APPORTION
  // The core of the algorithm. Here, a new subtree is combined with the
  // previous subtrees. Threads are used to traverse the inside and outside
  // contours of the left and right subtree up to the highest common level. The
  // vertices used for the traversals are vil, vir, vol, and vor, where the
  // superscript o means outside and i means inside, the subscript - means left
  // subtree and + means right subtree. For summing up the modifiers along the
  // contour, we use respective variables sir, si-, so-, and so+. Whenever two
  // nodes of the inside contours conflict, we compute the left one of the
  // greatest uncommon ancestors using the function ANCESTOR and call MOVE
  // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
  // Finally, we add a new thread (if necessary).
  function apportion(v, w, ancestor) {
    console.log("apportion(" + v._.name + ")")
    if (w) {
      var vir = v,
          vor = v,
          vil = w,
          vol = vir.parent.children[0],
          sir = vir.modifier,
          sor = vor.modifier,
          sil = vil.modifier,
          sol = vol.modifier,
          shift;

      var vir_changed = false,
          vor_changed = false,
          vil_changed = false,
          vol_changed = false;
      // FIXME: shouldn't need this: it is just here now to make sure we don't
      // end up in an infinite loop.
      //var max_iters = 200;
      while (true) 
      {
        //if (--max_iters <= 0) break;
        var vir_end_y = vir._.y + getYSize(vir._);
        console.log("vir_end_y: '" + vir._.name + "': " + vir_end_y);
        var vor_end_y = vor._.y + getYSize(vor._);
        console.log("vor_end_y: '" + vor._.name + "': " + vor_end_y);
        var vil_end_y = vil._.y + getYSize(vil._);
        console.log("vil_end_y: '" + vil._.name + "': " + vil_end_y);
        var vol_end_y = vol._.y + getYSize(vol._);
        console.log("vol_end_y: '" + vol._.name + "': " + vol_end_y);

        var next_y = d3.min([
          vir_end_y, vor_end_y, vil_end_y, vol_end_y,
        ]);
        if (next_y == vir_end_y) {
          console.log("stepping vir");
          vir = d3_layout_treeLeft(vir);
          vir_changed = true;
        }
        if (next_y == vil_end_y) {
          console.log("stepping vil");
          vil = d3_layout_treeRight(vil);   // next on left contour of this subtree
          vil_changed = true;
        }

        if (!vil || !vir) break;

        if (next_y == vor_end_y) {
          console.log("stepping vor");
          vor = d3_layout_treeRight(vor);
          vor_changed = true;
        }
        if (next_y == vol_end_y) {
          console.log("stepping vol");
          vol = d3_layout_treeLeft(vol);
          vol_changed = true;
        }



        if (vor_changed) vor.ancestor = v;

        if (vil_changed || vir_changed) {
          shift = vil.prelim + sil - vir.prelim - sir + separation(vil._, vir._);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vil, v, ancestor), v, shift);
            sir += shift;
            sor += shift;
          }
        }
        if (vil_changed) sil += vil.modifier;
        if (vir_changed) sir += vir.modifier;
        if (vol_changed) sol += vol.modifier;
        if (vor_changed) sor += vor.modifier;
      }
      if (vil && vor && !d3_layout_treeRight(vor)) {
        vor.thread = vil;
        vor.modifier += sil - sor;
      }
      if (vir && vol && !d3_layout_treeLeft(vol)) {
        vol.thread = vir;
        vol.modifier += sir - sol;
        ancestor = v;
      }
    }
    return ancestor;
  }

  flextree.separation = function(x) {
    if (!arguments.length) return separation;
    separation = x;
    return flextree;
  };

  flextree.size = function(x) {
    if (!arguments.length) return size;
    size = nodeSizeFixed = x;
    nodeSize = nodeSizeFunc = null;
    return flextree;
  };

  flextree.nodeSize = function(x) {
    if (!arguments.length) return nodeSize;
    nodeSize = x;
    size = null;
    if (typeof nodeSize == "function") {
        nodeSizeFunc = nodeSize;
        nodeSizeFixed = null;
    }
    else {
        nodeSizeFunc = null;
        nodeSizeFixed = nodeSize;
    }
    return flextree;
  };

  flextree.nodeList = function(d, i) {
    return nodes = hierarchy.call(this, d, i);
  }

  return d3_layout_hierarchyRebind(flextree, hierarchy);
};


// function d3_layout_treeSeparationRadial(a, b) {
//   return (a.parent == b.parent ? 1 : 2) / a.depth;
// }

// NEXT LEFT
// This function is used to traverse the left contour of a subtree (or
// subforest). It returns the successor of v on this contour. This successor is
// either given by the leftmost child of v or by the thread of v. The function
// returns null if and only if v is on the highest level of its subtree.
function d3_layout_treeLeft(v) {
  var children = v.children;
  return children.length ? children[0] : v.thread;
}

// NEXT RIGHT
// This function works analogously to NEXT LEFT.
function d3_layout_treeRight(v) {
  var children = v.children, n;
  return (n = children.length) ? children[n - 1] : v.thread;
}

// MOVE SUBTREE
// Shifts the current subtree rooted at w+. This is done by increasing
// prelim(w+) and mod(w+) by shift.
function d3_layout_treeMove(wm, wp, shift) {
  var change = shift / (wp.child_num - wm.child_num);
  wp.change -= change;
  wp.shift += shift;
  wm.change += change;
  wp.prelim += shift;
  wp.modifier += shift;
}

// EXECUTE SHIFTS
// All other shifts, applied to the smaller subtrees between w- and w+, are
// performed by this function. To prepare the shifts, we have to adjust
// change(w+), shift(w+), and change(w-).
function d3_layout_treeShift(v) {
  var shift = 0;
  var change = 0;
  var children = v.children;
  var i = children.length;
  var w;
  while (--i >= 0) {
    w = children[i];
    w.prelim += shift;
    w.modifier += shift;
    shift += w.shift + (change += w.change);
  }
}

// ANCESTOR
// If vil’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
// returns the specified (default) ancestor.
function d3_layout_treeAncestor(vil, v, ancestor) {
  return vil.ancestor.parent === v.parent ? vil.ancestor : ancestor;
}


////////////////////////////////////////////////////////////////////////////
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  function d3_layout_hierarchyVisitBefore(node, callback) {
    var nodes = [ node ];
    while ((node = nodes.pop()) != null) {
      callback(node);
      if ((children = node.children) && (n = children.length)) {
        var n, children;
        while (--n >= 0) nodes.push(children[n]);
      }
    }
  }
  function d3_layout_hierarchyVisitAfter(node, callback) {
    var nodes = [ node ], nodes2 = [];
    while ((node = nodes.pop()) != null) {
      nodes2.push(node);
      if ((children = node.children) && (n = children.length)) {
        var i = -1, n, children;
        while (++i < n) nodes.push(children[i]);
      }
    }
    while ((node = nodes2.pop()) != null) {
      callback(node);
    }
  }