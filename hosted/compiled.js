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

  var keys = Object.keys(players);
  
    
  for (var i = 0; i < keys.length; i++) {
    
     
    var player = players[keys[i]];

    //if alpha less than 1, increase it by 0.01
      
       if(player.playable == true){
           player.alpha = 1;
       }

    if (player.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

//      player.x = player.destX;
//    player.y = player.destY;

    // if we are mid animation or moving in any direction
    if (player.frame > 0 || player.moveUp || player.moveDown || player.moveRight || player.moveLeft) {
      player.frameCount++;

      if (player.frameCount % 8 === 0) {
        if (player.frame < 7) {
          player.frame++;
        } else {
          player.frame = 0;
        }
      }
    }
      
                
                    if(player.x > canvas.width){
                       player.x = 0;
                   } else if (player.x < 0) {
                       player.x = canvas.width;
                   } else if (player.y > canvas.height) {
                       player.y = 0;
                   } else if (player.y < 0) {
                       player.y = canvas.height;
                   }
 
      ctx.save();
      ctx.globalAlpha = player.alpha;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, 2*Math.PI);
      ctx.fill();
      ctx.closePath();
      
      
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.px, player.py);
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

var players = {};
var balls = [];
var shots = [];

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var player = players[hash];

  // W OR UP
    if(player.playable){
  if (keyPressed === 87 || keyPressed === 38) {
    player.moveUp = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      player.moveLeft = true;
    }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          player.moveRight = true;
        }
    }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var player = players[hash];

  // W OR UP
    if(player.playable){
  if (keyPressed === 87 || keyPressed === 38) {
    player.moveUp = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      player.moveLeft = false;
    }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          player.moveRight = false;
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
  if (!players[data.hash]) {
    players[data.hash] = data;
    return;
  }

  if (data.hash === hash) {
    return;
  }

  if (players[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  var player = players[data.hash];

  player.prevX = data.prevX;
  player.prevY = data.prevY;
  player.x = data.x;
  player.y = data.y;
  player.destX = data.destX;
  player.destY = data.destY;
  player.direction = data.direction;
  player.moveLeft = data.moveLeft;
  player.moveRight = data.moveRight;
  player.moveDown = data.moveDown;
  player.moveUp = data.moveUp;
  player.alpha = 0;
  player.angle = data.angle;
  player.velY = data.velY;
  player.velX = data.velX;
  player.px = data.px;
  player.py = data.py;
  player.turnSpeed = data.turnSpeed;
  player.thrust = data.thrust;

};

var removeUser = function removeUser(data) {
  if (players[data.hash]) {
    delete players[data.hash];
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
  players[hash] = data;
  requestAnimationFrame(redraw);
};

var receiveShot = function receiveShot(data) {
  shots.push(data);
};

var reciveBall = function reciveBall(data) {
//  var createdAt = data.createdAt;
//  balls[createdAt] = data;  

    
    balls.push(data);
        
};

var sendShot = function sendShot() {
  var player = players[hash];
    var createdAt = new Date(); 
     var radians = player.angle/Math.PI*180;
    
  var shot = {
    hash: hash,
    x: player.x,
    y: player.y,
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
 var player = players[hash];
    player.alpha = 0;
    player.playable = false;
    player.x = Math.floor(Math.random() * (canvas.width - 0) + 1);
    player.y = Math.floor(Math.random() * (canvas.height - 0) + 1);
    
    setInterval(() => {
        canPlay(player);
    }, 5000);
};

var canPlay = function canPlay(player) {
    player.playable = true;
};

var updatePosition = function updatePosition() {
  var player = players[hash];
    
    
  // turn counter clockwise
    if(player.playable){
  if (player.moveLeft && player.destX > 0 && !player.moveRight) {
      player.angle += player.turnSpeed * -1;
  }
    
    // turn clockwise 
  if (player.moveRight && player.destX < 500 && !player.moveLeft) {
      player.angle += player.turnSpeed * 1;
  }
    
    var radians = player.angle/Math.PI*180;

     
      // add thrust if up arrow or w 
  if (player.moveUp){ 
      player.direction = directions.UP;
      player.velX += Math.cos(radians) * player.thrust;
      player.velY += Math.sin(radians) * player.thrust;
  }
    
    // line heading 
    player.px = player.x - player.pointLength * Math.cos(radians);
    player.py = player.y - player.pointLength * Math.sin(radians);
    
      //friction
      player.velX *= 0.98;
      player.velY *= 0.98;
    
      // apply velocity 
      player.x -= player.velX;
      player.y -= player.velY;
}
  

  socket.emit('movementUpdate', player);
};
