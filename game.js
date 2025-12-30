
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

new Phaser.Game(config);

// variables
let player;
let ground;
let platforms;
let stars;
let cursors;
let spaceKey;
let score = 0;
let scoreText;
let seasonText;
let currentSeason = 0;
let seasonTimer = 0;
let gameOver = false;
let gameOverText;

// seasons
const SEASONS = [
    { name: 'SPRING', bg: '#87CEEB', ground: '#90EE90' },
    { name: 'SUMMER', bg: '#FFD93D', ground: '#F4A460' },
    { name: 'AUTUMN', bg: '#FF8C42', ground: '#D2691E' },
    { name: 'WINTER', bg: '#B0E0E6', ground: '#E0F6FF' }
];

function preload() {
    // sprite
    createKawaiiSprite(this);
}

function createKawaiiSprite(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    graphics.fillStyle(0xFFB6D9); 
    graphics.fillRoundedRect(18, 42, 24, 20, 8);
    
    graphics.fillStyle(0xFFE5CC); 
    graphics.fillCircle(30, 25, 18); 
    
    graphics.fillStyle(0xFFA07A); 
   
    graphics.fillCircle(30, 12, 16);
    
    graphics.fillCircle(15, 20, 10);
    graphics.fillCircle(45, 20, 10);
   
    graphics.fillStyle(0xFFA07A);
    
    graphics.beginPath();
    graphics.moveTo(12, 22);
    graphics.lineTo(5, 30);
    graphics.lineTo(10, 38);
    graphics.lineTo(15, 28);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.beginPath();
    graphics.moveTo(48, 22);
    graphics.lineTo(55, 30);
    graphics.lineTo(50, 38);
    graphics.lineTo(45, 28);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.fillStyle(0xFF69B4); 
    graphics.fillCircle(10, 18, 5);
    graphics.fillCircle(16, 18, 5);
    graphics.fillCircle(13, 18, 3);
    
    graphics.fillCircle(44, 18, 5);
    graphics.fillCircle(50, 18, 5);
    graphics.fillCircle(47, 18, 3);
    
    
    graphics.fillStyle(0xFFFFFF);
    graphics.fillEllipse(23, 26, 8, 10);
    graphics.fillEllipse(37, 26, 8, 10);
    
    graphics.fillStyle(0x9370DB); 
    graphics.fillCircle(23, 27, 6);
    graphics.fillCircle(37, 27, 6);
  
    graphics.fillStyle(0x4B0082); 
    graphics.fillCircle(23, 28, 4);
    graphics.fillCircle(37, 28, 4);
    
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(21, 25, 3);
    graphics.fillCircle(35, 25, 3);
    graphics.fillCircle(24, 29, 2);
    graphics.fillCircle(38, 29, 2);
    graphics.fillCircle(25, 26, 1);
    graphics.fillCircle(39, 26, 1);
    
    graphics.fillStyle(0xFFB6C1);
    graphics.fillCircle(15, 30, 5);
    graphics.fillCircle(45, 30, 5);
    
    graphics.lineStyle(2, 0xFF69B4);
    graphics.beginPath();
    graphics.arc(30, 32, 5, 0.4, Math.PI - 0.4);
    graphics.strokePath();
    
    graphics.fillStyle(0xFFB6C1);
    graphics.fillCircle(27, 32, 1);
    graphics.fillCircle(33, 32, 1);
    
    graphics.fillStyle(0xFFE5CC);
    graphics.fillCircle(14, 48, 5);
    graphics.fillCircle(46, 48, 5);
    
    graphics.fillStyle(0xFFE5CC);
    graphics.fillRoundedRect(22, 60, 6, 12, 3);
    graphics.fillRoundedRect(32, 60, 6, 12, 3);
    
    graphics.fillStyle(0xFF1493); 
    graphics.fillEllipse(25, 72, 8, 5);
    graphics.fillEllipse(35, 72, 8, 5);
    
    graphics.lineStyle(2, 0xFF69B4);
    graphics.lineBetween(22, 70, 28, 70);
    graphics.lineBetween(32, 70, 38, 70);
    
    
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(30, 47, 2);
    graphics.fillCircle(30, 52, 2);
    graphics.fillCircle(30, 57, 2);
    
    graphics.generateTexture('kawaii_player', 60, 76);
    graphics.destroy();
    console.log('Kawaii sprite created!');
}

