'use strict';
import {hierarchy} from 'd3-hierarchy';
export {hierarchy};

const Node = hierarchy.prototype.constructor;
const symbol = Symbol('flextree');

const defaultOpts = Object.freeze({
  nodeSize: d => d.size,
  children: d => d.children || [],
  spacing: (a, b) => 0,
});
const optNames = Object.keys(defaultOpts);

// A class that uses the default accessors.
class DefaultFlextreeNode extends Node {
  constructor(data) {
    super(data);
  }
  spawn(data) {
    return new (this.constructor)(data);
  }
  static new(data) {
    return new DefaultFlextreeNode(data);
  }

  initTree(parent = null) {
    Object.assign(this, {
      parent,
      depth: parent === null ? 0 : parent.depth + 1,
      height: 0,
      length: 1,
      children: this.dataChildren.map(cd => this.spawn(cd).initTree(this)),
    });
    return Object.assign(this,
      this.children.reduce(
        (hl, kid) => ({
          height: Math.max(hl.height, kid.height + 1),
          length: hl.length + kid.length,
        }), this
      )
    );
  }

  initLayout() {
    Object.assign(this, {
      relX: 0,
      prelim: 0,
      shift: 0,
      change: 0,
      x: 0,
      y: 0,
      lExt: this,
      lExtRelX: 0,
      rExt: this,
      rExtRelX: 0,
      lThr: null,
      rThr: null,
    });
    this.children.forEach(kid => kid.initLayout());
  }

  update() {
    this.initTree();
    this.initLayout();
    this.layoutChildren();
    this.resolveX();
    return this;
  }

  get [symbol]() {
    return true;
  }
  get options() {
    return defaultOpts;
  }
  get dataChildren() {
    return this.options.children(this.data);
  }
  get size() {
    const ns = this.options.nodeSize;
    return typeof ns === 'function' ? ns(this.data) : ns;
  }
  spacing(other) {
    return this.options.spacing(this.data, other.data);
  }
  get xSize() {
    return this.size[0];
  }
  get ySize() {
    return this.size[1];
  }
  get position() {
    return [this.x, this.y];
  }
  get top() {
    return this.y;
  }
  get bottom() {
    return this.y + this.ySize;
  }
  get left() {
    return this.x - this.xSize / 2;
  }
  get right() {
    return this.x + this.xSize / 2;
  }
  get extents() {
    return this.children.reduce(
      (acc, kid) => maxExtents(acc, kid.extents),
      this.nodeExtents
    );
  }
  get nodes() {
    return this.descendants();
  }
  get nodeExtents() {
    return {
      top: this.top,
      bottom: this.bottom,
      left: this.left,
      right: this.right,
    }
  }
  get numChildren() {
    return this.children.length;
  }
  get hasChildren() {
    return this.numChildren !== 0;
  }
  get noChildren() {
    return this.numChildren === 0;
  }
  get firstChild() {
    return this.hasChildren ? this.children[0] : null;
  }
  get lastChild() {
    return this.hasChildren ? this.children[this.numChildren - 1] : null;
  }

  // Resolves the relative coordinate properties - relX and prelim --
  // to set the final, absolute x coordinate for each node. This also sets
  // `prelim` to 0, so that `relX` for each node is its x-coordinate relative
  // to its parent.
  resolveX(prevSum, parentX) {
    // A call to resolveX without arguments is assumed to be for the root of
    // the tree. This will set the root's x-coord to zero.
    if (typeof prevSum === 'undefined') {
      prevSum = -this.relX - this.prelim;
      parentX = 0;
    }
    const sum = prevSum + this.relX;          // for the root => -this.prelim
    this.relX = sum + this.prelim - parentX;  // for the root => 0
    this.prelim = 0;
    this.x = parentX + this.relX;             // for the root => 0
    this.children.forEach(child => child.resolveX(sum, this.x));
    return this;
  }

