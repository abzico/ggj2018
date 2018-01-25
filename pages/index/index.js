//index.js
//获取应用实例
const app = getApp()
const CanvasUtil = require('../../utils/canvasUtil.js');

var rectPos = {
  x: 0,
  y: 0
}
var rectSize = 10;
var cutil = null;

Page({
  data: {
    canvasSize: {
      width: 0,
      height: 0
    },
  },
  // all stuff to draw should be in here
  triggerRender: function() {
    cutil.drawRect(rectPos.x, rectPos.y, rectSize, rectSize)
    cutil.flush()
  },
  onLoad: function () {
    var res = wx.getSystemInfoSync()

    this.data.canvasSize.width = res.windowWidth
    this.data.canvasSize.height = res.windowHeight
    this.setData(this.data);
  },
  onReady: function() {
    cutil = new CanvasUtil('myCanvas', this)
    console.log(cutil.isAvailable())

    // set position to rect
    rectPos.x = this.data.canvasSize.width - rectSize;
    rectPos.y = 0;

    // test websocket
    console.log("Connecting websocket");
    wx.connectSocket({
      url: "wss://apps.abzi.co/ggj2018/",
      success: function() {
        console.log('connected successfully');
      }
    })
    // listen to open event
    wx.onSocketOpen(function(res) {
      console.log('websocket opened');

      wx.sendSocketMessage({
        data: "Hello world"
      })
    });
    // listen to messag event
    wx.onSocketMessage(function(res) {
      console.log('received: ' + res.data);
    });
    // liten to close event
    wx.onSocketClose(function(res) {
      console.log('socket closed');
    });

    // trigger render initially
    this.triggerRender();
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