function create() {
   
    score = 0;
    currentSeason = 0;
    seasonTimer = 0;
    gameOver = false;
    

    this.cameras.main.setBackgroundColor(SEASONS[0].bg);
    
    // DEATH ZONE 
    ground = this.add.rectangle(400, 570, 800, 60, parseInt(SEASONS[0].ground.replace('#', '0x')));
    this.physics.add.existing(ground, true);
    
    // platforms 
    platforms = this.physics.add.staticGroup();
    
    createPlatform(this, 150, 450, 140);
    createPlatform(this, 400, 380, 120);
    createPlatform(this, 650, 450, 140);
    createPlatform(this, 250, 310, 100);
    createPlatform(this, 550, 310, 100);
    createPlatform(this, 400, 200, 120);
    

    player = this.physics.add.sprite(100, 400, 'kawaii_player');
    player.setScale(0.9);
    player.setCollideWorldBounds(true);
    player.body.setBounce(0);
    
    player.eyeLeft = null;
    player.eyeRight = null;
    player.smile = null;
    
    this.physics.add.collider(player, platforms);
    
    this.physics.add.overlap(player, ground, hitGround, null, this);
    
    // stars
    stars = this.physics.add.group();
    createStars(this);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    // controls
    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    

    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Ribeye'
    });

    seasonText = this.add.text(400, 20, SEASONS[0].name, {
        fontSize: '38px',
        fill: '#fff',
        fontFamily: 'Ribeye'
    }).setOrigin(0.5, 0);
    
    gameOverText = this.add.text(400, 300, '', {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Ribeye'
    }).setOrigin(0.5);
    gameOverText.setVisible(false);
    
    console.log('Game loaded! Use SPACE to jump! Dont touch the ground!');
}

function createPlatform(scene, x, y, width) {
    const plat = scene.add.rectangle(x, y, width, 20, parseInt(SEASONS[0].ground.replace('#', '0x')));
    scene.physics.add.existing(plat, true);
    platforms.add(plat);
}

function createStars(scene) {
    const starPositions = [
        { x: 150, y: 400 },
        { x: 400, y: 330 },
        { x: 650, y: 400 },
        { x: 250, y: 260 },
        { x: 550, y: 260 },
        { x: 400, y: 150 }
    ];
    
    starPositions.forEach(pos => {
        const star = scene.add.star(pos.x, pos.y, 5, 10, 20, 0xFFFF00);
        star.setStrokeStyle(3, 0xFFD700);
        stars.add(star);
        star.body.setAllowGravity(false);
        
        scene.tweens.add({
            targets: star,
            scale: 1.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    });
}

function hitGround(playerObj, groundObj) {
    gameOver = true;
    
   
    this.physics.pause();
    
   
    player.setTint(0x888888);
    
  
    gameOverText.setText('GAME OVER!\nScore: ' + score + '\n\nPress SPACE to Restart');
    gameOverText.setVisible(true);
    
    console.log('GAME OVER! Final Score:', score);
}

function collectStar(playerObj, star) {
    star.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    
    console.log('Star collected! Score:', score);
    
    // Create new star
    const x = Phaser.Math.Between(80, 720);
    const y = Phaser.Math.Between(100, 350);
    const newStar = this.add.star(x, y, 5, 10, 20, 0xFFFF00);
    newStar.setStrokeStyle(3, 0xFFD700);
    stars.add(newStar);
    newStar.body.setAllowGravity(false);
    
    this.tweens.add({
        targets: newStar,
        scale: 1.4,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function update(time, delta) {
    
    if (gameOver) {
        if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
            
            gameOver = false;
            score = 0;
            currentSeason = 0;
            seasonTimer = 0;
            
            
            this.scene.restart();
            console.log('Game restarted! Score reset to 0');
        }
        return; // Stop updating game
    }
    
    // Check if on platform (NOT ground)
    const onPlatform = player.body.touching.down && !gameOver;
    
    // Movement
    if (cursors.left.isDown) {
        player.body.setVelocityX(-220);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(220);
    } else {
        player.body.setVelocityX(0);
    }
    
    // Jump
    if (Phaser.Input.Keyboard.JustDown(spaceKey) && onPlatform) {
        player.body.setVelocityY(-480);
        console.log('JUMP!');
    }
    
    // Season change every 10 seconds
    seasonTimer += delta;
    if (seasonTimer >= 10000) {
        seasonTimer = 0;
        currentSeason = (currentSeason + 1) % 4;
        changeSeason(this);
    }
}

function changeSeason(scene) {
    const season = SEASONS[currentSeason];
    
    console.log('Season changed to:', season.name);
    
    // Change background
    scene.cameras.main.setBackgroundColor(season.bg);
    
    // Change ground color
    ground.setFillStyle(parseInt(season.ground.replace('#', '0x')));
    
    // Change platforms
    platforms.children.entries.forEach(plat => {
        plat.setFillStyle(parseInt(season.ground.replace('#', '0x')));
    });
    
    // Update text
    seasonText.setText(season.name);
    
    // Flash
    scene.cameras.main.flash(500);
}

console.log('Seasons Sprint Ready! Dont touch the ground!');

