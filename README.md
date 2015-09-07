# To do

* [c] Create a D3 plugin, change the name from tree to flextree
* [c] Update the tree-test.html example to use that
* [c] Make the tree-test.html example use *either* tree or flextree
* [c] Use nodeSize to configure it.
* [c] Looks like node size is different depending on the level.  What the heck?

## Strategy: simplest thing that could possibly work

* First, don't implement anything having to do with diagonals (links).
* Don't worry about separation at all
* Don't do variable x-size.







* Later embellishments

    * Make the node size such that it depends on level:
        * Root: node size from left edge to the right edge of the box
        * All others: node size from the right edge of the previous level,
          including the space for the links, to the left edge of this box
        * Then the diagonal generator will have to change:
            * source always starts at the very end of the node virtual node
              box (which is now the same as the visible node box)
            * target y should include the horizontal space allowed for the
              diagonal.



# Setting the node size

You can pass in nodeSize as a function that returns a two-element array.





# Other changes I've made

* Cleaned up the way size and nodeSize is handled.


