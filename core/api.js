/**
 * api.js
 * 
 * It offers interfaces to work with low-level API of heatap-server.
 */

// API
require('/utils/promise-retry.js');
var constants = require('./apiConstants.js');
var config = require('./config.js');
var localstorage = require('/utils/localstorage.js');
var globalData = require('/utils/globalData.js');

// required: globalData (object from globalData.js)
// usually will be included as require('api.js')(getApp().globalData) as globalData should be set in app.js
module.exports = function () {
  // private functions not expose to public
  var _ = {
    degreesToRadians: function (deg) {
      return deg * (Math.PI / 180.0);
    },
    radiansToDegrees: function (rad) {
      return rad * (180.0 / Math.PI);
    },
    /**
     * Get token.
     * 
     * It needs to send code (result from wx.login), encryptedData and iv (result from wx.getUserInfo)
     * as required parameters.
     * 
     * Return promise object.
     *  - success will contain access token string
     */
    getToken: function (code, encryptedData, iv) {
      return _.request(config.endPoint + '/authorize', 'POST', false, { code: code, encryptedData: encryptedData, iv: iv });
    },
    request: function (url, method, needToken, data = null) {
      return new Promise(function (resolve, reject) {
        // create request object
        var reqObj = {
          url: url,
          method: method,
          dataType: 'json',
          success: function (res) {
            // check status code
            // protocol adheres to heatap-server

            // if it's invalidAccessToken then we need to newly acquire fresh token
            // this can be in a few reasons
            // - local cache is not updated to latest
            // - token is expired, it needs to be newly acquired
            if (res.data.status_code == constants.statusCode.invalidAccessToken) {
              console.log('[request] invalid access token')

              // we have un-sync user token
              // request it again now
              api.getToken()
                .then(function (res) {
                  api.persistTokenAndUserInfo(res.token, res.userInfo);
                  // make an original request again
                  _.request(url, method, needToken, data)
                    .then(function (res) {
                      return resolve(res);
                    })
                    .catch(function (e) {
                      return reject(e);
                    });
                })
                .catch(function (e) {
                  return reject(e);
                });
            }
            // other than that, it's error and allow upper layer call to handle 
            else if (res.data.status_code != constants.statusCode.success) {
              var msg = res.data;
              // create a new error messsage with set statusCode
              var error = new Error(msg.status_message);
              error.code = msg.status_code;
              // return a new error message
              return reject(error);
            }
            else {
              // return only data
              return resolve(res.data.response);
            }
          },
          fail: function (e) {
            return reject(e);
          }
        };

        // tag along a data it's not null
        if (data) {
          reqObj['data'] = data;
        }

        // supplement token as well if needed
        if (needToken) {
          // use globalData to get userToken
          var token = globalData.get(config.dataKey.userToken);

          if (token == null) {
            console.log('token is null');
            // make a request to acquire token
            api.getToken()
              .then(function (res) {
                api.persistTokenAndUserInfo(res.token, res.userInfo);
                // add custom header for token
                reqObj['header'] = {};
                reqObj['header'][constants.headerKey.userToken] = res.token;

                // make a request
                wx.request(reqObj);
              })
              .catch(function (e) {
                return reject(e);
              });
          }
          else {
            console.log('token is not null');
            // we're ready to make an API request
            // add custom header for token
            reqObj['header'] = {};
            reqObj['header'][constants.headerKey.userToken] = token;

            console.log(reqObj);
            // make a request
            wx.request(reqObj);
          }
        }
        else {
          // make a request right away, no need to acquire token for this request
          console.log(reqObj);
          wx.request(reqObj);
        }
      });
    }
  };

  var api = {

    /**
     * Update user info object.
     * @param  {Object} dataObj KVO of data to update for userInfo.
     * @return {Object}         Promise object
     */
    updateUserInfo: function (dataObj) {
      return _.request(config.endPoint + '/updateUserInfo', 'POST', true, dataObj);
    },

    /**
     * Make request to acquire access token.
     * 
     * Return promise object.
     *  - success object contains { token: (string) , userInfo (object) }
     */
    getToken: function () {
      var that = this;

      // we need to get login's code first (which is short-life and effective for only 5 minutes)
      // that's the reason we need to initiate a new request every time,
      // if we need to acquire a new token
      return new Promise(function (resolve, reject) {
        wx.login({
          success: function (loginRes) {
            // now we had code in 'res.code'
            // next we request userInfo
            wx.getUserInfo({
              withCredentials: true,
              success: function (userInfoRes) {
                // now we had encryptedData + iv; ready to make a request to /authorize
                _.getToken(loginRes.code, userInfoRes.encryptedData, userInfoRes.iv)
                  .then(function (res) {
                    // all done! phew~
                    console.log('all done', res);
                    // also piggy back data
                    return resolve({
                      token: res,
                      userInfo: userInfoRes
                    });
                  })
                  .catch(function (e) {
                    return reject(e);
                  });
              },
              fail: function (e) {
                return reject(e);
              }
            });
          },
          fail: function (e) {
            return reject(e);
          }
        });
      });
    },

    /**
     * Sync token and userInfo.
     * Should be called from the startup of the program, and that's it.
     * 
     * Return Promise object.
     */
    syncTokenAndUserInfo: function () {
      var that = this;
      var step = 1;

      return new Promise(function (resolve, reject) {
        // check access token exists on local storage
        // note: this is the only place that we use localstorage to access user's token
        // later on access it via globalData to reduce time needed to wait to access IO
        localstorage.get(config.dataKey.userToken)
          .then(function (res) {
            console.log('user had token: ', res);
            // make sure to set to globalData
            // thhis can happen as application shutdowns but localstorage still around for subsequent startup
            globalData.set(config.dataKey.userToken, res);

            // progress to step 2
            step = 2;
            return localstorage.get(config.dataKey.userInfo);
          })
          .then(function (res) {
            console.log('user had userInfo: ', res);
            console.log('all done');
            // make sure to set to globalData
            globalData.set(config.dataKey.userInfo, res);

            return resolve();
          })
          .catch(function (res) {
            console.log(`caught error at step ${step}`, res);
            // -- check step to handle that error --
            // there's no userToken, or userInfo
            // start it all over for simplicity
            if (step == 1 || step == 2) {
              console.log('try to acquire token');
              return Promise.retry(3, api.getToken, 3000);
            }
            else {
              // should not happen
              console.log("something bad happens");
              return reject(res);
            }
          })
          .then(function (res) {
            if (res != null) {
              that.persistTokenAndUserInfo(res.token, res.userInfo);
              return resolve();
            }
          })
          .catch(function (res) {
            return reject(res);
          });
      });
    },

    /**
     * Sync token and UserInfo.
     * This will in turn sync to localstorage as well.
     */
    persistTokenAndUserInfo: function (token, userInfo) {
      // save to glboal data
      globalData.set(config.dataKey.userToken, token);
      globalData.set(config.dataKey.userInfo, userInfo);
      // save to local storage
      localstorage.set(config.dataKey.userToken, token);
      localstorage.set(config.dataKey.userInfo, userInfo);
    }
  };

  return api;
}();