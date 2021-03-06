// fast hashing library
const xxh = require('xxhashjs');
// Character custom class
const Character = require('./classes/Character.js');
// our physics calculation file
const physics = require('./physics.js');

// object of user characters
const characters = {};

// our socketio instance
let io;

// Possible directions a user can move
// their character. These are mapped
// to integers for fast/small storage
const directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7,
};

// function to notify everyone when a user has been hit
const handleShot = (userHash) => {
  io.sockets.in('room1').emit('shotHit', userHash);
};

const emitBalls = (ball) => {
    io.sockets.in('room1').emit('addBall', ball);
};

const handleHitBall = (dShot, ball) => {
    io.sockets.in('room1').emit('ballHit', dShot, ball);
};

// function to setup our socket server
const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1'); // join user to our socket room

    // create a unique id for the user based on the socket id and time
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // create a new character and store it by its unique id
    characters[hash] = new Character(hash);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    // emit a joined event to the user and send them their character
    socket.emit('joined', characters[hash]);

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      // update the user's info
      // NOTICE: THIS IS NOT VALIDED AND IS UNSAFE
      characters[socket.hash] = data;
      // update the timestamp of the last change for this character
      characters[socket.hash].lastUpdate = new Date().getTime();
      // update our physics simulation with the character's updates
      physics.setCharacter(characters[socket.hash]);

      // notify everyone of the user's updated movement
      io.sockets.in('room1').emit('updatedMovement', characters[socket.hash]);
    });
      
      socket.on('upShotPos', (data) => {
          const shot = data;
          physics.updateShot(shot);
      });
      
       socket.on('removeShot', (data) => {
          const shot = data;
          physics.removeShot(shot);
      });
      
      socket.on('updateBallPos', (data) => {
          physics.upBall(data);
      });
      
      socket.on('removeBall', (data) => {
          physics.removeBall(data);
      });

    // when this user sends an attack request
    socket.on('shot', (data) => {
      const shot = data;

      // should we handle the attack
      // I only did this because I did not code
      // for all player directions.
      let handleShotEvent = true;
        shot.y -= 2;
        shot.x += 6;
        
      // if handling the attack
      if (handleShotEvent) {
        // send the graphical update to everyone
        // This will NOT perform the collision or character death
        // This just updates graphics so people see the attack
        io.sockets.in('room1').emit('shotUpdate', shot);
        console.log('i shooted');
        // add the attack to our physics calculations
        physics.addShot(shot);
      }
    });

    // when the user disconnects
    socket.on('disconnect', () => {
      // let everyone know this user left
      io.sockets.in('room1').emit('left', characters[socket.hash]);
      // remove this user from our object
      delete characters[socket.hash];
      // update the character list in our physics calculations
      physics.setCharacterList(characters);

      // remove this user from the socket room
      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.handleShot = handleShot;
module.exports.emitBalls = emitBalls;
module.exports.handleHitBall = handleHitBall;
