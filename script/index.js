var ctx = document.getElementById("ctx").getContext("2d");
ctx.fontStyle = "blue";
ctx.font = "16px comic sans MS";

var canvasWidth = ctx.canvas.width;
var canvasHeight = ctx.canvas.height;

var tileList,
  noOfTiles,
  score = 0,
  lives = 3,
  intervalVal,
  noOfStrTiles,
  strTileList,
  maxScore,
  activePowers,
  noOfPowers,
  playerName = "",
  start = 0,
  level = 1;

var base = {
  x: 0,
  y: 0,
  height: 5,
  width: 75,
  color: "blue",
  left: false,
  right: false,
  isVisible: true,
};

var ball = {
  x: 0,
  y: 0,
  color: "red",
  radius: 4,
  spdX: 3,
  spdY: 3,
  moving: false,
};

var tile = {
  color: "green",
  height: 10,
  width: 25,
};

var strongTile = {
  color: "blue",
  width: 25,
  height: 10,
};

var powerobj = {
  height: 4,
  width: 2,
};

var powers = {
  width: {
    color: "black",
    callback: function () {
      base.width -= 10;
      drawBase();
    },
  },
  decreaseLive: {
    color: "red",
    callback: function () {
      lives -= 1;
    },
  },
  increaseLives: {
    color: "green",
    callback: function () {
      lives += 1;
    },
  },
};

document.addEventListener("keydown", function (Event) {
  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      base.left = true;
      base.right = false;
      break;
    case "ArrowRight":
      base.left = false;
      base.right = true;
      break;
    case " ":
      ball.moving = true;
  }
});

document.addEventListener("keyup", function (event) {
  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      base.left = false;
      break;
    case "ArrowRight":
      base.right = false;
      break;
  }
});

document.getElementById("name").addEventListener("input", function () {
  let inputValue = this.value;
  playerName = this.value;
  console.log("Current input value: ", inputValue);
});

document.getElementById("name").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleStart();
  }
});

document.getElementById("rankings").onclick = function () {
  let leaderBoard=document.querySelector(".rank")
  leaderBoard.style.display="block";
  let gameSection=document.querySelector(".section")
  gameSection.style.display="none";
};

document.getElementById("start").onclick = function () {
  let leaderBoard=document.querySelector(".rank")
  leaderBoard.style.display="none";
  let gameSection=document.querySelector(".section")
  gameSection.style.display="block";
};

drawBase = function () {
  ctx.save();
  ctx.fillStyle = base.color;
  ctx.fillRect(base.x, base.y, base.width, base.height);
  ctx.restore();
};

drawBall = function () {
  ctx.save();
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
};

drawStrTile = function (obj) {
  ctx.save();
  ctx.fillStyle = strongTile.color;
  ctx.fillRect(obj.x, obj.y, strongTile.width, strongTile.height);
  ctx.restore();
};

drawTile = function (obj) {
  ctx.save();
  ctx.fillStyle = tile.color;
  if (obj.corner == true) ctx.fillRect(obj.x, obj.y, 10.5, tile.height);
  else ctx.fillRect(obj.x, obj.y, tile.width, tile.height);
  ctx.restore();
};

drawPowerUp = function (obj) {
  // console.log(obj);
  ctx.save();
  ctx.fillStyle = powers[obj.type].color;
  ctx.fillRect(obj.x, obj.y, powerobj.width, powerobj.height);
  ctx.restore();
};

