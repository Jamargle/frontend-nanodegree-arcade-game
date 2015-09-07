

var tileWidth = 101;
var tileHeight = 83;
var baseSpeed = 100;
var firstRow = 68;
var secondRow = 151;
var thirdRow = 234;
var numCols = 5;
var numEnemies = 4;
var gameOn = false;
var messages, gameOver, gameReset;

function gameTitle() {
    ctx.font="20px Georgia";
    ctx.fillText('Lives: ', 10, 45);
    ctx.font="30px Verdana";
// Create gradient
    var gradient=ctx.createLinearGradient(0, 0, 606, 0);
    gradient.addColorStop("0","magenta");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");
// Fill with gradient
    ctx.fillStyle=gradient;
    ctx.fillText("Bug Smile!", 175, 45);
}

function randomRows() {
    var rows = [firstRow, secondRow, thirdRow];
    return rows[Math.floor(Math.random() * 3)];   //return a random y coordinate
}

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speed = baseSpeed + Math.floor(Math.random() * 10) * 20;
    this.startX = -tileWidth;
    this.x = this.startX;
    this.y = randomRows();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    //Once an enemy bug reaches the right border, reset it's 
    //position on the left
    if(this.x > tileWidth * numCols) {
        this.x = this.startX;
        this.y = randomRows();
    }
};

//Reset the enemie's position and speed to a new random values
Enemy.prototype.reset = function() {
    this.speed = baseSpeed + Math.floor(Math.random() * 10) * 20;
    this.startX = -tileWidth;
    this.x = this.startX;
    this.y = randomRows();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.startX = tileWidth * 2;
    this.startY = 400;
    this.x = this.startX;
    this.y = this.startY;
    this.points = 0;         //initial score
    this.lives = 3;          //initial lives at the beginning
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//The function is called by the function updateEntities() in engine.js
Player.prototype.update = function() {
    this.checkCollisions();
    this.reachedWater();
};

//Keycode control player's movement
//Player can't go out of the canvas border
Player.prototype.handleInput = function(key){
    switch(key) {
        case 'left':
            if(this.x - tileWidth < 0) return;
                this.x -= tileWidth;
        break;
        case 'right':
            if(this.x + tileWidth > numCols * (tileWidth - 1)) return;
                this.x += tileWidth;
        break;
        case 'up':
            if (this.y < tileHeight * 0.5) {
                this.reachedWater();
            }
            else this.y -= tileHeight;
        break;
        case 'down':
            this.y += tileHeight;
            if(this.y > this.startY){
                this.y = this.startY;
            }
        break;
        default:
        break;
    }
};

//Method is called after collision with enemies or gem, and
//if player gets into water. Reset the player to the initial position
Player.prototype.reset = function () {
    this.x = this.startX;
    this.y = this.startY;
};

//Called by player.update()
Player.prototype.reachedWater = function() {
    if(this.lives > 0) {
        if(this.y < tileHeight * 0.5) {
                this.lives--;         //player lose one live if "fall" into water
                this.reset();         //player at the start position
        }
    }else{
        gameOver();
        clearInterval(interval);    //stop the timer if player lost all lives
    }
};

Player.prototype.collectedGems = function() {
    if(this.y === gem.y && this.x < (gem.x + 60)) {
        if(this.x > (gem.x - 60)) {       //if collision with gem
            this.points += gem.points;    //add points to the player score
            gem.reset();
        }
    }
};

//Called by player.update(), defines checkCollisions() method
Player.prototype.checkCollisions = function() {
    if(this.lives > 0) {                      //if the condition returns true
        allEnemies.forEach(function(enemy) {  //and checks for enemie's relative position to the player
            if(player.y === enemy.y && player.x < (enemy.x + 60)){
                if(player.x > (enemy.x - 60)) {
                    player.reset();           //return player to his initial position
                    player.lives--;           //player lost one live
                }
            }
        });
    }else{                                   //if player has no lives
        gameOver();                          //calls gameOver (player lost all lives)
        clearInterval(interval);             //stops countdown timer
        }
    this.collectedGems();                    //checks player-gem collision
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for(var i = 0; i < numEnemies; i++) {    //loop through the iteams in the array
    var enemy = new Enemy();             //create enemy object
    allEnemies.push(enemy);              //add the enemy to the allEnemies array
}

// Place the player object in a variable called player
var player = new Player();


//Hearts appear at the left top coner to indicate the player's lives
var Lives = function() {
    this.sprite = 'images/Heart.png';
};
Lives.prototype.render = function() {
    for(var i = 0; i < player.lives; i++) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, tileWidth/2, tileHeight*0.8);
    this.x = 0 + tileWidth*i/2;
    this.y = 40;
    }
};
var lives = new Lives();

