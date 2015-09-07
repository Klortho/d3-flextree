# To do

* [c] Create a D3 plugin, change the name from tree to flextree
* [c] Update the tree-test.html example to use that
* [c] Make the tree-test.html example use *either* tree or flextree
* [c] Use nodeSize to configure it.
* [c] Looks like node size is different depending on the level.  What the heck?


* Change the name of the repo.




* Implement controls on the test page




* Can I make it 100% backward-compatible? If so, the propose it as a pull-request to tree.
  Otherwise, implement it as a plugin.









* Later embellishments

    * Implement variable x-size

    * How to do separation?  I think a function that takes the max diff of the
          depth of the first common ancestor


# Setting the node size

You can pass in nodeSize as a function that returns a two-element array.





# Other changes I've made

* Cleaned up the way size and nodeSize is handled.


