/**
 * globalData manages global data of the app.
 * 
 * It provides interface to get/set global data that is accessible throughout the lifetime of application via memory. If you need persistent data, use wx's storage api.
 */

var globalData = {
  data: {},   // initially empty

  /**
   * Set global data according to input key and value.
   * Key is string.
   * Value can be either string or object.
   * 
   * This will overwrites the previous value if it previously exists.
   */
  set: function(key, value) {
    this.data[key] = value;
  },

  /**
   * Get value of global data from input key.
   * 
   * Return value can be null if such key doesn't exist.
   */
  get: function(key) {
    return this.data[key];
  },

  /**
   * Clear all data by setting all value to null.
   */
  clear: function() {
    var keys = Object.keys(this.data);

    for (var i=0; i<keys.length; i++) {
      this.data[keys[i]] = null;
    }
  }
}

module.exports = globalData;