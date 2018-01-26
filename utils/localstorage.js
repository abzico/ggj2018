/**
 * localstorage.js
 * 
 * It offers API to save data or get data from local storage.
 * It wraps ontop of WeChat's storage API with also offered promise-retry. For synchronized version of operation, it will not wrap anymore with Promise but operates just that.
 */

require('./promise-retry.js');

var localstorage = {
  /**
   * Set data to local storage for key.
   * Key can be string or object.
   * 
   * Return promise object.
   */
  set: function(key, data) {
    return new Promise(function (resolve, reject) {
      wx.setStorage({
        key: key,
        data: data,
        success: function (res) {
          return resolve(res);
        },
        fail: function (e) {
          return reject(e);
        }
      });
    });
  },

  /**
   * Set data to local storage for key synchronizely.
   * Key can be string or object.
   *
   * If there error occurs, this function will catch it and throw it.
   */
  setSync: function(key, data) {
    try {
      wx.setStorageSync(key, data);
    }
    catch(e) {
      throw e;
    }
  },

  /**
   * Get data from local storage from key.
   * 
   * Return promise object.
   */
  get: function(key) {
    return new Promise(function (resolve, reject) {
      wx.getStorage({
        key: key,
        success: function (res) {
          // get back result in 'data' property
          return resolve(res.data);
        },
        fail: function (e) {
          // data is empty
          return reject(e);
        }
      });
    });
  },

  /**
   * Get data from local storage from key synchronizedly.
   *
   * If there error occurs, this function will catch it and return null.
   *
   * Return value from key.
   */
  getSync: function(key) {
    try {
      return wx.getStorageSync(key);
    }
    catch(e) {
      return null;
    }
  },

  /**
   * Clean up storage.
   */
  clear: function() {
    wx.clearStorage();
  },

  /**
   * Clean up storage synchronizedly.
   */
  clearSync: function() {
    wx.clearStorageSync();
  },

  /**
   * Remove storage from specified key.
   * 
   * Return promise object.
   */
  remove: function(key) {
    return new Promise(function(resolve, reject) {
      wx.removeStorage({
        key: key,
        success: function(res) {
          return resolve(res);
        },
        fail: function(e) {
          return reject(e);
        }
      })
    });
  },

  /**
   * Remove storage from specified key synchronizedly.
   *
   * If there's error, then it will throw it.
   */
  removeStorageSync: function(key) {
    try {
      wx.removeStorageSync(key);
    }
    catch(e) {
      throw e;
    }
  }
};

module.exports = localstorage;
