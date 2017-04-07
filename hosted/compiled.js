"use strict";

var directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7
};

var spriteSizes = {
  WIDTH: 61,
  HEIGHT: 121
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {
  updatePosition();

  ctx.clearRect(0, 0, 500, 500);

  var keys = Object.keys(squares);

  for (var i = 0; i < keys.length; i++) {

    var square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if (square.alpha < 1) square.alpha += 0.05;

    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

      square.x = square.destX;
    square.y = square.destY;

    // if we are mid animation or moving in any direction
    if (square.frame > 0 || square.moveUp || square.moveDown || square.moveRight || square.moveLeft) {
      square.frameCount++;

      if (square.frameCount % 8 === 0) {
        if (square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }
      
      ctx.beginPath();
      ctx.arc(square.x, square.y, square.width, 0, 2*Math.PI);
      ctx.fill();
      ctx.closePath();
  }

  for (var _i = 0; _i < attacks.length; _i++) {
    var attack = attacks[_i];

    ctx.drawImage(slashImage, attack.x, attack.y, attack.width, attack.height);

    attack.frames++;

    if (attack.frames > 30) {
      attacks.splice(_i);
      _i--;
    }
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
//var walkImage = void 0;
var slashImage = void 0;
//our websocket connection
var socket = void 0;
var hash = void 0;
var animationFrame = void 0;
 var angle = 3 * Math.PI / 180;

var squares = {};
var attacks = [];

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    square.moveUp = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = true;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        square.moveDown = true;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          square.moveRight = true;
        }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    square.moveUp = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        square.moveDown = false;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          square.moveRight = false;
        } else if (keyPressed === 32) {
          sendAttack();
        }
};

var init = function init() {
 // walkImage = document.querySelector('#walk');
  slashImage = document.querySelector('#slash');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  socket.on('attackHit', playerDeath);
  socket.on('attackUpdate', receiveAttack);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
'use strict';

var update = function update(data) {
  if (!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  if (data.hash === hash) {
    return;
  }

  if (squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  var square = squares[data.hash];
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.direction = data.direction;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.moveDown = data.moveDown;
  square.moveUp = data.moveUp;
  square.alpha = 0.05;
};

var removeUser = function removeUser(data) {
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

var setUser = function setUser(data) {
  hash = data.hash;
  squares[hash] = data;
  requestAnimationFrame(redraw);
};

var receiveAttack = function receiveAttack(data) {
  attacks.push(data);
};

var sendAttack = function sendAttack() {
  var square = squares[hash];

  var attack = {
    hash: hash,
    x: square.x,
    y: square.y,
    direction: square.direction,
    frames: 0
  };

  socket.emit('attack', attack);
};

var playerDeath = function playerDeath(data) {
  delete squares[data];

  if (data === hash) {
    socket.disconnect();
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.fillText('You died', 50, 100);
  }
};

var updatePosition = function updatePosition() {
  var square = squares[hash];
    
  square.prevX = square.x;
  square.prevY = square.y;

  // move counter clockwise
  if (square.moveLeft && square.destX > 0 && !square.moveRight) {
     square.destX -= 8*Math.cos(angle);
      square.destY -= 8*Math.sin(angle);
      angle -= 3 * Math.PI / 180;
  }
    // move clockwise 
  if (square.moveRight && square.destX < 500 && !square.moveLeft) {
     square.destX += 8*Math.cos(angle);
      square.destY += 8*Math.sin(angle);
      angle += 3 * Math.PI / 180;
  }
    

  square.alpha = 0.05;

  socket.emit('movementUpdate', square);
};
