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


# To do

## Fix separator/margin

* ✓Go back to master of d3, make a new branch, and then write a test for
  needed behavior of separator
* ✓Merge that into my flextree branch
* Get these regression tests working with flextree.


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


## Publish

!


# References

* [1] [Tidier Drawings of Trees](http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf).
  Reingold and Tilford, 1981



