'use strict';

function CanvasUtil(id, ownerObj) {
  this.ctx = wx.createCanvasContext(id, ownerObj)
}

CanvasUtil.prototype.isAvailable = function() {
  return this.ctx != null ? true : false
}

CanvasUtil.prototype.drawRect = function(x, y, width, height) {
  this.ctx.rect(x,y,width,height)
  this.ctx.setFillStyle('red')
  this.ctx.fill()
}

CanvasUtil.prototype.flush = function() {
  this.ctx.draw()
}

module.exports = CanvasUtil;