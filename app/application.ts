class Point {
    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(point: Point) {
        this.x += point.x;
        this.y += point.y;
    }
}

class Rect{
    topLeft: Point;
    bottomRight: Point;

    constructor(top: number, left: number, bottom: number, right: number) {
        this.topLeft = new Point(left, top);
        this.bottomRight = new Point(right, bottom);
    }
  
    clone(): Rect {
        return new Rect(this.topLeft.y, this.topLeft.x, this.bottomRight.y, this.bottomRight.x);
    }

    add(point: Point) {
        this.topLeft.add(point);
        this.bottomRight.add(point);
    }

    moveLeft(step: number){
        this.topLeft.x -= step;
        this.bottomRight.x -= step;
    }

    moveRight(step: number){
        this.topLeft.x += step;
        this.bottomRight.x += step;
    }

    moveTo(rect: Rect) {
        this.topLeft = rect.topLeft;
        this.bottomRight = rect.bottomRight;
    }

    width() {
        return this.bottomRight.x - this.topLeft.x;
    }

    height() {
        return this.bottomRight.y - this.topLeft.y;
    }

    centerX() {
        return (this.topLeft.x + this.bottomRight.x) / 2;
    }

    centerY() {
        return (this.topLeft.y + this.bottomRight.y) / 2;
    }
}

class Vector extends Point {
    flipX() {
        this.x *= -1;
    }

    flipY() {
        this.y *= -1;
    }
}

enum Side {
    None,
    Left,
    Top,
    Right,
    Bottom
}

class Obstacle extends Rect {
    checkCollision(anotherRect: Rect): Side{
        var w = 0.5 * (this.width() + anotherRect.width());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();

        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var wy = w * dy;
            var hx = h * dx;

            if(wy > hx) {
                return wy > -hx ? Side.Top : Side.Left;
            } else {
                return wy > -hx ? Side.Right : Side.Bottom;
            }
        } else {
            return Side.None;
        }
    }   
}

class Sprite extends Obstacle {
    sprite: HTMLElement;
    isVisible: Boolean;
    maxRight: number;
    startPos: Rect;

    constructor(sprite: HTMLElement, maxRight?: number) {
        let bottom = sprite.offsetTop + sprite.offsetHeight,
            top =  sprite.offsetTop,
            left = sprite.offsetLeft,
            right = sprite.offsetLeft + sprite.offsetWidth;

        super(top, left, bottom, right);
        this.startPos = new Rect(top, left, bottom, right);
        this.sprite = sprite;
        this.maxRight = maxRight;
        this.isVisible = true;
    }


    moveTo(rect: Rect) {
        super.moveTo(rect);

        let {x: posX, y: posY } = rect.topLeft;

            this.sprite.style.left = posX + 'px';
            this.sprite.style.top = posY + 'px';
    }

     moveLeft(step: number, offset?: number) {
        var newPosition = this.clone();
        newPosition.moveLeft(step);
        offset = offset || 0;

        if(newPosition.topLeft.x - offset >= 0 )
            this.moveTo(newPosition);
    }s

    moveRight(step: number, offset?: number) {
        var newPosition = this.clone();
        newPosition.moveRight(step);
        offset = offset || 0;

        if(newPosition.bottomRight.x + offset <= this.maxRight )
            this.moveTo(newPosition);
    }

    hide() {
        this.sprite.style.display = "none";
        this.isVisible = false;
    }

    checkCollision(anotherRect: Rect): Side{
        if(!this.isVisible) {
            return Side.None;
        }
        return super.checkCollision(anotherRect);
    }    
}

class Paddle extends Sprite {
    constructor(sprite: HTMLElement, maxRight: number) {
        super(sprite, maxRight)
    }


    calculateHitAngle(ballX: number, ballRadius: number): number {
        var hitSpot = ballX - this.topLeft.x;
        var maxPaddle = this.width() + ballRadius;
        var minPaddle = -ballRadius;
        var paddleRange = maxPaddle - minPaddle;       

        var minAngle = 160;
        var maxAngle = 20;
        var angleRange = maxAngle - minAngle;

        return ((hitSpot * angleRange) / paddleRange) + minAngle;
    }
}

class Ball extends Sprite {
    sprite: HTMLElement;
    radius: number;
    dir: Vector;
    velocity: number;

    constructor(sprite: HTMLElement, velocity: number, maxRight: number) {
        let radius = parseInt(getComputedStyle(sprite)['border-radius']);
        let pos = new Point(sprite.offsetLeft, sprite.offsetTop);
        super(sprite, maxRight);
        this.sprite = sprite;
        this.radius = radius;
        this.velocity = velocity;
        this.dir = new Vector(0,0);
    };