function updateLeaderboard(playerName, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({ name: playerName, score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  console.log(leaderboard);

  const table = document.getElementById("leaderboard");
  table.innerHTML = "";
  leaderboard.forEach((item, index) => {
    let row = table.insertRow();
    let ind = row.insertCell(0);
    ind.innerHTML = index + 1;
    let name = row.insertCell(1);
    name.innerHTML = item.name;
    let score = row.insertCell(2);
    score.innerHTML = item.score;
  });
}

collisionBaseBall = function (base, ball) {
  if (
    ball.y + ball.radius === base.y &&
    // ball.y - ball.radius <= base.y + base.height &&
    ball.x + ball.radius >= base.x &&
    ball.x - ball.radius <= base.x + base.width
  ) {
    ball.spdY = -Math.abs(ball.spdY);
  }
};

updateBasePosition = function () {
  if (ball.moving) {
    if (base.left) {
      base.x -= 8;
    } else if (base.right) {
      base.x += 8;
    }
    if (base.x < 0) {
      base.x = 0;
    } else if (base.x + base.width > 300) {
      base.x = 300 - base.width;
    }
  }
};

updateBallPosition = function () {
  if (ball.moving) {
    ball.x += ball.spdX;
    ball.y += ball.spdY;
    if (ball.x - ball.radius <= 0) {
      ball.spdX *= -1;
    } else if (ball.x + ball.radius >= 300) {
      ball.spdX *= -1;
    } else if (ball.y - ball.radius <= 0) {
      ball.spdY *= -1;
    } else if (ball.y + ball.radius >= 200) {
      ball.spdY *= -1;
    }
  }
};

collisionBallTile = function (t) {
  if (
    ball.x + ball.radius > t.x &&
    ball.x - ball.radius < t.x + tile.width &&
    ball.y + ball.radius > t.y &&
    ball.y - ball.radius < t.y + tile.height
  ) {
    return true;
  }
  return false;
};


checkLives = function () {
  if (ball.y + ball.radius >= 200) {
    lives--;
    base.x = 115;
    base.y = 135;
    ball.x = base.x + 36;
    ball.y = base.y - 4;
    ball.moving = false;
    base.width = 75;
    activePowers = [];
    return true;
  }
  return false;
};

gameWin = function () {
  if (tileList.length === 0 && strTileList.length === 0 && level == 5) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = "30px  comic sans MS ";
    ctx.fillText("You Win ..!", 70, 80);
    ctx.restore();
    activePowers = [];
    clearInterval(intervalVal);
    setHighSore(Math.max(score, maxScore));
    updateLeaderboard(playerName, score);
    renderLeaderboard();
    restartBtn();
  }
};

updateData = function () {
  let scoreEle = document.getElementById("score");
  scoreEle.innerHTML = score;

  let livesEle = document.getElementById("lives");
  livesEle.innerHTML = lives;

  let levelEle = document.getElementById("level");
  levelEle.innerHTML = level;
};

gameOverMsg = function () {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.font = "30px  comic sans MS ";
  ctx.fillText("Game Over ..!", 70, 80);
  ctx.restore();
  activePowers = [];
  setHighSore(Math.max(score, maxScore));
  updateLeaderboard(playerName, score);
  renderLeaderboard();
  clearInterval(intervalVal);
};

restartBtn = function () {
  let btn = document.querySelector(".buttons");
  btn.style.visibility = "visible";
  btn.onclick = function () {
    btn.style.visibility = "hidden";
    ball.moving = false;
    startGame();
  };
};

setHighSore = function (value) {
  console.log("set", value);
  localStorage.setItem("score", value);
  document.getElementById("highScore").innerHTML = value;
};

fetchHighScore = function () {
  let score = localStorage.getItem("score");
  score = score ? parseInt(score) : 0;
  console.log("fetched", score);
  return score;
};

populateTiles = function () {
  noOfTiles = 0;
  noOfStrTiles = 0;
  noOfPowers = 0;

  var strTileY = 6;
  var tileY = 20;

  tileList = [];
  strTileList = [];
  activePowers = [];

  for (var i = 1; i <= level + 1; ++i) {
    var tileX = 7;
    if (i % 2 !== 0) {
      for (var j = 1; j < 11; ++j) {
        strTileList[noOfStrTiles++] = {
          x: tileX,
          y: strTileY,
          strength: 2,
          power: null,
        };
        tileX += 29;
      }
      strTileY += 28;
    } else {
      tileList[noOfTiles++] = { x: tileX, y: tileY, corner: true, power: null };
      tileX += 14;
      for (var j = 1; j < 10; ++j) {
        tileList[noOfTiles++] = { x: tileX, y: tileY, power: null };
        tileX += 29;
      }
      tileList[noOfTiles++] = { x: tileX, y: tileY, corner: true, power: null };
      tileY += 28;
    }
  }

  var combinedList = [...strTileList, ...tileList];

  for (let i = combinedList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedList[i], combinedList[j]] = [combinedList[j], combinedList[i]];
  }

  for (let i = 0; i <= level + 1; i++) {
    combinedList[i].power = Math.floor(Math.random() * 2 + 1);
  }

  if (level == 4) {
    combinedList[level + 2].power = 3;
  }
};

