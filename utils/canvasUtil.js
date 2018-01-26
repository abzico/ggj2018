'use strict';

function CanvasUtil(id, ownerObj) {
  this.ctx = wx.createCanvasContext(id, ownerObj)
  // immediately save its current context right now
  // so every day later can restore back
  this.ctx.save();
}

CanvasUtil.prototype.isAvailable = function() {
  return this.ctx != null ? true : false
}

CanvasUtil.prototype.drawRect = function(x, y, width, height) {
  this.ctx.rect(x,y,width,height)
  this.ctx.setFillStyle('red')
  this.ctx.fill()
  this.ctx.restore();
}

CanvasUtil.prototype.flush = function() {
  this.ctx.draw();
}

module.exports = CanvasUtil;