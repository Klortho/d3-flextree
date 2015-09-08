# To do

* [c] Draw the box based on node-size, not on the label.  This could avoid some
  confusion. Change the labels to be short and sweet.
    * [c] Move x_size and y_size to _. These should be set by the library, and
      then they can be used later by the calling app.
    * [c] parameterize some of the margins, and check all the code one more time.

* [c] What is the status of a node's x, y, x_size, and y_size for each of the sizing
  scenarios?
    - Scenario             x, y    x_size, y_size
    - fixed nodeSize:      yes          no
    - fixed svg size:      yes          no
    - nodeSize function:   yes          yes

    * The library does *not* add x_size and y_size on the node when nodeSize
      is a fixed array. (Breaks backwards compatibility)


* [c] Implement variable x-size
    * The separation function is defined to return the separation in units of
      nominal node x_size. When x_size is variable, there is no "nominal x_size",
      so we need to change the way it is defined.
    * The *default separation function* needs to be based on actual x_size's.
    * I can also change it at the same time to use actual x_size's all the time,
      and take out the scaling at the end.

* [c] Enhance the separation function to take a third argument, which the maximum 
  difference in depth between each of the nodes and the closest ancestor


## Reimplement it as a change to tree, in D3.

* Strategy:
    * Morph them both together, until there are no diffs.
    * Set my flextree index.html to render all of the presets at the same time,
      and make sure they never break.







## Next steps













* Make some blocks to show off the difference between tree and flextree:
    * [Collapsible Tree](http://bl.ocks.org/mbostock/4339083)
    * Use flare data






* Add some tests


* Propose this as a pull-request to 
  tree. If it's easy, also implement it as a plugin, named flextree.




# Other changes I've made

* Cleaned up the way size and nodeSize is handled.



# References

* [1] [Tidier Drawings of Trees](http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf).
  Reingold and Tilford, 1981