    calculateNewPosition(): Rect {
        var newPosition = this.clone();
        newPosition.add(this.dir);
        return newPosition;
    }

    
    moveLeft(step: number, paddleWidth: number) {
        var newPosition = this.clone();
        newPosition.moveLeft(step);
        let offset = (paddleWidth / 2) - this.radius || 0;

        return super.moveLeft(step, offset);
    }

    moveRight(step: number, paddleWidth: number) {
        var newPosition = this.clone();
        newPosition.moveRight(step);
        let offset = (paddleWidth / 2) - this.radius || 0;

        return super.moveRight(step, offset);
    }

    bounceHorizontal() {
        this.dir.flipX();
    }

    bounceVertical() {
        this.dir.flipY();
    }

    bounceWithAngle(angle: number) {
        angle = angle *(Math.PI / 180);
        this.dir.x = Math.cos(angle) * this.velocity;
        this.dir.y = -Math.sin(angle) * this.velocity;
    }

    release() {
        let random = Math.random() < 0.5 ? -1 : 1;
        this.dir =new Vector(random, -this.velocity);
    }

    moveTo(rect: Rect) {
        super.moveTo(rect);

        let {x: posX, y: posY } = rect.topLeft;

            this.sprite.style.left = posX + 'px';
            this.sprite.style.top = posY + 'px';
    }
}   

class Brick extends Sprite {
    score :number;

    constructor(sprite: HTMLElement, score :number) {
        super(sprite);
        this.sprite.classList.remove('super');
        this.score = score;
    } 
}

class SuperBrick extends Brick {

    constructor(sprite: HTMLElement, score :number) {
        super(sprite, score);
        this.sprite.classList.add('super');
        this.score = score;
    } 
}

enum GameState {
    BallNotReleased,
    Running,
    GameOver       
}

enum KeyCodes {
    LEFT = 37,
    RIGHT = 39
}

class Game {
    loopInterval: number = 10;
    paddleStep: number = 30;
    velocity: number = 5;
    normalBrickScore: number = 10;
    superBrickScore: number = 30;
    bricksLeft: number = 0;
    livesLeft: number = 3;
    score: number;

    min_PercentOfSuperBricks: number = 10;
    max_PercentOfSuperBricks: number = 40;
    
    ballElement: HTMLElement;
    boardElement: HTMLElement;
    livesElement: Element;
    scoreElement: Element;
    ball: Ball;
    paddle: Paddle;
    bricks: Array<Brick> = [];

    gameState: GameState;
    keyMap ={};

    wallLeft: Obstacle;
    wallTop: Obstacle;
    wallRight: Obstacle;
    wallBottom: Obstacle;

    constructor(ballElement: HTMLElement, paddleElement: HTMLElement, bricks: HTMLCollection, boardElement: HTMLElement, statsElement: HTMLElement) {
        this.gameState = GameState.BallNotReleased;
        this.boardElement = boardElement;
        this.livesElement = statsElement.querySelector("#lives");
        this.scoreElement = statsElement.querySelector("#score");

        this.paddle = new Paddle (paddleElement, boardElement.offsetWidth)
        this.ball = new Ball (ballElement, this.velocity, boardElement.offsetWidth);
        
        let superBricksCount:number = this.countOfSuperBricks(bricks.length);
        let superBricksIndexes:Array<number> = this.indexesOfSuperBricks(superBricksCount, bricks.length);

        for (let i=0; i < bricks.length; i++) {
            let brick: Brick;
    
            if(superBricksIndexes.indexOf(i) > -1) {
                brick = new SuperBrick(<HTMLElement>bricks[i], this.superBrickScore);
                this.bricksLeft += 2;
            } else {
                brick = new Brick(<HTMLElement>bricks[i], this.normalBrickScore);
                this.bricksLeft ++;
            }

            this.bricks.push(brick);
        }

        this.createWalls(this.ball.radius, this.boardElement.offsetWidth, this.boardElement.offsetHeight);
        this.newGame();
    }
    
    countOfSuperBricks(allBricksCount) {
        let min = this.min_PercentOfSuperBricks;
        let max = this.max_PercentOfSuperBricks;
        let percent = (Math.random() * (max - min) + min) / 100;
        let count = Math.round(allBricksCount * percent);

        return count;
    }

