# Flexible trees

Meaning, dynamic node size

See 

* D3 [GitHub issue 1992 - Allow nodeSize for trees to be 
  dynamic](https://github.com/mbostock/d3/issues/1992).
* That references this paper, [Drawing Non-layered Tidy Trees in Linear 
  Time](http://oai.cwi.nl/oai/asset/21856/21856B.pdf)

## Fix separator/margin

Get something on gh-pages now, and respond to GH issue.



## Fix separator/margin

Right now, separator implementation is not backwards compatible

My branches of the d3 repo:

* flextree - latest/greatest
* septest - branched off of master, write a new separation test


To do:

* Go back to master of d3, make a new fork, and then write a test for
  needed behavior of separator
* Merge that into my flextree branch
* Get the test working.



## Reorganize this repo

* gh-pages only
* Add my fork of the d3 repo as a submodule
* Write a script that does `make` on d3, then creates the flextree module
  from that. It should be a perl script that works on d3.js
* Demo page should be the new test page (see below)


## More tests

* Do some from the academic papers.




## New test page

* Controls for:
    * Sizing
        * size
        * fixed nodeSize
        * variable nodeSize
    * Library:
        * The real d3 on cdnjs. This will force switch to either
          constant nodeSize or size.
        * My fork of d3

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



