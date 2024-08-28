var ctx = document.getElementById("ctx").getContext("2d");
ctx.fontStyle = "blue";
ctx.font = "16px comic sans MS";

var canvasWidth = ctx.canvas.width;
var canvasHeight = ctx.canvas.height;

var tileList,
  noOfTiles,
  score = 0,
  lives,
  intervalVal,
  noOfStrTiles,
  strTileList,
  maxScore,
  playerName = "",
  start = 0;

var base = {
  x: 0,
  y: 0,
  height: 8,
  width: 75,
  color: "blue",
  left: false,
  right: false,
};

var ball = {
  x: 0,
  y: 0,
  color: "red",
  radius: 4,
  spdX: 4,
  spdY: 4,
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
  if (obj.corner == true)
    ctx.fillRect(obj.x, obj.y, 10.5, tile.height);
  else
    ctx.fillRect(obj.x, obj.y, tile.width, tile.height);
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
    ball.y + ball.radius >= base.y &&
    ball.y - ball.radius <= base.y + base.height &&
    ball.x + ball.radius >= base.x &&
    ball.x - ball.radius <= base.x + base.width
  ) {
    ball.spdY = ball.spdY * -1;
  }
};

updateBasePosition = function () {
  if (ball.moving) {
    if (base.left) {
      base.x -= 5;
    } else if (base.right) {
      base.x += 5;
    }
    if (base.x < 0) {
      base.x = 0;
    } else if (base.x > 225) {
      base.x = 225;
    }
  }
};

updateBallPosition = function () {
  if (ball.moving) {
    ball.x += ball.spdX;
    ball.y += ball.spdY;
    if (ball.x <= 0 + ball.radius) {
      ball.spdX *= -1;
    } else if (ball.x >= 300 - ball.radius) {
      ball.spdX *= -1;
    } else if (ball.y <= 0 + ball.radius) {
      ball.spdY *= -1;
    } else if (ball.y >= 400 - ball.radius) {
      ball.spdY *= -1;
    }
  }
};

collisionBallTile = function (t) {
  if (
    ball.y + ball.radius >= t.y &&
    ball.y - ball.radius <= t.y + tile.height &&
    ball.x + ball.radius >= t.x &&
    ball.x - ball.radius <= t.x + tile.width
  ) {
    return true;
  }
};

checkLives = function () {
  if (ball.y + ball.radius >= 200) {
    lives--;
    base.x = 115;
    base.y = 135;
    ball.x = base.x + 36;
    ball.y = base.y - 4;
    ball.moving = false;
    return true;
  }
  return false;
};

gameWin = function () {
  if (score == 82) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = "30px  comic sans MS ";
    ctx.fillText("You Win ..!", 70, 80);
    ctx.restore();
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
}

gameOverMsg = function () {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.font = "30px  comic sans MS ";
  ctx.fillText("Game Over ..!", 70, 80);
  ctx.restore();
  setHighSore(Math.max(score, maxScore));
  updateLeaderboard(playerName, score);
  renderLeaderboard();
  clearInterval(intervalVal);
};

restartBtn = function () {
  let btn = document.getElementById("restart");
  btn.style.visibility = "visible";
  btn.onclick = function () {
    btn.style.visibility = "hidden";
    ball.moving = false;
    startGame();
  };
}

setHighSore = function (value) {
  console.log("set", value);
  localStorage.setItem("score", value);
  document.getElementById("highScore").innerHTML = value;
}

fetchHighScore = function () {
  let score = localStorage.getItem("score");
  score = score ? parseInt(score) : 0;
  console.log("fetched", score);
  return score;
}

updateGame = function () {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  strTileList.forEach((x) => {
    if (x.strength == 2) drawStrTile(x);
    else drawTile(x);
  });
  tileList.forEach((x) => drawTile(x));
  drawBase();
  drawBall();
  if (ball.moving) {
    collisionBaseBall(base, ball);
    updateBasePosition();
    updateBallPosition();
    checkLives();
    gameWin();

    for (key in strTileList) {
      if (collisionBallTile(strTileList[key])) {
        score++;
        strTileList[key].strength--;
        if (strTileList[key].strength == 0) delete strTileList[key];
        ball.spdY *= -1;
      }
    }

    for (key in tileList) {
      if (collisionBallTile(tileList[key])) {
        delete tileList[key];
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
  ball.x = base.x + 36;
  ball.y = base.y - 4;

  score = 0;
  lives = 3;
  noOfTiles = 0;
  noOfStrTiles = 0;

  maxScore = fetchHighScore();

  var strTileY = 6;
  var tileY = 20;

  tileList = [];
  strTileList = [];

  for (var i = 1; i <= 3; ++i) {
    var strTileX = 7;
    for (var j = 1; j < 11; ++j) {
      strTileList[noOfStrTiles++] = { x: strTileX, y: strTileY, strength: 2 };
      strTileX += 29;
    }
    strTileY += 28;
  }

  for (var i = 1; i < 3; ++i) {
    var tileX = 7;
    tileList[noOfTiles++] = { x: tileX, y: tileY, corner: true };
    tileX += 14;
    for (var j = 1; j < 10; ++j) {
      tileList[noOfTiles++] = { x: tileX, y: tileY };
      tileX += 29;
    }
    tileList[noOfTiles++] = { x: tileX, y: tileY, corner: true };
    tileY += 28;
  }

  document.getElementById("data").style.visibility = "hidden";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawBase();
  drawBall();
  strTileList.forEach((x) => drawStrTile(x));
  tileList.forEach((x) => drawTile(x));
  updateData();
  intervalVal = setInterval(updateGame, 25);
};

startMsg = function () {
  ctx.save();
  ctx.font = "17px Fraunces";
  ctx.fillStyle = "red";
  ctx.fillText("Enter your Name", 78, 70);
  ctx.restore();

  document.getElementById("arrow").onclick = function () {
    if (start == 0 && playerName != "") {
      start = 1;
      startGame();
    }
  };
};

if (start == 0) {
  renderLeaderboard();
  document.getElementById("highScore").innerHTML = fetchHighScore();
  startMsg();
}

