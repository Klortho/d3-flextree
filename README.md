# To do

* [c] Create a D3 plugin, change the name from tree to flextree
* [c] Update the tree-test.html example to use that
* [c] Make the tree-test.html example use *either* tree or flextree
* [c] Use nodeSize to configure it.
* [c] Looks like node size is different depending on the level.  What the heck?


* Figure out how node size configuration will work. Try to make it backwards
  compatible with nodeSize
    * size 
        - if two-element array, then used fixed node size, and rescale
          at the end (same as is done now)
        - if null, then use nodeSize
    * nodeSize
        - if two-element array, use that as fixed size
        - if it's a function, then call that
        - if null, then use size

* Add nodeSize config as a function.
    - 


* Changes I've made
    * Cleaned up the way size and nodeSize is handled.