  _dumpNode() {
    const d = prop => prop + ': ' + this[prop];
    const refNode = prop => prop + ': ' + (
      ( (prop in this) &&
        (typeof this[prop] === 'object') &&
        (this[prop] !== null) ) ? ('#' + this[prop].data.id) : '∅'
    );
    return [
      'node: #' + this.data.id + ', ' + this.xSize + ' X ' + this.ySize,
      '  ' + d('x') + ', ' + d('y') + ' / ' + d('relX') + ', ' + d('prelim'),
      '  ' + d('depth') + ', ' + d('height') + ', ' + d('length'),
      '  ' + refNode('lExt') + ', ' + d('lExtRelX'),
      '  ' + refNode('lThr'),
      '  ' + refNode('rExt') + ', ' + d('rExtRelX'),
      '  ' + refNode('rThr'),
    ];
  }
  _dumpTree() {
    return this._dumpNode().concat(
      ...this.children.map(kid => kid._dumpTree().map(line => '    ' + line))
    );
  }
  dump(recurse = false) {
    return (recurse ? this._dumpTree() : this._dumpNode()).join('\n');
  }

  layoutChildren(y = 0) {
    this.y = y;
    this.children.reduce((acc, kid) => {
      const [i, lastLows] = acc;
      kid.layoutChildren(this.y + this.ySize);
      // The lowest vertical coordinate while extreme nodes still point
      // in current subtree.
      const lowY = (i === 0 ? kid.lExt : kid.rExt).bottom;
      if (i !== 0) this.separate(i, lastLows);
      const lows = updateLows(lowY, i, lastLows);

      return [i + 1, lows];
    }, [0, null]);

    this.shiftChange();
    this.positionRoot();

    return this;
  }

  // Process shift and change for all children, to add intermediate spacing to
  // each child's modifier.
  shiftChange() {
    this.children.reduce((acc, child) => {
      const [lastShiftSum, lastChangeSum] = acc;
      const shiftSum = lastShiftSum + child.shift;
      const changeSum = lastChangeSum + shiftSum + child.change;
      child.relX += changeSum;
      return [shiftSum, changeSum];
    }, [0, 0]);
  }

  // Separates the latest child from its previous sibling
  separate(i, lows) {
    const lSib = this.children[i - 1];
    const curSubtree = this.children[i];

    var rContour = lSib;
    var rSumMods = lSib.relX;
    var lContour = curSubtree;
    var lSumMods = curSubtree.relX;
    var isFirst = true;

    while (rContour && lContour) {
      if (rContour.bottom > lows.lowY) lows = lows.next;

      // How far to the left of the right side of rContour is the left side
      // of lContour? First compute the center-to-center distance, then add
      // the "spacing"
      const dist = (rSumMods + rContour.prelim) -
                 (lSumMods + lContour.prelim) +
                 rContour.xSize / 2 +
                 lContour.xSize / 2 +
                 rContour.spacing(lContour);
      if (dist > 0 || (dist < 0 && isFirst)) {
        lSumMods += dist;
        // Move subtree by changing relX.
        this.moveSubtree(curSubtree, dist);
        this.distributeExtra(i, lows.index, dist);
      }
      isFirst = false;

      // Advance highest node(s) and sum(s) of modifiers
      const rightBottom = rContour.bottom;
      const leftBottom = lContour.bottom;
      if (rightBottom <= leftBottom) {
        rContour = rContour.nextRContour;
        if (rContour) rSumMods += rContour.relX;
      }
      if (rightBottom >= leftBottom) {
        lContour = lContour.nextLContour;
        if (lContour) lSumMods += lContour.relX;
      }
    }

    // Set threads and update extreme nodes. In the first case, the
    // current subtree is taller than the left siblings.
    if (!rContour && lContour)
      this.setLThr(i, lContour, lSumMods);

    // In the next case, the left siblings are taller than the current subtree
    else if (rContour && !lContour)
      this.setRThr(i, rContour, rSumMods);
  }

  // Move subtree by changing relX.
  moveSubtree(subtree, distance) {
    subtree.relX += distance;
    subtree.lExtRelX += distance;
    subtree.rExtRelX += distance;
  }