updateLevel = function () {
  if (tileList.length === 0 && strTileList.length === 0) {
    level += 1;
    if (level < 5) {
      populateTiles();
      ball.moving = false;
      clearInterval();
      base.x = 115;
      base.y = 135;
      base.width = 75;
      ball.x = base.x + 36;
      ball.y = base.y - 4;
      ball.spdX = Math.abs(ball.spdX) + 0.4;
      ball.spdY = Math.abs(ball.spdY) + 0.4;
    }
  }
  // console.log("level", level);
};

function startBlinkingBase(duration) {
  const blinkInterval = setInterval(() => {
    base.isVisible = !base.isVisible;
  }, 100);

  setTimeout(() => {
    clearInterval(blinkInterval);
    base.isVisible = true;
    drawBase();
  }, duration);
}

updateGame = function () {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  strTileList.forEach((x) => {
    if (x.strength == 2) drawStrTile(x);
    else drawTile(x);
  });
  tileList.forEach((x) => drawTile(x));
  if (base.isVisible == true) {
    drawBase();
  }
  drawBall();
  activePowers.forEach((power, index) => {
    power.y += 2;
    if (
      power.y + powerobj.height >= base.y &&
      power.x + powerobj.width >= base.x &&
      power.x <= base.x + base.width
    ) {
      powers[power.type].callback();
      activePowers.splice(index, 1);
      if(power.type !== "increaseLives"){
        score -= 5;
      }
      startBlinkingBase(1000);
    } else if (power.y > ctx.canvas.height) {
      activePowers.splice(index, 1);
    } else {
      drawPowerUp(power);
    }
  });

  if (ball.moving) {
    collisionBaseBall(base, ball);
    updateBasePosition();
    updateBallPosition();
    updateLevel();
    checkLives();
    gameWin();

    for (key in strTileList) {
      if (collisionBallTile(strTileList[key])) {
        if (strTileList[key].power == 1) {
          activePowers[noOfPowers++] = {
            type: "width",
            x: strTileList[key].x,
            y: strTileList[key].y,
          };
        }
        if (strTileList[key].power == 2) {
          activePowers[noOfPowers++] = {
            type: "decreaseLive",
            x: strTileList[key].x,
            y: strTileList[key].y,
          };
        }
        if (strTileList[key].power == 3) {
          activePowers[noOfPowers++] = {
            type: "increaseLives",
            x: strTileList[key].x,
            y: strTileList[key].y,
          };
        }
        score++;
        strTileList[key].strength--;
        if (strTileList[key].strength == 0) strTileList.splice(key, 1);
        ball.spdY *= -1;
      }
    }

    for (key in tileList) {
      if (collisionBallTile(tileList[key])) {
        if (tileList[key].power == 1) {
          activePowers[noOfPowers++] = {
            type: "width",
            x: tileList[key].x,
            y: tileList[key].y,
          };
        }
        if (tileList[key].power == 2) {
          activePowers[noOfPowers++] = {
            type: "decreaseLive",
            x: tileList[key].x,
            y: tileList[key].y,
          };
        }
        if (tileList[key].power == 3) {
          activePowers[noOfPowers++] = {
            type: "increaseLives",
            x: tileList[key].x,
            y: tileList[key].y,
          };
        }
        tileList.splice(key, 1);
        score++;
        ball.spdY *= -1;
      }
    }

    updateData();

    if (lives <= 0) {
      gameOverMsg();
      restartBtn();
    }
  }
};

startGame = function () {
  base.x = 115;
  base.y = 135;
  base.width = 75;
  ball.x = base.x + 36;
  ball.y = base.y - 4;
  level = 1;
  ball.spdX = 3;
  ball.spdY = 3;

  score = 0;
  lives = 3;
  level = 1;

  maxScore = fetchHighScore();
  populateTiles();

  document.getElementById("data").style.visibility = "hidden";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawBase();
  drawBall();
  strTileList.forEach((x) => drawStrTile(x));
  tileList.forEach((x) => drawTile(x));
  updateData();
  intervalVal = setInterval(updateGame, 25);
};

handleStart = function () {
  if (playerName == "") {
    alert("Enter the player name to start!..");
  }
  if (start == 0 && playerName != "") {
    start = 1;
    startGame();
  }
};

startMsg = function () {
  ctx.save();
  ctx.font = "17px Fraunces";
  ctx.fillStyle = "red";
  ctx.fillText("Enter your Name", 78, 70);
  ctx.restore();

  document.getElementById("arrow").onclick = function () {
    handleStart();
  };
};

if (start == 0) {
  renderLeaderboard();
  document.getElementById("highScore").innerHTML = fetchHighScore();
  startMsg();
}
