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


var redraw = function redraw(time) {
  updatePosition();

  ctx.clearRect(0, 0, 800, 800);

  var keys = Object.keys(squares);
  
    
  for (var i = 0; i < keys.length; i++) {
    
     
    var square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
      console.log(square.playable);
       if(square.playable == true){
           square.alpha = 1;
       }

    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

//      square.x = square.destX;
//    square.y = square.destY;

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
      
                
                    if(square.x > canvas.width){
                       square.x = 0;
                   } else if (square.x < 0) {
                       square.x = canvas.width;
                   } else if (square.y > canvas.height) {
                       square.y = 0;
                   } else if (square.y < 0) {
                       square.y = canvas.height;
                   }
 
      ctx.save();
      ctx.globalAlpha = square.alpha;
      ctx.beginPath();
      ctx.arc(square.x, square.y, square.radius, 0, 2*Math.PI);
      ctx.fill();
      ctx.closePath();
      
      
      ctx.beginPath();
      ctx.moveTo(square.x, square.y);
      ctx.lineTo(square.px, square.py);
      ctx.lineWidth = 20; 
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
  }
    if(balls.length > 0){
    for(var b = 0; b < balls.length; b++){
        var ball = balls[b];
        
        ball.x += ball.destX * ball.speed;
        ball.y += ball.destY * ball.speed;
        ball.index = b;
    
      ctx.save();   
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();
      ctx.restore();    
        
        if(ball.x > canvas.width || ball.x < 0 || ball.y > canvas.height || ball.y < 0){
           switch(ball.type) {
                case 'normal':
                    socket.emit('removeBall', b);
                    balls.splice(b, 1);
                   b--;
                    break;
               case 'bounce':
                   if(ball.canBounce){
                    ball.destX = -ball.destX;
                    ball.destY = -ball.destY;
                       ball.canBounce = false;
                       } else {
                       socket.emit('removeBall', b);
                    balls.splice(b, 1);
                       }
                    b--;
                    break;
               case 'wrap':
                   if(ball.canWrap){ 
                    if(ball.x > canvas.width){
                       ball.x = 0;
                       ball.canWrap = false;
                   } else if (ball.x < 0) {
                       ball.x = canvas.width;
                       ball.canWrap = false;
                   } else if (ball.y > canvas.height) {
                       ball.y = 0;
                       ball.canWrap = false;
                   } else if (ball.y < 0) {
                       ball.y = canvas.height;
                       ball.canWrap = false;
                   }
                   } else {
                        socket.emit('removeBall', b);
                    balls.splice(b, 1);
                   }
                    b--;
                    break;
               default:
                  socket.emit('removeBall', b);
                    balls.splice(b, 1);
                    b--;
           }
        }
        
          socket.emit('updateBallPos', ball);
    }
    }
    
    

  for (var _i = 0; _i < shots.length; _i++) {
    var shot = shots[_i];
      
      shot.index = _i;
      
      shot.x -=  Math.cos(shot.radian) * shot.speed;
      shot.y -=  Math.sin(shot.radian) * shot.speed;
      
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, 2*Math.PI);
      ctx.fill();
      ctx.closePath();
      

    shot.frames++;
      
      socket.emit('upShotPos', shot);
      
      
     if(shot.x > canvas.width || shot.x < 0 || shot.y > canvas.height || shot.y < 0){
         socket.emit('removeShot', _i);
         shots.splice(_i, 1);
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
var balls = [];
var shots = [];

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
    if(square.playable){
  if (keyPressed === 87 || keyPressed === 38) {
    square.moveUp = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = true;
    }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          square.moveRight = true;
        }
    }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
    if(square.playable){
  if (keyPressed === 87 || keyPressed === 38) {
    square.moveUp = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = false;
    }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          square.moveRight = false;
        } else if (keyPressed === 32) {
          sendShot();
        } 
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
  socket.on('shotHit', playerDeath);
  socket.on('shotUpdate', receiveShot);
  socket.on('left', removeUser);
  socket.on('addBall', reciveBall);
  socket.on('ballHit', handleBall);

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
  square.x = data.x;
  square.y = data.y;
  square.destX = data.destX;
  square.destY = data.destY;
  square.direction = data.direction;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.moveDown = data.moveDown;
  square.moveUp = data.moveUp;
  square.alpha = 0;
  square.angle = data.angle;
  square.velY = data.velY;
  square.velX = data.velX;
  square.px = data.px;
  square.py = data.py;
  square.turnSpeed = data.turnSpeed;
  square.thrust = data.thrust;

};

var removeUser = function removeUser(data) {
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

var handleBall = function handleBall(dShot, ball){
    shots.splice(dShot, 1);
    
    balls[ball].destX = -balls[ball].destX;
    balls[ball].speed += 1;
    socket.emit('updateBallPos', balls[ball]);
};

var setUser = function setUser(data) {
  hash = data.hash;
  squares[hash] = data;
  requestAnimationFrame(redraw);
};

var receiveShot = function receiveShot(data) {
  shots.push(data);
};

var reciveBall = function reciveBall(data) {
//  var createdAt = data.createdAt;
//  balls[createdAt] = data;  

    
    balls.push(data);
        console.log(balls.length);
};

var sendShot = function sendShot() {
  var square = squares[hash];
    var createdAt = new Date(); 
     var radians = square.angle/Math.PI*180;
    
  var shot = {
    hash: hash,
    x: square.x,
    y: square.y,
    radian: radians,
    radius: 8,
    speed: 5,
    created: createdAt.getTime(),
    frames: 0,
    index: 0
  };

  socket.emit('shot', shot);
};

var playerDeath = function playerDeath(data) {
 var square = squares[hash];
    square.alpha = 0;
    square.playable = false;
    square.x = Math.floor(Math.random() * (canvas.width - 0) + 1);
    square.y = Math.floor(Math.random() * (canvas.height - 0) + 1);
    
    setInterval(() => {
        canPlay(square);
    }, 5000);
};

var canPlay = function canPlay(player) {
    player.playable = true;
};

var updatePosition = function updatePosition() {
  var square = squares[hash];
    
    
  // turn counter clockwise
    if(square.playable){
  if (square.moveLeft && square.destX > 0 && !square.moveRight) {
      square.angle += square.turnSpeed * -1;
  }
    
    // turn clockwise 
  if (square.moveRight && square.destX < 500 && !square.moveLeft) {
      square.angle += square.turnSpeed * 1;
  }
    
    var radians = square.angle/Math.PI*180;
  //  console.log(radians);
     
      // add thrust if up arrow or w 
  if (square.moveUp){ 
      square.direction = directions.UP;
      square.velX += Math.cos(radians) * square.thrust;
      square.velY += Math.sin(radians) * square.thrust;
  }
    
    // line heading 
    square.px = square.x - square.pointLength * Math.cos(radians);
    square.py = square.y - square.pointLength * Math.sin(radians);
    
  //  console.log('Pos X: ' + square.x + ' Pos Y: ' + square.y + ' Angle: ' + angle);
      //friction
      square.velX *= 0.98;
      square.velY *= 0.98;
    
      // apply velocity 
      square.x -= square.velX;
      square.y -= square.velY;
}
  

  socket.emit('movementUpdate', square);
};
