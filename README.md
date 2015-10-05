# D3 flextree plugin

This is a fully backwards-compatible reimplementation of the 
[D3 tree layout](https://github.com/mbostock/d3/wiki/Tree-Layout), that allows for
node sizes that vary in either x or y directions.

See the [demo](http://klortho.github.io/d3-flextree/).

To use this plugin, use d3-flextree.js. See the
[API documentation](flextree-api.md), which is an edited copy of 
the original tree layout documentation, with additions for the new features.

----

The existing D3 tree layout is based on an algorithm developed originally by 
Reingold and Tilford in a paper from 1981, with improvements by various others,
the latest being from a paper by Bucheim and Leipert, in 2002. The algorithm has
been proven to run in linear time (O(n)).

A limitation of the existing algorithm is that it
requires (or assumes) that all of the nodes of the tree are the same size.
This is fine for many applications, but some types of tree visualizations
would greatly benefit from the ability to auto-generate tree layouts with
variable node sizes.

In a paper from 2013, A.J. van der Ploeg enhanced this algorithm to allow for
variable-sized nodes, while keeping its  linear runtime nature. The author of
that paper provide his algorithm as a working Java application on GitHub at
[cwi-swat/non-layered-tidy-trees](https://github.com/cwi-swat/non-layered-tidy-trees).

I adapted that code into this flextree plugin as follows:

* Forked the Java code to [Klortho/flextree-java](https://github.com/Klortho/flextree-java),
  and modified it so that its API closely resembles the D3 tree layout API.
* Wrote a set of fixed-node-size test cases, and tweaked the output of the Java
  application such that, for these cases, its output was identical to that produced by D3.
* Added a lot of variable-node-size test cases, and verified the results
* Ported the code to JavaScript, into the 
  [src/layout/tree.js](https://github.com/Klortho/d3/blob/119c563c554adeb30e01e5dd3f491bb8e62a53af/src/layout/tree.js)
  module of my fork of D3.
* Got the result to pass the same set of [test 
  cases](http://klortho.github.io/d3-flextree/test/).
* Wrote the [demo page](http://klortho.github.io/d3-flextree/) to render these same
  test cases.
* Wrote a script to take the new src/layout/tree.js, and produce the plugin
  d3-flextree.js.


## Development

To regenerate the plugin:

```
git clone --recursive https://github.com/Klortho/d3-flextree.git
npm install --global gulp   # if you haven't already

cd d3-flextree/d3
npm install
make         # builds (forked) d3.js and d3.min.js

cd ..
npm install
gulp         # builds d3-flextree.js
```


## Acknowledgements and links

Many thanks to A.J. van der Ploeg, for making his code available on GitHub!


### Papers

* [Tidier Drawings of 
  Trees](http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf). Reingold and 
  Tilford, 1981
* [A Node-Positioning Algorithm for General 
  Trees](http://www.cs.unc.edu/techreports/89-034.pdf). Walker, 1989
* [Improving Walker's Algorithm to Run in Linear 
  Time](http://dirk.jivas.de/papers/buchheim02improving.pdf). Buchheim, Junger, 
  and Leipert, 2002.
* [Drawing Non-layered Tidy Trees in Linear 
  Time](http://oai.cwi.nl/oai/asset/21856/21856B.pdf). A.J. van der Ploeg, 2013

### Other

* D3 [GitHub issue 1992 - Allow nodeSize for trees to be 
  dynamic](https://github.com/mbostock/d3/issues/1992).
* [D3 pull request #2571](https://github.com/mbostock/d3/pull/2571)
* [Plugin wiki page](https://github.com/mbostock/d3/wiki/Plugins)
* [My post to the d3-js mailing 
  list](https://groups.google.com/forum/#!topic/d3-js/O4hHCS-XXqY).
* Somebody else [asking for this 
  feature](https://groups.google.com/forum/?fromgroups=#!searchin/d3-js/tree/d3-js/BjCvUpbqfb4/_rO0QcaKiGMJ) 
  on the d3.js list.
