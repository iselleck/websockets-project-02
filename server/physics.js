// our socket code for physics to send updates back
const sockets = require('./sockets.js');
const Ball = require('./classes/Ball.js');

let charList = {}; // list of characters
const shots = []; // array of shots to handle
const balls = [];

const ballDirections = [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1} 
];

const ballTypes = ['normal', 'bounce', 'wrap'];

// box collision check between two rectangles
// of a set width/height
const checkCollisions = (circ1, circ2, radius) => {
    const distX = (circ1.x + circ1.radius) - (circ2.x - circ2.radius);
    const distY = (circ1.y + circ1.radius) - (circ2.y - circ2.radius);
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    
    if (distance < circ1.radius + circ2.radius) {
        console.log('u\'s hit dawg');
    return true; // is colliding
  }
  return false; // is not colliding
};

// check attack collisions to see if colliding with the
// user themselves and return false so users cannot damage
// themselves
const checkShotCollision = (character, shotObj) => {
  const shoot = shotObj;

  // if attacking themselves, we won't check collision
  if (character.hash === shoot.hash) {
    return false;
  }

  // otherwise check collision of user rect and attack rect
  return checkCollisions(character, shoot, shoot.radius);
};

// handle each attack and calculate collisions
const checkShots = () => {
  // if we have attack
    //console.log(shots.length);
    
     let keys = Object.keys(charList);
    let characters = charList;
    
   // console.log(ballList.length);
    
  if (shots.length > 0) {
    // get all characters

    // for each attack
    for (let i = 0; i < shots.length; i++) {
      // for each character
      for (let k = 0; k < keys.length; k++) {
        const char1 = characters[keys[k]];
        console.log(char1.x);
        // call to see if the attack and character hit
        const hit = checkShotCollision(char1, shots[i]);

        if (hit) { // if a hit
          // ask sockets to notify users which character was hit
          sockets.handleShot(char1.hash);
          // kill that character and remove from our user list
          delete charList[char1.hash];
        } else {
          // if not a hit
         // console.log('miss');
        }
      }
      
        for(b = 0; b < balls.length; b++){
            const ball1 = balls[b];
           const hit = checkCollisions(ball1, shots[i], shots[i].radius);
        }
       
    }
  }
};

const addBall = () => {
  const createdAt = new Date();
  let directNum = Math.floor(Math.random() * (7 - 0));
  let typeNum = Math.floor(Math.random() * (3 - 0));
  const newBall = new Ball(createdAt.getTime());
  newBall.destX = ballDirections[directNum].x;
  newBall.destY = ballDirections[directNum].y;
  newBall.type = ballTypes[typeNum]; 
    
    switch(newBall.type) {
                case 'normal':
                    newBall.color = "#000";
                    break;
               case 'bounce':
                    newBall.color = "#00F";
                    newBall.canBounce = true;
                    break;
               case 'wrap':
                    newBall.color = "#0F0";
                    newBall.canWrap = true;
                    break;
               default:
                   newBall.color = "#000";
           }
    
 //balls[createdAt] = newBall;
    balls.push(newBall);
 sockets.emitBalls(newBall);
};

const updateShot = (shot) => {
    shots[shot.created] = shot; 
 //   console.log(shots.length);
};

const upBall = (ball) => {
    balls[ball.createdAt] = ball; 
  // console.log(balls.length);
};

const removeShot = (shot) => {
    shots.splice(shot, 1);
};

const removeBall = (ball) => {
  balls.splice(ball, 1);
  //  console.log(balls.length);
};

// update our entire character list
const setCharacterList = (characterList) => {
  charList = characterList;
};

// update an individual character
const setCharacter = (character) => {
  charList[character.hash] = character;
};

// add a new attack to calculate physics on
const addShot = (shot) => {
  shots.push(shot);
};

// check for collisions every 20ms
setInterval(() => {
  checkShots();
}, 20);

setInterval(() => {
  addBall();
    console.log(balls.length);
}, 5000);



module.exports.setCharacterList = setCharacterList;
module.exports.setCharacter = setCharacter;
module.exports.addShot = addShot;
module.exports.updateShot = updateShot;
module.exports.removeShot = removeShot;
module.exports.removeBall = removeBall;
module.exports.upBall = upBall;