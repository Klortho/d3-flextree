***This is an edited copy of the [D3 tree layout API 
page](https://github.com/mbostock/d3/wiki/Tree-Layout), updated to reflect the
new "flextree" features.***

----

> [Wiki](https://github.com/mbostock/d3/wiki) ▸ [API Reference](https://github.com/mbostock/d3/wiki/API-Reference) ▸ [Layouts](https://github.com/mbostock/d3/wiki/Layouts) ▸ [Hierarchy](https://github.com/mbostock/d3/wiki/Hierarchy-Layout) ▸ **Tree Layout**

The **tree** layout produces tidy node-link diagrams of trees using the [Reingold–Tilford “tidy” algorithm](http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf). For example, a tree layout can be used to organize software classes in a package hierarchy:

[![diagonal](https://github.com/mbostock/d3/wiki/diagonal.png)](http://mbostock.github.com/d3/ex/tree.html)

Like most other layouts, the object returned by d3.layout.tree is both an object and a function. That is: you can call the layout like any other function, and the layout has additional methods that change its behavior. Like other classes in D3, layouts follow the method chaining pattern where setter methods return the layout itself, allowing multiple setters to be invoked in a concise statement.

<a name="tree" href="#tree">#</a> d3.layout.<b>tree</b>()

Creates a new tree layout with the default settings: the default sort order is null; the default children accessor assumes each input data is an object with a children array; the default separation function uses one node width for siblings, and two node widths for non-siblings; the default size is 1×1.

<a name="_tree" href="#_tree">#</a> <b>tree</b>(<i>root</i>)
<br><a name="nodes" href="#nodes">#</a> tree.<b>nodes</b>(<i>root</i>)

Runs the tree layout, returning the array of nodes associated with the specified *root* node. The tree layout is part of D3's family of [[hierarchical|Hierarchy-Layout]] layouts. These layouts follow the same basic structure: the input argument to the layout is the root node of the hierarchy, and the output return value is an array representing the computed positions of all nodes. Several attributes are populated on each node:

* parent - the parent node, or null for the root.
* children - the array of child nodes, or null for leaf nodes.
* depth - the depth of the node, starting at 0 for the root.
* x - the computed *x*-coordinate of the node position.
* y - the computed *y*-coordinate of the node position.

If setNodeSizes is set to true, then the following additional attributes are set:

* x_size
* y_size

Although the layout has a size in *x* and *y*, this represents an arbitrary coordinate system; for example, you can treat *x* as a radius and *y* as an angle to produce a radial rather than Cartesian layout.

<a name="links" href="#links">#</a> tree.<b>links</b>(<i>nodes</i>)

Given the specified array of *nodes*, such as those returned by [nodes](Tree-Layout#nodes), returns an array of objects representing the links from parent to child for each node. Leaf nodes will not have any links. Each link is an object with two attributes:

* source - the parent node (as described above).
* target - the child node.

This method is useful for retrieving a set of link descriptions suitable for display, often in conjunction with the [diagonal](SVG-Shapes#diagonal) shape generator. For example:

```javascript
svg.selectAll("path")
    .data(tree.links(nodes))
  .enter().append("path")
    .attr("d", d3.svg.diagonal());
```

<a name="children" href="#children">#</a> tree.<b>children</b>([<i>children</i>])

If *children* is specified, sets the specified children accessor function. If *children* is not specified, returns the current children accessor function, which by default assumes that the input data is an object with a children array:

```javascript
function children(d) {
  return d.children;
}
```

Often, it is convenient to load the node hierarchy using [d3.json](Requests#d3_json), and represent the input hierarchy as a nested [JSON](http://json.org) object. For example:

```javascript
{
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "size": 3938},
      {"name": "CommunityStructure", "size": 3812},
      {"name": "MergeEdge", "size": 743}
     ]
    },
    {
     "name": "graph",
     "children": [
      {"name": "BetweennessCentrality", "size": 3534},
      {"name": "LinkDistance", "size": 5731}
     ]
    }
   ]
  }
 ]
}
```

The children accessor is first invoked for root node in the hierarchy. If the accessor returns null, then the node is assumed to be a leaf node at the layout traversal terminates. Otherwise, the accessor should return an array of data elements representing the child nodes.

<a name="separation" href="#separation">#</a> tree.<b>separation</b>([<i>separation</i>])

If *separation* is specified, uses the specified function to compute separation between neighboring nodes. If *separation* is not specified, returns the current separation function, which defaults to:

```javascript
function separation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}
```

The separation property is exclusive with [tree.spacing](#spacing); setting tree.separation sets tree.spacing to null.

A variation that is more appropriate for radial layouts reduces the separation gap proportionally to the radius:

```javascript
function separation(a, b) {
  return (a.parent == b.parent ? 1 : 2) / a.depth;
}
```

When using nodes that vary in x_size, it is probably preferable to use the spacing() function,
described below. The results of separation() are interpreted by the layout algorithm as
center-to-center distances between nodes, in units of the root node's x_size. For example,
if the root node has an x_size of 10 pixels, and the separation function, when called on nodes A
and B, returns 2, then the layout algorithm will place A and B 20 pixels apart. If A and B
have different (greater) x_sizes, however, this might cause overlap.

The separation function is passed two neighboring nodes *a* and *b*, and must return the desired separation between nodes. The nodes are typically siblings, though the nodes may also be cousins (or even more distant relations) if the layout decides to place such nodes adjacent.

<a name="spacing" href="#spacing">#</a> tree.<b>spacing</b>([<i>spacing</i>])

If *spacing* is specified, uses the specified function to compute spacing between neighboring nodes. If *spacing* is not specified, returns the current spacing function, which defaults to null (by default, separation is used).

The spacing property is exclusive with [tree.separation](#separation); setting tree.spacing sets tree.separation to null.

Unlike separation, this function should return a number that is in the same units of distance as that returned by nodeSize. Furthermore, unlike separation, this number gives the required distance between the edges of the nodes, not center-to-center. For example, consider the case of tree that has nodes with fixed x_sizes of 10. Using the separation function to return a value of 1.4 would place the nodes 14 pixels apart, center-to-center. The same result could be acheived by using the spacing function to return a value of 4.

When laying out trees with nodes that vary in their x_sizes, the spacing function is probably preferable.


<a name="size" href="#size">#</a> tree.<b>size</b>([<i>size</i>])

If *size* is specified, sets the available layout size to the specified two-element array of numbers representing *x* and *y*. If *size* is not specified, returns the current size, which defaults to 1×1. The layout size is specified in *x* and *y*, but this is not limited screen coordinates and may represent an arbitrary coordinate system. For example, to produce a radial layout where the tree breadth (*x*) is measured in degrees, and the tree depth (*y*) is a radius *r* in pixels, say [360, *r*].

The size property is exclusive with [tree.nodeSize](#nodeSize); setting tree.size sets tree.nodeSize to null.

<a name="nodeSize" href="#nodeSize">#</a> tree.<b>nodeSize</b>([<i>nodeSize</i>])

If *nodeSize* is specified as a two-element array, sets a fixed size for each node as [x_size, y_size]. *nodeSize* can also be specified as a function that takes one argument (the node) and returns a two-element array. If *nodeSize* is not specified, returns the current node size, which defaults to null indicating that the layout is determined using the overall [tree.size](#size) property. The layout size is specified in *x* and *y*, but this is not limited screen coordinates and may represent an arbitrary coordinate system.

The nodeSize property is exclusive with [tree.size](#size); setting tree.nodeSize sets tree.size to null.

<a name="setNodeSizes" href="#setNodeSizes">#</a> tree.<b>setNodeSizes</b>([<i>setNodeSizes</i>])

If *setNodeSizes* is specified as *true*, then the layout function will set the x_size and y_size attributes on every node in the tree. If *setNodeSizes* is not specified, this will return the current value, which defaults to *false*.

<a name="sort" href="#sort">#</a> tree.<b>sort</b>([<i>comparator</i>])

If *comparator* is specified, sets the sort order of sibling nodes for the layout using the specified comparator function.  If *comparator* is not specified, returns the current group sort order, which defaults to null for no sorting. The comparator function is invoked for pairs of nodes, being passed the input data for each node. The default comparator is null, which disables sorting and uses tree traversal order. For example, to sort sibling nodes in descending order by the associated input data's numeric value attribute, say:

```javascript
function comparator(a, b) {
  return b.value - a.value;
}
```

Sorting by the node's name or key is also common. This can be done easily using [d3.ascending](Arrays#d3_ascending) or [d3.descending](Arrays#d3_descending).

<a name="value" href="#value">#</a> tree.<b>value</b>([<i>value</i>])

If *value* is specified, sets the value accessor to the specified function. If *value* is not specified, returns the current value accessor which defaults to null, meaning that the value attribute is not computed. If specified, the value accessor is invoked for each input data element, and must return a number representing the numeric value of the node. This value has no effect on the tree layout, but is generic functionality provided by hierarchy layouts.