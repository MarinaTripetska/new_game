const gameScene = new Phaser.Scene("Game");

gameScene.init = function () {
  this.playerSpeed = 1.5;
  this.enemyMaxY = 280;
  this.enemyMinY = 80;
};

gameScene.preload = function () {
  this.load.image("background", "assets/background.png");
  this.load.image("player", "assets/player.png");
  this.load.image("dragon", "assets/dragon.png");
  this.load.image("treasure", "assets/treasure.png");
};

gameScene.create = function () {
  //bg
  const bg = this.add.sprite(0, 0, "background");
  bg.setOrigin(0, 0);

  // heroes
  this.player = this.add.sprite(40, this.sys.game.config.height / 2, "player");
  this.player.setScale(0.5);
  this.isPlayerAlive = true;

  // goal
  this.treasure = this.add.sprite(
    this.sys.game.config.width - 80,
    this.sys.game.config.height / 2,
    "treasure"
  );
  this.treasure.setScale(0.6);

  // group of enemies
  this.enemies = this.add.group({
    key: "dragon",
    repeat: 5,
    setXY: {
      x: 110,
      y: 100,
      stepX: 80,
      stepY: 20,
    },
  });
  //scale of enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);
  //speed of enemies
  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      enemy.speed = Math.random() * 2 + 1;
    },
    this
  );

  // reset cameras effect
  this.cameras.main.resetFX();
};

gameScene.update = function () {
  if (!this.isPlayerAlive) {
    return;
  }

  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  }

  if (
    Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getBounds(),
      this.treasure.getBounds()
    )
  ) {
    this.gameOver();
  }

  // enemies move
  const enemies = this.enemies.getChildren();
  const numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i += 1) {
    enemies[i].y += enemies[i].speed;

    if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
      enemies[i].speed *= -1;
    } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
      enemies[i].speed *= -1;
    }

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        enemies[i].getBounds()
      )
    ) {
      this.gameOver();
      break;
    }
  }
};

gameScene.gameOver = function () {
  this.isPlayerAlive = false;

  this.cameras.main.shake(500);

  this.time.delayedCall(
    250,
    function () {
      this.cameras.main.fade(250);
    },
    [],
    this
  );

  this.time.delayedCall(
    500,
    function () {
      this.scene.restart();
    },
    [],
    this
  );
};

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene,
};

const game = new Phaser.Game(config);
