// 经典坦克对战游戏完整实现
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置像素渲染模式
ctx.imageSmoothingEnabled = false;

// 游戏状态管理
let score = 0;
let lives = 3;
let gameRunning = true;

// 键盘状态跟踪
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 游戏常量定义
const TILE_SIZE = 16;
const TANK_SIZE = 16;
const BULLET_SIZE = 4;
const ENEMY_COUNT = 4;
const PLAYER_SPEED = 2;
const ENEMY_SPEED = 1;
const BULLET_SPEED = 4;

// 方向常量
const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 地图定义（0:空地, 1:砖墙, 2:钢墙, 3:水域, 4:森林, 5:基地）
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,5,5,5,5,5,5,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
    [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,5,5,5,5,5,5,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 玩家坦克类
class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.direction = Direction.UP;
        this.speed = isPlayer ? PLAYER_SPEED : ENEMY_SPEED;
        this.shootCooldown = 0;
        this.canShoot = true;
        this.color = color;
        this.isPlayer = isPlayer;
    }

    move() {
        let newX = this.x;
        let newY = this.y;

        // 玩家坦克控制
        if (this.isPlayer) {
            if (keys.ArrowUp) {
                this.direction = Direction.UP;
                newY -= this.speed;
            } else if (keys.ArrowDown) {
                this.direction = Direction.DOWN;
                newY += this.speed;
            } else if (keys.ArrowLeft) {
                this.direction = Direction.LEFT;
                newX -= this.speed;
            } else if (keys.ArrowRight) {
                this.direction = Direction.RIGHT;
                newX += this.speed;
            }
        } else {
            // 敌人坦克AI
            // 随机改变方向
            if (Math.random() < 0.02) {
                this.direction = Math.floor(Math.random() * 4);
            }

            // 根据当前方向移动
            switch (this.direction) {
                case Direction.UP:
                    newY -= this.speed;
                    break;
                case Direction.RIGHT:
                    newX += this.speed;
                    break;
                case Direction.DOWN:
                    newY += this.speed;
                    break;
                case Direction.LEFT:
                    newX -= this.speed;
                    break;
            }
        }

        // 检查碰撞
        if (this.checkCollision(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }

        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
            this.canShoot = false;
        } else {
            this.canShoot = true;
        }
    }

    shoot() {
        if (this.canShoot) {
            if (this.isPlayer && !keys.Space) {
                return; // 玩家需要按空格键射击
            }

            // 计算子弹初始位置
            let bulletX = this.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
            let bulletY = this.y + TANK_SIZE / 2 - BULLET_SIZE / 2;

            // 根据坦克方向调整子弹位置
            switch (this.direction) {
                case Direction.UP:
                    bulletY -= TANK_SIZE / 2;
                    break;
                case Direction.RIGHT:
                    bulletX += TANK_SIZE / 2;
                    break;
                case Direction.DOWN:
                    bulletY += TANK_SIZE / 2;
                    break;
                case Direction.LEFT:
                    bulletX -= TANK_SIZE / 2;
                    break;
            }

            // 创建新子弹
            bullets.push(new Bullet(bulletX, bulletY, this.direction, this.color));

            // 设置射击冷却
            this.shootCooldown = this.isPlayer ? 20 : 40;
            this.canShoot = false;
        }
    }

    checkCollision(newX, newY) {
        // 边界检查
        if (newX < 0 || newX + TANK_SIZE > canvas.width || 
            newY < 0 || newY + TANK_SIZE > canvas.height) {
            return false;
        }

        // 地图碰撞检查
        const tileX1 = Math.floor(newX / TILE_SIZE);
        const tileY1 = Math.floor(newY / TILE_SIZE);
        const tileX2 = Math.floor((newX + TANK_SIZE - 1) / TILE_SIZE);
        const tileY2 = Math.floor((newY + TANK_SIZE - 1) / TILE_SIZE);

        for (let y = tileY1; y <= tileY2; y++) {
            for (let x = tileX1; x <= tileX2; x++) {
                if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                    const tile = map[y][x];
                    // 不能穿过砖墙、钢墙和基地
                    if (tile === 1 || tile === 2 || tile === 5) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    draw() {
        // 绘制坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, TANK_SIZE, TANK_SIZE);

        // 绘制坦克炮管
        ctx.fillStyle = '#ffffff';
        switch (this.direction) {
            case Direction.UP:
                ctx.fillRect(this.x + TANK_SIZE/2 - 2, this.y - 4, 4, 8);
                break;
            case Direction.RIGHT:
                ctx.fillRect(this.x + TANK_SIZE - 4, this.y + TANK_SIZE/2 - 2, 8, 4);
                break;
            case Direction.DOWN:
                ctx.fillRect(this.x + TANK_SIZE/2 - 2, this.y + TANK_SIZE - 4, 4, 8);
                break;
            case Direction.LEFT:
                ctx.fillRect(this.x - 4, this.y + TANK_SIZE/2 - 2, 8, 4);
                break;
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, direction, color) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = BULLET_SPEED;
        this.color = color;
        this.ownerIsPlayer = color === '#00ff00';
    }

    move() {
        switch (this.direction) {
            case Direction.UP:
                this.y -= this.speed;
                break;
            case Direction.RIGHT:
                this.x += this.speed;
                break;
            case Direction.DOWN:
                this.y += this.speed;
                break;
            case Direction.LEFT:
                this.x -= this.speed;
                break;
        }
    }

    checkCollision() {
        // 边界检查
        if (this.x < 0 || this.x + BULLET_SIZE > canvas.width || 
            this.y < 0 || this.y + BULLET_SIZE > canvas.height) {
            return true;
        }

        // 地图碰撞检查
        const tileX = Math.floor(this.x / TILE_SIZE);
        const tileY = Math.floor(this.y / TILE_SIZE);

        if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
            const tile = map[tileY][tileX];
            
            // 子弹击中砖墙可以摧毁
            if (tile === 1) {
                map[tileY][tileX] = 0;
                return true;
            }
            // 子弹击中钢墙、水域、基地
            if (tile === 2 || tile === 3 || tile === 5) {
                // 击中基地游戏结束
                if (tile === 5) {
                    gameRunning = false;
                    showGameOver('基地被摧毁！');
                }
                return true;
            }
        }

        return false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, BULLET_SIZE, BULLET_SIZE);
    }
}

