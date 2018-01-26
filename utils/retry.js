/**
 * retry.js
 * 
 * It manages tracking of number of time certain operation has been done.
 * This will offload a need for user code to manage counting such retry count; which might be difficult.
 */

var config = require('../core/config.js');

var retry = {

  // initially start at 0
  count: 0,

  /**
   * Reset retry count.
   * It will reset retry count back to 0.
   */
  reset: function() {
    this.count = 0;
  },

  /**
   * Increment retry count.
   */
  increment: function() {
    this.count++;
  },

  /**
   * Decrement retry count.
   */
  decrement: function() {
    this.count--;
  },

  /**
   * Check if retry count exceeded the limit.
   * 
   * Return true if exceeded, otherwise return false.
   */
  isExceeded: function() {
    return this.count >= config.retryCount;
  }
};

module.exports = retry;