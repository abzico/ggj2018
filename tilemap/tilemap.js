import Tile from './tile'

const kMetaExistenceName = "__meta_existence"

export default class Tilemap {
  constructor(tilemapBlockWidth, tilemapBlockHeight, tileWidth, tileHeight) {
    this.tilemapBlockWidth= tilemapBlockWidth
    this.tilemapBlockHeight = tilemapBlockHeight
    this.tileWidth = tileWidth
    this.tileHeight = tileHeight
    this._tiles = []
    this.bgColor = '#ffffff'
    this.x = 0
    this.y = 0

    this.visible = true

    this._constructTilemapsFromTiles()
  }

  set x(val) {
    if (this._tiles.length > 0) {
      // update all tiles
      for (var j=0; j<this.tilemapBlockHeight; j++) {
        for (var i=0; i<this.tilemapBlockWidth; i++) {
          var tile = this._tiles[j * this.tilemapBlockWidth + i];
          tile.x = val + i*this.tileWidth;
        }
      }
    }
  }

  set y(val) {
    if (this._tiles.length > 0) {
      // update all tiles
      for (var j=0; j<this.tilemapBlockHeight; j++) {
        for (var i=0; i<this.tilemapBlockWidth; i++) {
          var tile = this._tiles[j * this.tilemapBlockWidth + i];
          tile.y = val + i*this.tilemapBlockHeight;
        }
      }
    }
  }

  set bgColor(color) {
    // update all tiles
    this._tiles.forEach((tile) => {
      tile.color = color
    })
  }

  _constructTilemapsFromTiles() {
    for (var j=0; j<this.tilemapBlockHeight; j++) {
      for (var i=0; i<this.tilemapBlockWidth; i++) {

        // create a new tile from properties of tilemap as a who`le
        var tile = new Tile(
          this.tileWidth, 
          this.tileHeight, 
          i*this.tileWidth, 
          j*this.tileHeight, 
          this.bgColor)
        this._tiles.push(tile)
      }
    }
  }

  drawAllTiles(ctx) {
    this._tiles.forEach((tile) => {
      tile.drawToCanvas(ctx)
    })
  }

  drawToCanvas(ctx) {
    if (!this.visible)
      return
    
    this.drawAllTiles(ctx)
  }

  /**
   * Convert from index-based location of tile-map to local position of Tilemap
   * 
   * (0,0) is at the top-left most
   * (N,N) is at the bottom-right most
   * @param {Number} x Tilemap's location at x (index-based)
   * @param {Number} y Tilemap's location at y (index-based)
   * @returns {Object} Return {posX, posY} which each element is the converted local position.
   */
  getLocalPosFromTileLocation(x, y) {
    return {
      posX: x * this.tileWidth,
      posY: y * this.tileHeight
    }
  }

  /**
   * Convert from local position of Tilemap to index-based location of tile-map
   * @param {Number} posX Local position x to convert
   * @param {Number} posY Local position y to convert
   * @returns {Object} Return {x, y} whose each element is index-based tilemap location
   */
  getTileLocationFromLocalPos(posX, posY) {
    return {
      x: Math.ceil(posX / this.tileWidth),
      y: Math.ceil(posY / this.tileHeight)
    }
  }

  /**
   * Scale tilemap to target width, and height.
   * @param {number} width Target width to scale tilemap to
   * @param {number} height Target height to scale tilemap to
   */
  scale(targetWidth, targetHeight) {

    var tilemapWidth = this.tilemapBlockWidth * this.tileWidth;
    var tilemapHeight = this.tilemapBlockHeight * this.tileHeight;

    var factor;

    // scale from width-side
    if (tilemapWidth <= tilemapHeight) {
      if (targetWidth <= targetHeight) {
        factor = targetWidth / tilemapWidth * 1.0;
      }
      else {
        factor = targetHeight / tilemapHeight * 1.0;
      }
    }
    // scale from height-side
    else {
      if (targetWidth <= targetHeight) {
        factor = targetWidth / tilemapWidth * 1.0;
      }
      else {
        factor = targetHeight / tilemapHeight * 1.0;
      }
    }

    // update tilemap's tile size
    this.tileWidth *= factor;
    this.tileHeight *= factor;

    // loop through all of tiles and scale each one
    for (var j=0; j<this.tilemapBlockHeight; j++) {
      for (var i=0; i<this.tilemapBlockWidth; i++) {

        // get tile
        var tile = this._tiles[j * this.tilemapBlockWidth + i];
        // modify its width, and height (thus mean scale it)
        tile.width *= factor;
        tile.height *= factor;
        // modify its position x,y
        tile.x = i * this.tileWidth;
        tile.y = j * this.tileHeight;
      }
    }
  }
}