//returns random gem sprite
function randomGemSprite() {
    var gems = [
    'images/Gem Orange.png',
    'images/Gem Blue.png',
    'images/Gem Green.png'
    ];
    return gems[Math.floor(Math.random() * 3)];
}

function gemPoints() {
    var points = [100, 200, 300];
    return points[Math.floor(Math.random() * 3)];
}

//Define Gem class. One gem will randomly appear on the stone-block area
var Gem = function() {
    this.sprite = randomGemSprite();
    this.points = gemPoints();
    this.x = Math.floor(Math.random() * numCols)*tileWidth;
    this.y = randomRows();
};

Gem.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
//Gem.prototype.update = function() {
//}
Gem.prototype.reset = function() {
    this.sprite = randomGemSprite();
    this.points = gemPoints();
    this.x = Math.floor(Math.random() * numCols)*tileWidth;
    this.y = randomRows();
};

//Place all gems objects in an array called allGems
var allGems = [];
for(var i = 0; i < 1; i++) {
    var gem = new Gem();
    allGems.push(gem);
}

//
var Message  = function() {
    this.msgs = [];
    this.size = [36];
};

Message.prototype.render = function() {
    var self = this;
    var Y = 0;
    this.x = ctx.canvas.width / 3;
    this.y = ctx.canvas.height / 2;
        ctx.save();                               //save the default state of the canvas onto a stack before modifying it
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.textAlign = 'left';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        this.msgs.forEach(function(msg) {
            ctx.font = self.size[self.msgs.indexOf(msg)] + 'px Impact, Charcoal, sans-serif';
            ctx.fillText(msg, self.x, self.y + Y);
            ctx.strokeText(msg, self.x, self.y + Y);
            Y = self.size[self.msgs.indexOf(msg)] + 5;
        });
        ctx.restore();                            //restore the default state
};

Message.prototype.reset = function() {
    this.size = 36;
};

messages = [];

//Called by checkCollisions() function. Displays the game over message
gameOver = function() {
    var state;
    state = new Message();                  //create new message
    state.reset();
    state.size = [36, 56];
    state.msgs.push('Game OVER!', 'You got' + ' ' + player.points);
    messages.push(state);                   //adds game over message to the array
    gameOn = false;                         //stop the game
};

//Reset the game to the initial values it had. Called once we receive the mouse click to start game
gameReset = function() {
    createTimer(60);                      //start the game timer
    player.points = 0;                    //sets player points to 0
    player.lives = 3;                     //player gets 3 lives
    player.reset();                       //player position
    allEnemies.forEach(function(enemy) {   //reset the enemie's location for
        enemy.reset();                     //each enemy in an array
    });
    allGems.forEach(function(gem) {        //for each gem call reset function
        gem.reset();
    });
    messages = [];                        //array for messages
    gameOn = true;                        //the value of gameOn now is true
};

//initial game with click "start game" button
document.getElementById('continue').addEventListener('click',function(){
        if(!gameOn){
            gameReset();
        }
    });

//Create countdown timer (60 sec) for the game
var interval;                                   //used to store the timer
function makeWhite(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
}
//Start timer to run an anonymous function every second
function createTimer(seconds) {
    interval = setInterval(function () {
        makeWhite(400, 20, 100, 80);
        if(seconds === 0) {
            clearInterval(interval);           //clear timer if time is up
            gameOver();                        //call gameOver() function
            ctx.font = "20px Arial";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Time's UP!", 450, 40);
            return;
        }
        ctx.font = "20px Arial";
        if(seconds <= 10) {                  //if less then 10 seconds make timer text red
            ctx.fillStyle = "red";
        }else{
            ctx.fillStyle = "blue";          //color for the timer is blue
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var minites = Math.floor(seconds / 60);  //calculate the remaining minutes
        var secondsShow = (seconds - minites * 60).toString(); //calculate seconds
        if(secondsShow.length === 1) {           //if the number of seconds < 10, then
            secondsShow = "0" + secondsShow;     // it will be shown after '0'
        }
        ctx.fillText(minites.toString() + ":" + secondsShow, 470, 40);
        seconds--;
    }, 1000);                                   //milliseconds timer will wait
}

// This listens for key presses and sends the keys to
// Player.handleInput() method.

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