// 初始化游戏对象
let player = new Tank(canvas.width / 2 - TANK_SIZE / 2, canvas.height - TANK_SIZE - 20, '#00ff00', true);
let enemies = [];
let bullets = [];

// 初始化敌人坦克
function initEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        const x = 50 + i * 100;
        const y = 50;
        enemies.push(new Tank(x, y, '#ff0000', false));
    }
}

// 绘制地图
function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];
            const pixelX = x * TILE_SIZE;
            const pixelY = y * TILE_SIZE;

            switch (tile) {
                case 1: // 砖墙
                    ctx.fillStyle = '#aa5500';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                    break;
                case 2: // 钢墙
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                    break;
                case 3: // 水域
                    ctx.fillStyle = '#0000aa';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                    break;
                case 4: // 森林
                    ctx.fillStyle = '#006600';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                    break;
                case 5: // 基地
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE * 2, TILE_SIZE * 2);
                    x++; // 跳过一个格子
                    break;
            }
        }
    }
}

// 检查子弹与坦克的碰撞
function checkBulletTankCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        // 检查玩家坦克
        if (!bullet.ownerIsPlayer && 
            bullet.x < player.x + TANK_SIZE && 
            bullet.x + BULLET_SIZE > player.x && 
            bullet.y < player.y + TANK_SIZE && 
            bullet.y + BULLET_SIZE > player.y) {
            // 玩家被击中
            lives--;
            document.getElementById('lives').textContent = lives;
            bullets.splice(i, 1);

            if (lives <= 0) {
                gameRunning = false;
                showGameOver('生命值耗尽！');
            }
        }

        // 检查敌人坦克
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (bullet.ownerIsPlayer && 
                bullet.x < enemy.x + TANK_SIZE && 
                bullet.x + BULLET_SIZE > enemy.x && 
                bullet.y < enemy.y + TANK_SIZE && 
                bullet.y + BULLET_SIZE > enemy.y) {
                // 敌人被击中
                score += 100;
                document.getElementById('score').textContent = score;
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

// 显示游戏结束画面
function showGameOver(message) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '16px Arial';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('最终分数: ' + score, canvas.width / 2, canvas.height / 2 + 35);
    ctx.fillText('按R键重新开始', canvas.width / 2, canvas.height / 2 + 60);
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) {
        return;
    }

    // 清空画布
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制地图
    drawMap();

    // 更新和绘制玩家坦克
    player.move();
    player.shoot();
    player.draw();

    // 更新和绘制敌人坦克
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].move();
        // 敌人随机射击
        if (Math.random() < 0.01) {
            enemies[i].shoot();
        }
        enemies[i].draw();
    }

    // 如果所有敌人都被消灭，生成新的敌人
    if (enemies.length === 0) {
        initEnemies();
    }

    // 更新和绘制子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].move();
        bullets[i].draw();

        // 检查子弹碰撞
        if (bullets[i].checkCollision()) {
            bullets.splice(i, 1);
        }
    }

    // 检查子弹与坦克的碰撞
    checkBulletTankCollisions();

    // 继续游戏循环
    requestAnimationFrame(gameLoop);
}

// 键盘事件监听
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true;
    } else if (e.code === 'Space') {
        keys.Space = true;
    } else if (e.key === 'r' && !gameRunning) {
        // 重新开始游戏
        score = 0;
        lives = 3;
        gameRunning = true;
        document.getElementById('score').textContent = score;
        document.getElementById('lives').textContent = lives;
        player = new Tank(canvas.width / 2 - TANK_SIZE / 2, canvas.height - TANK_SIZE - 20, '#00ff00', true);
        initEnemies();
        bullets = [];
        // 重新绘制游戏
        requestAnimationFrame(gameLoop);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = false;
    } else if (e.code === 'Space') {
        keys.Space = false;
    }
});

// 开始游戏
initEnemies();
requestAnimationFrame(gameLoop);