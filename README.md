# To do

* Draw the box based on node-size, not on the label.  This could avoid some
  confusion. Change the labels to be short and sweet.
    * [c] Move x_size and y_size to _. These should be set by the library, and
      then they can be used later by the calling app.
    * parameterize some of the margins, and check all the code one more time.

* Implement variable x-size

* Enhance the separation function to take a third argument, which is either
  the closest ancestor, or else just a number which is the maximum difference
  in depth between each of the nodes and the closest ancestor

* Propose this as a pull-request to 
  tree. If it's easy, also implement it as a plugin, named flextree.




# Other changes I've made

* Cleaned up the way size and nodeSize is handled.


