# D3 flextree plugin

This plugin provides a more general version of the [D3 tidy-tree
layout module](https://github.com/d3/d3-hierarchy#tree). Unlike that
module, which assumes fixed-sized nodes, this plugin allows for nodes
of variable sizes. Like the d3 tidy-tree module, the algorithm runs in
O(n) time.

`flextree` is a factory function that returns a ***layout*** instance. A
layout is a function that computes the positions of nodes in a
tree diagram. Properties attached to the layout control aspects
of the algorithm.

## Installing

```
npm install d3-flextree
```

## API Reference

<a name="flextree" href="#flextree">#</a> <b>flextree</b>()

Creates a new layout with default settings:

- `nodeSize`: `d => d.size`
- `children`: `d => d.children || []`
- `spacing`: `(a, b) => 0`

<a name="layout" href="#layout">#</a> <b>layout</b>(<i>root</i>)

Computes the layout of a tree diagram, returning a representation of
that diagram, which is a hierarchical set of node objects. Each of the
returned objects "wraps" a data node in the original tree.
The original tree data is not mutated.

Each of the objects in the returned hierarchy has the following
properties:

* *node*.data - reference to the original tree data object
* *node*.nodes - all of the nodes in this subtree
* *node*.parent - the parent node, or `null` for the root.
* *node*.children - the array of child nodes, or `null` for leaf nodes.
* *node*.depth - the depth of the node, starting at 0 for the root.
* *node*.height - the distance from this node to its deepest descendent,
  or 0 for leaf nodes.
* *node*.x - the computed *x*-coordinate of the node position.
* *node*.y - the computed *y*-coordinate of the node position.

Although the layout is defined in terms of *x* and *y*, these represent an
arbitrary coordinate system. For example, you can treat *x* as a radius
and *y* as an angle to produce a radial rather than Cartesian layout.

Additionally, the returned tree nodes inherit all of the methods defined
in [d3.hierarchy](http://devdocs.io/d3~4/d3-hierarchy). In particular:

* *node*.[ancestors](http://devdocs.io/d3~4/d3-hierarchy#node_ancestors)()
* *node*.[descendants](http://devdocs.io/d3~4/d3-hierarchy#node_descendants)()
* *node*.[leaves](http://devdocs.io/d3~4/d3-hierarchy#node_leaves)()
* *node*.[path](http://devdocs.io/d3~4/d3-hierarchy#node_path)(*target*)
* *node*.[links](http://devdocs.io/d3~4/d3-hierarchy#node_links)()
* *node*.[sum](http://devdocs.io/d3~4/d3-hierarchy#node_sum)(*value*)
* *node*.[count](http://devdocs.io/d3~4/d3-hierarchy#node_count)()
* *node*.[sort](http://devdocs.io/d3~4/d3-hierarchy#node_sort)(*compare*)
* *node*.[each](http://devdocs.io/d3~4/d3-hierarchy#node_each)(*function*)
* *node*.[eachAfter](http://devdocs.io/d3~4/d3-hierarchy#node_eachAfter)(*function*)
* *node*.[eachBefore](http://devdocs.io/d3~4/d3-hierarchy#node_eachBefore)(*function*)
* *node*.[copy](http://devdocs.io/d3~4/d3-hierarchy#node_copy)() -
  note that this does not preserve the original class.



<a name="children" href="#children">#</a> layout.<b>children</b>([<i>children</i>])

If *children* is specified, sets the specified children accessor function.
If *children* is not specified, returns the current children accessor
function, which by default assumes that the input data is an object with
a children array:

```javascript
d => d.children || []
```

The children accessor is first invoked for the root node in the hierarchy.


<a name="spacing" href="#spacing">#</a>
layout.<b>spacing</b>([<i>spacing</i>])

If *spacing* is specified, uses the specified function to compute spacing
between neighboring nodes. If *spacing* is not specified, returns the
current spacing function, which defaults to a function that always
returns `0`:

```javascript
(a, b) => 0
```

A common requirement is to increase the spacing for nodes that are not
siblings. This could be accomplished with, for example:

```javascript
layout.spacing( (a, b) => 10 * a.path(b).length );
```

<a name="nodeSize" href="#nodeSize">#</a> layout.<b>nodeSize</b>([<i>nodeSize</i>])

If *nodeSize* is specified as a two-element array `[width, height]`, then
this sets that as the fixed size for every node in the tree. *nodeSize*
could also be an accessor function, that takes the node as an argument
and returns a two-element array. If *nodeSize* is not specified, this
returns the current nodeSize setting.



<a name="algorithm"></a>
## The Algorithm

The existing D3 tree layout is based on an algorithm developed originally
by Reingold and Tilford in their paper from 1981, [Tidier Drawings of
Trees][1]. The algorithm was improved over time by others, including Walker,
in a paper in 1989, [A Node-Positioning Algorithm for General Trees][2], and
the latest improvement by Bucheim, Junger, and Leipert in 2002, described in their
paper, [Improving Walker's Algorithm to Run in Linear Time][2].

A limitation of that algorithm is that it applies to trees in which all of
the nodes are the same size. This is adequate for many applications, but
a more general solution would allow variable node sizes.

In a paper from 2013, A.J. van der Ploeg enhanced the algorithm to allow
for variable-sized nodes, while keeping its linear runtime nature. He
described the algorithm in his paper, [Drawing Non-layered Tidy Trees in
Linear Time][3]. The author also provided a working Java application
on GitHub at
[cwi-swat/non-layered-tidy-trees](https://github.com/cwi-swat/non-layered-tidy-trees).

This module is a port from that Java code into JavaScript.


[1]: http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
[2]: http://www.cs.unc.edu/techreports/89-034.pdf
[2]: http://dirk.jivas.de/papers/buchheim02improving.pdf
[3]: http://oai.cwi.nl/oai/asset/21856/21856B.pdf
