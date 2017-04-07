// Character class
class Character {
  constructor(hash) {
    this.hash = hash; // character's unique id
    // last time this character was updated
    this.lastUpdate = new Date().getTime();
    this.x = 250; // x location of character on screen
    this.y = 100; // y location of character on screen
    this.prevX = this.x; // last known x location of character
    this.prevY = this.y; // last known y location of character
    this.destX = this.x; // destination x location of character
    this.destY = this.y; // destination y location of character
    this.height = 100; // height of character
    this.width = 20; // width of character
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
    this.direction = 0; // direction character is facing
    this.frame = 0; // frame in animation character is on
    this.frameCount = 0; // how many frames since last draw
    this.moveLeft = false; // if character is moving left
    this.moveRight = false; // if character is moving right
    this.moveDown = false; // if character is moving down
    this.moveUp = false; // if character is moving up
  }
}

module.exports = Character;
