// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
d3.layout.flextree = function() {
  var hierarchy = d3.layout.hierarchy().sort(null).value(null);

  // Configuration defaults
  var separation = defaultSeparation,
      size = [1, 1],     // width, height; null if we're using nodeSize
      nodeSize = null;

  // The node size can be specified in one of three ways, and the following
  // computed variables simplify the handling
  //   size    nodeSize     nodeSizeFixed  nodeSizeFunc
  //   [x,y]     null         [1,1]         null        # scale drawing at end
  //   null      [x,y]        [x,y]         null
  //   null      function     null          function
  var nodeSizeFixed = null;
  var nodeSizeFunc = null;

  function defaultSeparation(a, b, gen) {
    if (nodeSizeFixed) {
      var scale = nodeSizeFixed[0];
      return a.parent == b.parent ? scale : 2 * scale;
    }
    else {
      var genscale = typeof gen == "undefined" || gen <= 1 ? 1 : 2;
      return (getXSize(a) + getXSize(b)) / 2 * genscale;
    }
  }

  // Lazily fetch the x and y sizes. Note that they'll only get cached onto the 
  // node when using the function version of nodeSize
  function getXSize(n) {
    var s;
    return nodeSizeFixed ? nodeSizeFixed[0] :
           typeof n.x_size != "undefined" ? n.x_size :
           ( s = nodeSizeFunc(n),
             n.y_size = s[1],
             n.x_size = s[0] );
  }
  function getYSize(n) {
    var s;
    return nodeSizeFixed ? nodeSizeFixed[1] :
           typeof n.y_size != "undefined" ? n.y_size :
           ( s = nodeSizeFunc(n),
             n.x_size = s[0],
             n.y_size = s[1] );
  }

  function flextree(d, i) {
    var nodes = hierarchy.call(this, d, i);

    // root_ is the root of the tree. By convention, the real tree nodes that
    // the user passed in are referred to by "_", and the wrapped nodes by
    // variables without "_".
    var root_ = nodes[0],
        root = wrapTree(root_);

    // "Walk zero" sets the y-coordinates, which depend only on the y_size of
    // the ancestor nodes.
    d3_layout_hierarchyVisitBefore(root, function(n) {
      var np_ = n.parent._;
      n._.y = np_.y + getYSize(np_);
    });

    // Compute the layout using Buchheim et al.'s algorithm.
    d3_layout_hierarchyVisitAfter(root, firstWalk);
    root.parent.m = -root.z;
    d3_layout_hierarchyVisitBefore(root, secondWalk);

    // If a fixed tree size is specified, scale x and y based on the extent.
    // Compute the left-most, right-most, and depth-most nodes for extents.
    if (size) {
      var left = root_,
          right = root_,
          bottom = root_;
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
  // First it creates a fake node, which is the parent of the root, and then
  // wraps that, and pushes that onto the queue. Then, for every node that's 
  // popped off the queue, this wraps the *children* of that node, and then 
  // pushes each child's wrapper onto the queue. Finally, this returns the 
  // wrapped version of root.
  // Note that the fake parent of root is used as a shortcut in lots of other 
  // places.

  function wrapTree(root_) {
    var adam = {
      A: null,
      _: {
        children: [root_],
        x: nodeSizeFunc ? 0 : -nodeSizeFixed[0],
        y: nodeSizeFunc ? 0 : -nodeSizeFixed[1],
        y_size: 0,
        x_size: 0,
      },
    };

    var queue = [adam],
        node;

    while ((node = queue.pop()) != null) {
      var children_ = (node._.children || []).slice();
      var children = node.children = [];
      var n = children_.length;
      for (var i = 0; i < n; ++i) {
        var child_ = children_[i];
        var child = {
          _: child_, // source node
          parent: node,
          A: null, // default ancestor
          a: null, // ancestor
          z: 0,    // prelim
          m: 0,    // modifier
          c: 0,    // change
          s: 0,    // shift
          t: null, // thread
          i: i,    // child number
        };
        children.push(child);
        child.a = child;
        queue.push(child);
      }
    }

    return adam.children[0];
  }

  // FIRST WALK
  // Computes a preliminary x-coordinate for v. 
  // This is applied recursively to the children of v, as well as the function
  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
  // node v is placed to the midpoint of its outermost children.
  function firstWalk(v) {
    var children = v.children,
        siblings = v.parent.children,
        left_sibling = v.i ? siblings[v.i - 1] : null;

    if (children.length) {
      d3_layout_treeShift(v);
      var cfirst = children[0],
          clast = children[children.length - 1];
      var midpoint = ( cfirst.z - getXSize(cfirst._) / 2 + 
                       clast.z + getXSize(clast._)/2 ) / 2;
      if (left_sibling) {
        v.z = left_sibling.z + separation(v._, left_sibling._);
        v.m = v.z - midpoint;
      } 
      else {
        v.z = midpoint;
      }
    } 
    else if (left_sibling) {
      // It's a leaf node, and it has a left sibling
      v.z = left_sibling.z + separation(v._, left_sibling._);
    }
    // If it's a leaf node with no left sibling, prelim and modifier default to 0.

    v.parent.A = apportion(v, left_sibling, v.parent.A || siblings[0]);
  }

  // SECOND WALK
  // Computes all real x-coordinates by summing up the modifiers recursively.
  function secondWalk(v) {
    v._.x = v.z + v.parent.m;
    v.m += v.parent.m;
  }

  // APPORTION
  // The core of the algorithm. Here, a new subtree is combined with the
  // previous subtrees. Threads are used to traverse the inside and outside
  // contours of the left and right subtree up to the highest common level. The
  // vertices used for the traversals are vim, vip, vom, and vop, where
  // `o` means outside and `i` means inside, the `m` means the left (minus) and
  // `p` means the right subtree. For summing up the modifiers along the
  // contour, we use respective variables sip, sim, som, and sop. Whenever two
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
          sip = vip.m,
          sop = vop.m,
          sim = vim.m,
          som = vom.m,
          shift;

      var v_depth = v._.depth;
      var vip_changed = false,
          vop_changed = false,
          vim_changed = false,
          vom_changed = false;

      while (true) 
      {
        var vir_end_y = vip._.y + getYSize(vip._);
        var vor_end_y = vop._.y + getYSize(vop._);
        var vil_end_y = vim._.y + getYSize(vim._);
        var vol_end_y = vom._.y + getYSize(vom._);

        var next_y = Math.min(
          vir_end_y, vor_end_y, vil_end_y, vol_end_y
        );
        if (next_y == vir_end_y) {
          vip = d3_layout_treeLeft(vip);
          vip_changed = true;
        }
        if (next_y == vil_end_y) {
          vim = d3_layout_treeRight(vim);   // next on left contour of this subtree
          vim_changed = true;
        }

        if (!vim || !vip) break;

        if (next_y == vor_end_y) {
          vop = d3_layout_treeRight(vop);
          vop_changed = true;
        }
        if (next_y == vol_end_y) {
          vom = d3_layout_treeLeft(vom);
          vom_changed = true;
        }

        if (vop_changed) vop.a = v;

        if (vim_changed || vip_changed) {
          shift = vim.z + sim - vip.z - sip + 
            separation(vim._, vip._,
                Math.max(vim._.depth - v_depth, vip._.depth - v_depth) + 1)
          ;
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
        }
        if (vim_changed) sim += vim.m;
        if (vip_changed) sip += vip.m;
        if (vom_changed) som += vom.m;
        if (vop_changed) sop += vop.m;
      }
      if (vim && vop && !d3_layout_treeRight(vop)) {
        vop.t = vim;
        vop.m += sim - sop;
      }
      if (vip && vom && !d3_layout_treeLeft(vom)) {
        vom.t = vip;
        vom.m += sip - som;
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

  return d3_layout_hierarchyRebind(flextree, hierarchy);
};


// NEXT LEFT
// This function is used to traverse the left contour of a subtree (or
// subforest). It returns the successor of v on this contour. This successor is
// either given by the leftmost child of v or by the thread of v. The function
// returns null if and only if v is on the highest level of its subtree.
function d3_layout_treeLeft(v) {
  var children = v.children;
  return children.length ? children[0] : v.t;
}

// NEXT RIGHT
// This function works analogously to NEXT LEFT.
function d3_layout_treeRight(v) {
  var children = v.children, n;
  return (n = children.length) ? children[n - 1] : v.t;
}

// MOVE SUBTREE
// Shifts the current subtree rooted at w+. This is done by increasing
// prelim(w+) and mod(w+) by shift.
function d3_layout_treeMove(wm, wp, shift) {
  var change = shift / (wp.i - wm.i);
  wp.c -= change;
  wp.s += shift;
  wm.c += change;
  wp.z += shift;
  wp.m += shift;
}

// EXECUTE SHIFTS
// All other shifts, applied to the smaller subtrees between w- and w+, are
// performed by this function. To prepare the shifts, we have to adjust
// change(w+), shift(w+), and change(w-).
function d3_layout_treeShift(v) {
  var shift = 0,
      change = 0,
      children = v.children,
      i = children.length,
      w;
  while (--i >= 0) {
    w = children[i];
    w.z += shift;
    w.m += shift;
    shift += w.s + (change += w.c);
  }
}

// ANCESTOR
// If vim’s ancestor is a sibling of v, returns vim’s ancestor. Otherwise,
// returns the specified (default) ancestor.
function d3_layout_treeAncestor(vim, v, ancestor) {
  return vim.a.parent === v.parent ? vim.a : ancestor;
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