    indexesOfSuperBricks(superBricksCount, allBricksCount) {
        let indexes: Array<number> = [];

        for(let i = 0; i < superBricksCount; i++) {
            let index:number;

            do {
                index = Math.round(Math.random() * (allBricksCount-1));
            }while(indexes.indexOf(index) != -1)

            indexes.push(index);
        }

        return indexes;
    }

    createWalls(radius: number, maxX: number, maxY: number) {
        this.wallLeft = new Obstacle(- radius, - radius, maxY + radius, 0);
        this.wallTop = new Obstacle(- radius, - radius, 0, maxX + radius);
        this.wallRight = new Obstacle(- radius, maxX, maxY + radius, maxX + radius);
        this.wallBottom = new Obstacle(maxY, - radius, maxY + radius, maxX + radius);     
    };
 
    newGame() {
        this.livesLeft = this.livesLeft | 3;
        this.livesElement.textContent = "" + this.livesLeft;
        this.scoreElement.textContent = "0";
    }
    
    addScore(points?: number) {
        points = points || 10;
        this.score = parseInt(this.scoreElement.textContent) + points;  
        this.scoreElement.textContent = "" + this.score;
    }
    
    won() {
        setTimeout(()=> {
            this.gameState = GameState.GameOver;
            alert("You won with score: " + this.score);
            location.reload();
        }, 500)        
    }

    lostLive() {
        if(--this.livesLeft) {
            this.livesElement.textContent = "" + this.livesLeft;
            this.gameState = GameState.BallNotReleased;
            this.ball.moveTo( this.ball.startPos );
            this.paddle.moveTo( this.paddle.startPos );
        } else {
            this.gameState = GameState.GameOver;
            alert("You lost");
            location.reload();
        }
             
    }

    run() {
        document.addEventListener("keyup", (e) => this.keyMap[e.keyCode] = false);
        document.addEventListener("keydown", (e) => this.keyMap[e.keyCode] = true);
        document.addEventListener("keydown", (e) => {
            if(this.gameState == GameState.BallNotReleased){
                if(e.keyCode == 32) {
                    this.ball.release();
                    this.gameState = GameState.Running;
                }
            }
        })

        setInterval(() => {
            if (this.gameState === GameState.GameOver) {
                return;
            }

            var newBallPosition = this.ball.calculateNewPosition();

            if(this.keyMap[KeyCodes.LEFT]) {
                this.paddle.moveLeft(5);
                if(this.gameState == GameState.BallNotReleased)
                    this.ball.moveLeft(5, this.paddle.width() );
            } else if (this.keyMap[KeyCodes.RIGHT]) {
                this.paddle.moveRight(5);
                if(this.gameState == GameState.BallNotReleased)
                    this.ball.moveRight(5, this.paddle.width() );
            }

            if (this.gameState !== GameState.Running) {
                return;
            }

            if(this.wallBottom.checkCollision(newBallPosition)) {
                this.lostLive();
                return;
            } 

            if ( this.wallLeft.checkCollision(newBallPosition) || this.wallRight.checkCollision(newBallPosition) )
                this.ball.bounceHorizontal();
            else if ( this.wallTop.checkCollision(newBallPosition) )
                this.ball.bounceVertical();

            

            for (let brick of this.bricks) {
                let wasHit: boolean = false;

                switch(brick.checkCollision(newBallPosition)) {
                case (Side.Left):
                case (Side.Right):
                    this.ball.bounceHorizontal();
                    wasHit = true;
                    break;

                case (Side.Top):
                case (Side.Bottom):
                    this.ball.bounceVertical();
                    wasHit = true;
                    break;        
            }

                if (wasHit) {
                    this.addScore(brick.score);
                    this.bricksLeft--;

                    if(brick instanceof SuperBrick) {
                        let index = this.bricks.indexOf(brick);
                        this.bricks[index] = new Brick(brick.sprite, this.normalBrickScore)
                    } else {
                        brick.hide();
                    }

                    if(this.bricksLeft == 0) {
                        this.won();
                    }

                    break;
                }
            }

            if(this.paddle.checkCollision(newBallPosition)) {
                this.ball.bounceWithAngle(this.paddle.calculateHitAngle(this.ball.centerX(), this.ball.radius));
            }

            this.ball.moveTo(this.ball.calculateNewPosition());

        }, this.loopInterval)
    }
}

var game = new Game(
    <HTMLElement>document.querySelector(".ball"),
    <HTMLElement>document.querySelector(".paddle"),
    <HTMLCollection>document.getElementsByClassName("brick"),
    <HTMLElement>document.querySelector(".game-board"),
    <HTMLElement>document.querySelector("#game-stats")
);

game.run();