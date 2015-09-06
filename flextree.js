/////////////////////////////////////////////////////////////////////////////
// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
d3.layout.flextree = function() {
  var hierarchy = d3.layout.hierarchy().sort(null).value(null);

  // Configuration defaults
  var separation = d3_layout_treeSeparation;
  var size = [1, 1];     // width, height; null if we're using nodeSize
  var nodeSize = null;


  function flextree(d, i) {
    // This produces the array of all of the nodes in the tree
    var nodes = hierarchy.call(this, d, i);

    // root_ is the root of the tree. By convention, the real tree nodes that
    // the user passed in are referred to by "_", and the wrapped nodes by
    // variables without "_".
    var root_ = nodes[0];

    // root is a wrapper around the root node
    var root = wrapTree(root_);

    // Compute the layout using Buchheim et al.'s algorithm.
    d3_layout_hierarchyVisitAfter(root, firstWalk);
    root.parent.modifier = -root.prelim;
    d3_layout_hierarchyVisitBefore(root, secondWalk);


    // If a fixed node size is specified, scale x and y.
    if (nodeSize) {
      d3_layout_hierarchyVisitBefore(root_, function(node) {
        var ns = typeof nodeSize == "function" ? nodeSize(node) : nodeSize;
        node.x *= ns[0];
        node.y = node.depth * ns[1];
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
  function wrapTree(root_) {
    var root = {
      A: null, 
      children: [root_]
    };

    var queue = [root];
    var node1;
    while ((node1 = queue.pop()) != null) {
      var children = node1.children;
      var child;
      var i = 0;
      var n = children.length;
      for (i = 0; i < n; ++i) {
        children[i] = child = {
          _: children[i], // source node
          parent: node1,
          children: (child = children[i].children) && child.slice() || [],
          A: null,         // default ancestor
          ancestor: null,
          prelim: 0,
          modifier: 0,
          change: 0,
          shift: 0,
          thread: null,
          i: i,
        };
        child.ancestor = child;
        queue.push(child);
      }
    }

    return root.children[0];
  }

  // FIRST WALK
  // Computes a preliminary x-coordinate, and the final y-coordinate, for v. 
  // Before that, FIRST WALK is
  // applied recursively to the children of v, as well as the function
  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
  // node v is placed to the midpoint of its outermost children.
  function firstWalk(v) {
    var children = v.children;
    var siblings = v.parent.children;

    var left_sibling = v.i ? siblings[v.i - 1] : null;

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
      // It's a leaf node.
      // If it has a left sibling
      v.prelim = left_sibling.prelim + separation(v._, left_sibling._);
    }
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
  // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
  // superscript o means outside and i means inside, the subscript - means left
  // subtree and + means right subtree. For summing up the modifiers along the
  // contour, we use respective variables si+, si-, so-, and so+. Whenever two
  // nodes of the inside contours conflict, we compute the left one of the
  // greatest uncommon ancestors using the function ANCESTOR and call MOVE
  // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
  // Finally, we add a new thread (if necessary).
  function apportion(v, w, ancestor) {
    if (w) {
      var vip = v,
          vop = v,
          vim = w,
          vom = vip.parent.children[0],
          sip = vip.modifier,
          sop = vop.modifier,
          sim = vim.modifier,
          som = vom.modifier,
          shift;
      while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
        vom = d3_layout_treeLeft(vom);
        vop = d3_layout_treeRight(vop);
        vop.ancestor = v;
        shift = vim.prelim + sim - vip.prelim - sip + separation(vim._, vip._);
        if (shift > 0) {
          d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
          sip += shift;
          sop += shift;
        }
        sim += vim.modifier;
        sip += vip.modifier;
        som += vom.modifier;
        sop += vop.modifier;
      }
      if (vim && !d3_layout_treeRight(vop)) {
        vop.thread = vim;
        vop.modifier += sim - sop;
      }
      if (vip && !d3_layout_treeLeft(vom)) {
        vom.thread = vip;
        vom.modifier += sip - som;
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
    size = x;
    nodeSize = null;
    return flextree;
  };

  flextree.nodeSize = function(x) {
    if (!arguments.length) return nodeSize;
    nodeSize = x;
    size = null;
    return flextree;
  };

  return d3_layout_hierarchyRebind(flextree, hierarchy);
};

function d3_layout_treeSeparation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}

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
  var change = shift / (wp.i - wm.i);
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
// If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
// returns the specified (default) ancestor.
function d3_layout_treeAncestor(vim, v, ancestor) {
  return vim.ancestor.parent === v.parent ? vim.ancestor : ancestor;
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
