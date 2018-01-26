//index.js
//获取应用实例
const app = getApp()
const config = require('../../core/config.js');
const CanvasUtil = require('../../utils/canvasUtil.js');
var mainCall = require('../../utils/promise-syncloop.js');
const api = require('../../core/api.js');
const globalData = require('../../utils/globalData.js');
const userpref = require('../../user/userpref.js');

var rectPos = {
  x: 0,
  y: 0
}
var rectSize = 10;
var cutil = null;

Page({
  data: {
    canvasSize: {
      width: app.globalData.systemInfo.windowWidth,
      height: app.globalData.systemInfo.windowHeight * 0.60
    },
  },
  // all stuff to draw should be in here
  triggerRender: function() {
    cutil.drawRect(rectPos.x, rectPos.y, rectSize, rectSize)
    cutil.flush()
  },
  onLoad: function () {
    console.log(app.globalData.systemInfo);
  },
  onReady: function() {
    cutil = new CanvasUtil('myCanvas', this)
    console.log(cutil.isAvailable())

    // set position to rect
    rectPos.x = this.data.canvasSize.width - rectSize;
    rectPos.y = 0;

    // setup websocket
    this.setupWebsocket();
    // trigger render initially
    this.triggerRender();

    // test flow
    var that = this;
    this.askToAuthorizeNecessaryScopes()
      .then(() => {
        console.log('user allowed all permissions');

        // try to get access token
        api.syncTokenAndUserInfo()
          .then(function() {
            // update user info (if not yet)
            that.updateUserInfoToServerIfNeeded();
          })
          .catch(function(err) {
            console.log(err);
          });

      }, () => {
        console.log('error from asking permissions from user.');
      })
  },
  setupWebsocket: function() {
    // test websocket
    console.log("Connecting websocket");
    wx.connectSocket({
      url: config.endPointWS,
      success: function () {
        console.log('connected successfully');
      }
    })
    // listen to open event
    wx.onSocketOpen(function (res) {
      console.log('websocket opened');

      wx.sendSocketMessage({
        data: "Hello world"
      })
    });
    // listen to messag event
    wx.onSocketMessage(function (res) {
      console.log('received: ' + res.data);
    });
    // liten to close event
    wx.onSocketClose(function (res) {
      console.log('socket closed');
    });
  },
  onTouchendCanvas: function(e) {
    if (e.changedTouches.length > 0) {
      var touch = e.changedTouches[0];
      if (touch.x < this.data.canvasSize.width/2) {
        rectPos.x -= rectSize;
        console.log('go left');
        this.triggerRender();
      }
      else {
        rectPos.x += rectSize;
        console.log('go right');
        this.triggerRender();
      }
    }
  },

  // return Promise object
  // only resolve, resolve when finish
  askToAuthorizeNecessaryScopes: function() {

    return new Promise((resolve, reject) => {
      // get the app settings, to ask to authorize for not-enabled ones
      wx.getSetting({
        success: function(res) {

          // form scope array to work with
          // var scopes = [
          //   {
          //     name: 'scope.userInfo',
          //     value: res.authSetting['scope.userInfo']
          //   },
          //   {
          //     name: 'scope.userLocation',
          //     value: res.authSetting['scope.userLocation']
          //   }
          // ];
          // possibly we don't need location from user
          // anyway keep the code above for later
          var scopes = [
              {
                name: 'scope.userInfo',
                value: res.authSetting['scope.userInfo']
              }
          ];

          // define worker function
          // param 1 : array of scope string with its value
          var workerFn = function(i, ...args) {
            // get param 1
            // actually can get from outer scope, but this is better
            // if we move this function definition to elsewhere
            var scopes = args[0];

            return new Promise((_resolve, _reject) => {
              // if such permission is not authorized yet
              // then we ask for it
              if (!scopes[i].value) {
                wx.authorize({
                  scope: scopes[i].name,
                  success: function() {
                    _resolve();  // resolve this task
                  },
                  fail: function(err) {
                    _reject(); // reject this task
                  }
                });
              }
              // already authorized then resolve it
              else {
                _resolve();  // resolve this task
              }
            });
          };

          // start a synchrnoized promise-loop asking to authorize for all scopes
          // user can still not permit any of them
          mainCall(scopes.length, workerFn, scopes)
            .then(() => {
              console.log('finish asking to authorize for all needed scopes');
              resolve();  // resolve upper-level
            })
            .catch((err) => {
              // show error here
              console.log('Error occurs at promise-loop of authorizing permission', err);
              reject(); // reject upper-level
            });
        },
        fail: function(err) {
          console.log('Error occurs trying to getSetting()', err);
          reject(err);  // reject upper-level
        }
      });
    });
  },

  updateUserInfoToServerIfNeeded: function() {
    // update user info (if not yet)
    var updateTimestamp = globalData.get(config.dataKey.updateUserInfoTimestampToServer);
    // if it's not update yet
    // or it exceeds expire time
    if (updateTimestamp == null ||
       (updateTimestamp != null && 
        ((Date.now() - updateTimestamp) >= config.userInfoUpdateExpiredDuration))) {
      var userInfo = globalData.get(config.dataKey.userInfo).userInfo;
      var toUpdateUserInfo = {
        city: userInfo.city,
        country: userInfo.country,
        gender: userInfo.gender,
        language: userInfo.language,
        nickName: userInfo.nickName,
        province: userInfo.province
      };

      Promise.retry(3, api.updateUserInfo, 3000, toUpdateUserInfo)
        .then(function (res) {
          console.log('updateUserInfo success');
          // get timestamp now
          // timestamp is managed in client side
          var updateTimestamp = Date.now();
          // mark as updated
          globalData.set(config.dataKey.updateUserInfoTimestampToServer, updateTimestamp);
          userpref.saveToDiskForUpdateUserInfoTimestampToServer(updateTimestamp);
        })
        .catch(function (e) {
          console.log('Error api updateUserInfo ', e);
        });
    }
  },
})
