// our socket code for physics to send updates back
const sockets = require('./sockets.js');
const Ball = require('./classes/Ball.js');

let charList = {}; // list of characters
const shots = []; // array of shots to handle
const balls = [];

const ballDirections = [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1} 
];

// box collision check between two rectangles
// of a set width/height
const checkCollisions = (circ1, circ2, radius) => {
    const distX = circ1.x - circ2.x;
    const distY = circ1.y - circ2.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance < circ1.width + circ2.radius) {
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
  if (shots.length > 0) {
    // get all characters
    const keys = Object.keys(charList);
    const characters = charList;

    // for each attack
    for (let i = 0; i < shots.length; i++) {
      // for each character
      for (let k = 0; k < keys.length; k++) {
        const char1 = characters[keys[k]];

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

      // once the attack has been calculated again all users
      // remove this attack and move onto the next one
//      shots.splice(i);
      // decrease i since our splice changes the array length
//      i--;
    }
  }
};

const addBall = () => {
  const createdAt = new Date();
  let directNum = Math.floor(Math.random() * (7 - 0));
  const newBall = new Ball(createdAt.getTime());
  newBall.destX = ballDirections[directNum].x;
  newBall.destY = ballDirections[directNum].y;
 balls[createdAt] = newBall;
};

const updateShot = (shot) => {
    shots[shot.created] = shot; 
};

const removeShot = (shot) => {
    shots.splice(shot, 1);
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
  console.log(balls);
}, 5000);

module.exports.setCharacterList = setCharacterList;
module.exports.setCharacter = setCharacter;
module.exports.addShot = addShot;
module.exports.updateShot = updateShot;
module.exports.removeShot = removeShot;