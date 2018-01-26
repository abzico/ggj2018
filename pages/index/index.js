//index.js
//获取应用实例
const app = getApp()
const config = require('../../core/config.js');
const CanvasUtil = require('../../utils/canvasUtil.js');
var mainCall = require('../../utils/promise-syncloop.js');
const api = require('../../core/api.js');
const globalData = require('../../utils/globalData.js');
const userpref = require('../../user/userpref.js');
// (note: this is how to import es6 with require)
const Tilemap = new require('../../tilemap/tilemap.js').default;
var tilemap = null;

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
      height: app.globalData.systemInfo.windowWidth
    },
    ui_height: app.globalData.systemInfo.windowHeight - app.globalData.systemInfo.windowWidth
  },

  // all stuff to draw should be in here
  triggerRender: function() {
    tilemap.drawToCanvas(cutil.ctx);
    cutil.flush();
  },

  onLoad: function () {
    cutil = new CanvasUtil('myCanvas', this)

    // create tilemap
    tilemap = new Tilemap(10,10,20,20);
    tilemap.bgColor = '#b7d2ff';

    // scale tilemap
    tilemap.scale(this.data.canvasSize.width, this.data.canvasSize.height);
  },

  onReady: function() {
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
