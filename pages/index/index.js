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
  }
})