  distributeExtra(curSubtreeI, leftSibI, dist) {
    const curSubtree = this.children[curSubtreeI],
          n = curSubtreeI - leftSibI;
    // Are there intermediate children?
    if (n > 1) {
      const delta = dist / n;
      this.children[leftSibI + 1].shift += delta;
      curSubtree.shift -= delta;
      curSubtree.change -= dist - delta;
    }
  }
  get nextLContour() {
    return this.hasChildren ? this.firstChild : this.lThr;
  }
  get nextRContour() {
    return this.hasChildren ? this.lastChild : this.rThr;
  }
  setLThr(i, lContour, lSumMods) {
    const firstChild = this.firstChild,
          lExt = firstChild.lExt,
          curSubtree = this.children[i];
    lExt.lThr = lContour;
    // Change relX so that the sum of modifier after following thread is correct.
    const diff = lSumMods - lContour.relX - firstChild.lExtRelX;
    lExt.relX += diff;
    // Change preliminary x coordinate so that the node does not move.
    lExt.prelim -= diff;
    // Update extreme node and its sum of modifiers.
    firstChild.lExt = curSubtree.lExt;
    firstChild.lExtRelX = curSubtree.lExtRelX;
  }
  // Mirror image of setLThr.
  setRThr(i, rContour, rSumMods) {
    const curSubtree = this.children[i],
          rExt = curSubtree.rExt,
          lSib = this.children[i - 1];
    rExt.rThr = rContour;
    const diff = rSumMods - rContour.relX - curSubtree.rExtRelX;
    rExt.relX += diff;
    rExt.prelim -= diff;
    curSubtree.rExt = lSib.rExt;
    curSubtree.rExtRelX = lSib.rExtRelX;
  }
  // Position root between children, taking into account their modifiers
  positionRoot() {
    if (this.hasChildren) {
      const k0 = this.firstChild,
            kf = this.lastChild,
            prelim = (k0.prelim + k0.relX - k0.xSize / 2 +
              kf.relX + kf.prelim + kf.xSize / 2 ) / 2;
      Object.assign(this, {
        prelim,
        lExt: k0.lExt,
        lExtRelX: k0.lExtRelX,
        rExt: kf.rExt,
        rExtRelX: kf.rExtRelX,
      });
    }
  }
}
// Make/maintain a linked list of the indexes of left siblings and their
// lowest vertical coordinate.
function updateLows(lowY, index, lastLows) {
  // Remove siblings that are hidden by the new subtree.
  while (lastLows !== null && lowY >= lastLows.lowY)
    lastLows = lastLows.next;
  // Prepend the new subtree.
  return {
    lowY,
    index,
    next: lastLows,
  };
}
function maxExtents(e0, e1) {
  return {
    top: Math.min(e0.top, e1.top),
    bottom: Math.max(e0.bottom, e1.bottom),
    left: Math.min(e0.left, e1.left),
    right: Math.max(e0.right, e1.right),
  }
}

// Create a layout function with customizable options. Per D3-style, the
// options can be set at any time using setter methods. The layout function
// will compute the tree node positions based on the options in effect at the
// time it is called. Every layout object created by calling flextree() has
// its own, independent set of options.
export function flextree(opts) {
  const options = Object.assign({}, defaultOpts, opts);

  function layout(arg) {
    const tree = layout.wrap(arg);
    return tree.update();
  }

  Object.assign(layout,
    ...optNames.map(name => ({
      [name]: (
        val => typeof val === 'undefined'
          ? options[name]
          : (options[name] = val, layout)
      )
    })),
    {
      options,

      // Returns a new FlextreeNode class with frozen custom options
      get FlextreeNode() {
        const opts = Object.freeze(Object.assign({}, options));
        class FlextreeNode extends DefaultFlextreeNode {
          get options() {
            return opts;
          }
        }
        return FlextreeNode;
      },

      // This wraps a node's data in an instance of a FlextreeNode class
      // that encapsulates the custom accessors. If the argument is already an
      // instance of FlextreeNode, then the
      // same object will be returned. Otherwise, a new object will
      // be created and returned.
      wrap(arg) {
        const isFlextree = arg[flextree.symbol] || false;
        if (isFlextree) return arg.initTree();
        return new (this.FlextreeNode)(arg);
      },
    }
  );

  return layout;
}

Object.assign(flextree, {
  symbol,
  hierarchy,
  DefaultFlextreeNode,
});
