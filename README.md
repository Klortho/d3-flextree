# Flexible trees

Trees with dynamic node size.

See 

* [Demo](http://klortho.github.io/d3-flextree/)
* D3 [GitHub issue 1992 - Allow nodeSize for trees to be 
  dynamic](https://github.com/mbostock/d3/issues/1992).
* That references this paper, [Drawing Non-layered Tidy Trees in Linear 
  Time](http://oai.cwi.nl/oai/asset/21856/21856B.pdf)

Here are my working repos/branches:

* My fork [Klortho/d3](https://github.com/klortho/d3)
* Branch [septest](https://github.com/klortho/d3/tree/septest) - branched 
  off of master, has new regression tests for separation(), size() and 
  nodeSize(), that work in the existing, unmodified D3 library.
* Branch [flextree](https://github.com/klortho/d3/tree/flextree) - latest/greatest

Here's somebody else [asking for this 
feature](https://groups.google.com/forum/?fromgroups=#!searchin/d3-js/tree/d3-js/BjCvUpbqfb4/_rO0QcaKiGMJ)
on the d3.js list.


# To do

## Fix separator/margin

See [here](https://groups.google.com/forum/#!topic/d3-js/O4hHCS-XXqY)
for the design.

* [c] Add some options for separator/margin to the flextree-test.js file


* Add tests:
    - That tree.nodeSize([10,10]) behaves the same as
      tree.nodeSize(function(){return [10,10];})
    - behavior of the separation() function:
        - call with null resets the state to use default

* Implement margin().



## Reorganize this d3-flextree repo

* Add my fork of the d3 repo as a submodule
* Write a script that does `make` on d3, then creates the flextree module
  from that. It should be a perl script that works on d3.js
* Demo page should be the *new test page* (see below)


## More tests

* Do some from the academic papers - maybe.


## New test page

* Controls for:
    * Sizing - select box, similar to what is there now
        * size
        * fixed nodeSize
        * variable nodeSize
    * Library - select box
        * The real d3 on cdnjs. This will force sizing to either
          fixed nodeSize or size.
        * My fork of d3
        * flextree plugin - generated from d3.js with the script
    * For each of left and right branches:
        * Number of nodes in the chain - slider
        * Overall length of the chain - slider
        * Overall width of leaf group - slider
        * Aspect ration of leaf group - slider
    * Margin - slider

* Don't draw diagonals. Every node should be a rendered as a full-sized box.


## Create a pull request

* To do first:
    * Update the wiki documentation - I already forked it to my fork of d3's 
      wiki.

* Things to mention:
    * Cleaned up the way size and nodeSize is handled.


## Register the plugin



# References

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



