# To do

* [c] Where is test1_1?
* [c] Can I resize / scale / transform the drawing after it is drawn?

* Implement form-from-config



* Fix the problem with test3_1: algorithm is not right!!


* Implement controls on the test page
    * [c] Add a control for preset.




* [c] Implement different drawing size schemes
    * Options:
          * Fixed svg size: use `size`: [500, 500]
          * fixed size, small nodes (25 X 70)
          * fixed size, big nodes (25 X 200)
          * nodeSize as a function
* [c] Put node sizes into the data, instead of using text size.


* Get rid of the node-list function -- there are other ways to do this.


* Can I make it 100% backward-compatible? If so, the propose it as a pull-request to tree.
  Otherwise, implement it as a plugin, named flextree.












* Later embellishments

    * Implement variable x-size

    * How to do separation?  I think a function that takes the max diff of the
          depth of the first common ancestor


# Setting the node size

You can pass in nodeSize as a function that returns a two-element array.





# Other changes I've made

* Cleaned up the way size and nodeSize is handled.


