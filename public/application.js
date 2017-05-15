(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (point) {
        this.x += point.x;
        this.y += point.y;
    };
    return Point;
}());
var Rect = (function () {
    function Rect(top, left, bottom, right) {
        this.topLeft = new Point(left, top);
        this.bottomRight = new Point(right, bottom);
    }
    Rect.prototype.clone = function () {
        return new Rect(this.topLeft.y, this.topLeft.x, this.bottomRight.y, this.bottomRight.x);
    };
    Rect.prototype.add = function (point) {
        this.topLeft.add(point);
        this.bottomRight.add(point);
    };
    Rect.prototype.moveLeft = function (step) {
        this.topLeft.x -= step;
        this.bottomRight.x -= step;
    };
    Rect.prototype.moveRight = function (step) {
        this.topLeft.x += step;
        this.bottomRight.x += step;
    };
    Rect.prototype.moveTo = function (rect) {
        this.topLeft = rect.topLeft;
        this.bottomRight = rect.bottomRight;
    };
    Rect.prototype.width = function () {
        return this.bottomRight.x - this.topLeft.x;
    };
    Rect.prototype.height = function () {
        return this.bottomRight.y - this.topLeft.y;
    };
    Rect.prototype.centerX = function () {
        return (this.topLeft.x + this.bottomRight.x) / 2;
    };
    Rect.prototype.centerY = function () {
        return (this.topLeft.y + this.bottomRight.y) / 2;
    };
    return Rect;
}());
var Vector = (function (_super) {
    __extends(Vector, _super);
    function Vector() {
        _super.apply(this, arguments);
    }
    Vector.prototype.flipX = function () {
        this.x *= -1;
    };
    Vector.prototype.flipY = function () {
        this.y *= -1;
    };
    return Vector;
}(Point));
var Side;
(function (Side) {
    Side[Side["None"] = 0] = "None";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Right"] = 3] = "Right";
    Side[Side["Bottom"] = 4] = "Bottom";
})(Side || (Side = {}));
var Obstacle = (function (_super) {
    __extends(Obstacle, _super);
    function Obstacle() {
        _super.apply(this, arguments);
    }
    Obstacle.prototype.checkCollision = function (anotherRect) {
        var w = 0.5 * (this.width() + anotherRect.width());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();
        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var wy = w * dy;
            var hx = h * dx;
            if (wy > hx) {
                return wy > -hx ? Side.Top : Side.Left;
            }
            else {
                return wy > -hx ? Side.Right : Side.Bottom;
            }
        }
        else {
            return Side.None;
        }
    };
    return Obstacle;
}(Rect));
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(sprite, maxRight) {
        var bottom = sprite.offsetTop + sprite.offsetHeight, top = sprite.offsetTop, left = sprite.offsetLeft, right = sprite.offsetLeft + sprite.offsetWidth;
        _super.call(this, top, left, bottom, right);
        this.startPos = new Rect(top, left, bottom, right);
        this.sprite = sprite;
        this.maxRight = maxRight;
        this.isVisible = true;
    }
    Sprite.prototype.moveTo = function (rect) {
        _super.prototype.moveTo.call(this, rect);
        var _a = rect.topLeft, posX = _a.x, posY = _a.y;
        this.sprite.style.left = posX + 'px';
        this.sprite.style.top = posY + 'px';
    };
    Sprite.prototype.moveLeft = function (step, offset) {
        var newPosition = this.clone();
        newPosition.moveLeft(step);
        offset = offset || 0;
        if (newPosition.topLeft.x - offset >= 0)
            this.moveTo(newPosition);
    };
    Sprite.prototype.moveRight = function (step, offset) {
        var newPosition = this.clone();
        newPosition.moveRight(step);
        offset = offset || 0;
        if (newPosition.bottomRight.x + offset <= this.maxRight)
            this.moveTo(newPosition);
    };
    Sprite.prototype.hide = function () {
        this.sprite.style.display = "none";
        this.isVisible = false;
    };
    Sprite.prototype.checkCollision = function (anotherRect) {
        if (!this.isVisible) {
            return Side.None;
        }
        return _super.prototype.checkCollision.call(this, anotherRect);
    };
    return Sprite;
}(Obstacle));
var Paddle = (function (_super) {
    __extends(Paddle, _super);
    function Paddle(sprite, maxRight) {
        _super.call(this, sprite, maxRight);
    }
    Paddle.prototype.calculateHitAngle = function (ballX, ballRadius) {
        var hitSpot = ballX - this.topLeft.x;
        var maxPaddle = this.width() + ballRadius;
        var minPaddle = -ballRadius;
        var paddleRange = maxPaddle - minPaddle;
        var minAngle = 160;
        var maxAngle = 20;
        var angleRange = maxAngle - minAngle;
        return ((hitSpot * angleRange) / paddleRange) + minAngle;
    };
    return Paddle;
}(Sprite));
var Ball = (function (_super) {
    __extends(Ball, _super);
    function Ball(sprite, velocity, maxRight) {
        var radius = parseInt(getComputedStyle(sprite)['border-radius']);
        var pos = new Point(sprite.offsetLeft, sprite.offsetTop);
        _super.call(this, sprite, maxRight);
        this.sprite = sprite;
        this.radius = radius;
        this.velocity = velocity;
        this.dir = new Vector(0, 0);
    }
    ;
    Ball.prototype.calculateNewPosition = function () {
        var newPosition = this.clone();
        newPosition.add(this.dir);
        return newPosition;
    };
    Ball.prototype.moveLeft = function (step, paddleWidth) {
        var newPosition = this.clone();
        newPosition.moveLeft(step);
        var offset = (paddleWidth / 2) - this.radius || 0;
        return _super.prototype.moveLeft.call(this, step, offset);
    };
    Ball.prototype.moveRight = function (step, paddleWidth) {
        var newPosition = this.clone();
        newPosition.moveRight(step);
        var offset = (paddleWidth / 2) - this.radius || 0;
        return _super.prototype.moveRight.call(this, step, offset);
    };
    Ball.prototype.bounceHorizontal = function () {
        this.dir.flipX();
    };
    Ball.prototype.bounceVertical = function () {
        this.dir.flipY();
    };
    Ball.prototype.bounceWithAngle = function (angle) {
        angle = angle * (Math.PI / 180);
        this.dir.x = Math.cos(angle) * this.velocity;
        this.dir.y = -Math.sin(angle) * this.velocity;
    };
    Ball.prototype.release = function () {
        var random = Math.random() < 0.5 ? -1 : 1;
        this.dir = new Vector(random, -this.velocity);
    };
    Ball.prototype.moveTo = function (rect) {
        _super.prototype.moveTo.call(this, rect);
        var _a = rect.topLeft, posX = _a.x, posY = _a.y;
        this.sprite.style.left = posX + 'px';
        this.sprite.style.top = posY + 'px';
    };
    return Ball;
}(Sprite));
var Brick = (function (_super) {
    __extends(Brick, _super);
    function Brick(sprite, score) {
        _super.call(this, sprite);
        this.sprite.classList.remove('super');
        this.score = score;
    }
    return Brick;
}(Sprite));
var SuperBrick = (function (_super) {
    __extends(SuperBrick, _super);
    function SuperBrick(sprite, score) {
        _super.call(this, sprite, score);
        this.sprite.classList.add('super');
        this.score = score;
    }
    return SuperBrick;
}(Brick));
var GameState;
(function (GameState) {
    GameState[GameState["BallNotReleased"] = 0] = "BallNotReleased";
    GameState[GameState["Running"] = 1] = "Running";
    GameState[GameState["GameOver"] = 2] = "GameOver";
})(GameState || (GameState = {}));
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["LEFT"] = 37] = "LEFT";
    KeyCodes[KeyCodes["RIGHT"] = 39] = "RIGHT";
})(KeyCodes || (KeyCodes = {}));
var Game = (function () {
    function Game(ballElement, paddleElement, bricks, boardElement, statsElement) {
        this.loopInterval = 10;
        this.paddleStep = 30;
        this.velocity = 5;
        this.normalBrickScore = 10;
        this.superBrickScore = 30;
        this.bricksLeft = 0;
        this.livesLeft = 3;
        this.min_PercentOfSuperBricks = 10;
        this.max_PercentOfSuperBricks = 40;
        this.bricks = [];
        this.keyMap = {};
        this.gameState = GameState.BallNotReleased;
        this.boardElement = boardElement;
        this.livesElement = statsElement.querySelector("#lives");
        this.scoreElement = statsElement.querySelector("#score");
        this.paddle = new Paddle(paddleElement, boardElement.offsetWidth);
        this.ball = new Ball(ballElement, this.velocity, boardElement.offsetWidth);
        var superBricksCount = this.countOfSuperBricks(bricks.length);
        var superBricksIndexes = this.indexesOfSuperBricks(superBricksCount, bricks.length);
        for (var i = 0; i < bricks.length; i++) {
            var brick = void 0;
            if (superBricksIndexes.indexOf(i) > -1) {
                brick = new SuperBrick(bricks[i], this.superBrickScore);
                this.bricksLeft += 2;
            }
            else {
                brick = new Brick(bricks[i], this.normalBrickScore);
                this.bricksLeft++;
            }
            this.bricks.push(brick);
        }
        this.createWalls(this.ball.radius, this.boardElement.offsetWidth, this.boardElement.offsetHeight);
        this.newGame();
    }
    Game.prototype.countOfSuperBricks = function (allBricksCount) {
        var min = this.min_PercentOfSuperBricks;
        var max = this.max_PercentOfSuperBricks;
        var percent = (Math.random() * (max - min) + min) / 100;
        var count = Math.round(allBricksCount * percent);
        return count;
    };
    Game.prototype.indexesOfSuperBricks = function (superBricksCount, allBricksCount) {
        var indexes = [];
        for (var i = 0; i < superBricksCount; i++) {
            var index = void 0;
            do {
                index = Math.round(Math.random() * (allBricksCount - 1));
            } while (indexes.indexOf(index) != -1);
            indexes.push(index);
        }
        return indexes;
    };
    Game.prototype.createWalls = function (radius, maxX, maxY) {
        this.wallLeft = new Obstacle(-radius, -radius, maxY + radius, 0);
        this.wallTop = new Obstacle(-radius, -radius, 0, maxX + radius);
        this.wallRight = new Obstacle(-radius, maxX, maxY + radius, maxX + radius);
        this.wallBottom = new Obstacle(maxY, -radius, maxY + radius, maxX + radius);
    };
    ;
    Game.prototype.newGame = function () {
        this.livesLeft = this.livesLeft | 3;
        this.livesElement.textContent = "" + this.livesLeft;
        this.scoreElement.textContent = "0";
    };
    Game.prototype.addScore = function (points) {
        points = points || 10;
        this.score = parseInt(this.scoreElement.textContent) + points;
        this.scoreElement.textContent = "" + this.score;
    };
    Game.prototype.won = function () {
        var _this = this;
        setTimeout(function () {
            _this.gameState = GameState.GameOver;
            alert("You won with score: " + _this.score);
            location.reload();
        }, 500);
    };
    Game.prototype.lostLive = function () {
        if (--this.livesLeft) {
            this.livesElement.textContent = "" + this.livesLeft;
            this.gameState = GameState.BallNotReleased;
            this.ball.moveTo(this.ball.startPos);
            this.paddle.moveTo(this.paddle.startPos);
        }
        else {
            this.gameState = GameState.GameOver;
            alert("You lost");
            location.reload();
        }
    };
    Game.prototype.run = function () {
        var _this = this;
        document.addEventListener("keyup", function (e) { return _this.keyMap[e.keyCode] = false; });
        document.addEventListener("keydown", function (e) { return _this.keyMap[e.keyCode] = true; });
        document.addEventListener("keydown", function (e) {
            if (_this.gameState == GameState.BallNotReleased) {
                if (e.keyCode == 32) {
                    _this.ball.release();
                    _this.gameState = GameState.Running;
                }
            }
        });
        setInterval(function () {
            if (_this.gameState === GameState.GameOver) {
                return;
            }
            var newBallPosition = _this.ball.calculateNewPosition();
            if (_this.keyMap[KeyCodes.LEFT]) {
                _this.paddle.moveLeft(5);
                if (_this.gameState == GameState.BallNotReleased)
                    _this.ball.moveLeft(5, _this.paddle.width());
            }
            else if (_this.keyMap[KeyCodes.RIGHT]) {
                _this.paddle.moveRight(5);
                if (_this.gameState == GameState.BallNotReleased)
                    _this.ball.moveRight(5, _this.paddle.width());
            }
            if (_this.gameState !== GameState.Running) {
                return;
            }
            if (_this.wallBottom.checkCollision(newBallPosition)) {
                _this.lostLive();
                return;
            }
            if (_this.wallLeft.checkCollision(newBallPosition) || _this.wallRight.checkCollision(newBallPosition))
                _this.ball.bounceHorizontal();
            else if (_this.wallTop.checkCollision(newBallPosition))
                _this.ball.bounceVertical();
            for (var _i = 0, _a = _this.bricks; _i < _a.length; _i++) {
                var brick = _a[_i];
                var wasHit = false;
                switch (brick.checkCollision(newBallPosition)) {
                    case (Side.Left):
                    case (Side.Right):
                        _this.ball.bounceHorizontal();
                        wasHit = true;
                        break;
                    case (Side.Top):
                    case (Side.Bottom):
                        _this.ball.bounceVertical();
                        wasHit = true;
                        break;
                }
                if (wasHit) {
                    _this.addScore(brick.score);
                    _this.bricksLeft--;
                    if (brick instanceof SuperBrick) {
                        var index = _this.bricks.indexOf(brick);
                        _this.bricks[index] = new Brick(brick.sprite, _this.normalBrickScore);
                    }
                    else {
                        brick.hide();
                    }
                    if (_this.bricksLeft == 0) {
                        _this.won();
                    }
                    break;
                }
            }
            if (_this.paddle.checkCollision(newBallPosition)) {
                _this.ball.bounceWithAngle(_this.paddle.calculateHitAngle(_this.ball.centerX(), _this.ball.radius));
            }
            _this.ball.moveTo(_this.ball.calculateNewPosition());
        }, this.loopInterval);
    };
    return Game;
}());
var game = new Game(document.querySelector(".ball"), document.querySelector(".paddle"), document.getElementsByClassName("brick"), document.querySelector(".game-board"), document.querySelector("#game-stats"));
game.run();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHBsaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUE7SUFJSSxlQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRUQsbUJBQUcsR0FBSCxVQUFJLEtBQVk7UUFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0FiQSxBQWFDLElBQUE7QUFFRDtJQUlJLGNBQVksR0FBVyxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsS0FBYTtRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRCxrQkFBRyxHQUFILFVBQUksS0FBWTtRQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7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QyxDQUFDO1FBRXZELENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDekIsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQXROQSxBQXNOQyxJQUFBO0FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQ0YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFDL0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFDOUIsUUFBUSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUMzQyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUNyQyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUNyRCxDQUFDO0FBRUYsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFBvaW50IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKHBvaW50OiBQb2ludCkge1xyXG4gICAgICAgIHRoaXMueCArPSBwb2ludC54O1xyXG4gICAgICAgIHRoaXMueSArPSBwb2ludC55O1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSZWN0e1xyXG4gICAgdG9wTGVmdDogUG9pbnQ7XHJcbiAgICBib3R0b21SaWdodDogUG9pbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IodG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgYm90dG9tOiBudW1iZXIsIHJpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQobGVmdCwgdG9wKTtcclxuICAgICAgICB0aGlzLmJvdHRvbVJpZ2h0ID0gbmV3IFBvaW50KHJpZ2h0LCBib3R0b20pO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgY2xvbmUoKTogUmVjdCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWN0KHRoaXMudG9wTGVmdC55LCB0aGlzLnRvcExlZnQueCwgdGhpcy5ib3R0b21SaWdodC55LCB0aGlzLmJvdHRvbVJpZ2h0LngpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZChwb2ludDogUG9pbnQpIHtcclxuICAgICAgICB0aGlzLnRvcExlZnQuYWRkKHBvaW50KTtcclxuICAgICAgICB0aGlzLmJvdHRvbVJpZ2h0LmFkZChwb2ludCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoc3RlcDogbnVtYmVyKXtcclxuICAgICAgICB0aGlzLnRvcExlZnQueCAtPSBzdGVwO1xyXG4gICAgICAgIHRoaXMuYm90dG9tUmlnaHQueCAtPSBzdGVwO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodChzdGVwOiBudW1iZXIpe1xyXG4gICAgICAgIHRoaXMudG9wTGVmdC54ICs9IHN0ZXA7XHJcbiAgICAgICAgdGhpcy5ib3R0b21SaWdodC54ICs9IHN0ZXA7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVRvKHJlY3Q6IFJlY3QpIHtcclxuICAgICAgICB0aGlzLnRvcExlZnQgPSByZWN0LnRvcExlZnQ7XHJcbiAgICAgICAgdGhpcy5ib3R0b21SaWdodCA9IHJlY3QuYm90dG9tUmlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgd2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm90dG9tUmlnaHQueCAtIHRoaXMudG9wTGVmdC54O1xyXG4gICAgfVxyXG5cclxuICAgIGhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ib3R0b21SaWdodC55IC0gdGhpcy50b3BMZWZ0Lnk7XHJcbiAgICB9XHJcblxyXG4gICAgY2VudGVyWCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMudG9wTGVmdC54ICsgdGhpcy5ib3R0b21SaWdodC54KSAvIDI7XHJcbiAgICB9XHJcblxyXG4gICAgY2VudGVyWSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMudG9wTGVmdC55ICsgdGhpcy5ib3R0b21SaWdodC55KSAvIDI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFZlY3RvciBleHRlbmRzIFBvaW50IHtcclxuICAgIGZsaXBYKCkge1xyXG4gICAgICAgIHRoaXMueCAqPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICBmbGlwWSgpIHtcclxuICAgICAgICB0aGlzLnkgKj0gLTE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmVudW0gU2lkZSB7XHJcbiAgICBOb25lLFxyXG4gICAgTGVmdCxcclxuICAgIFRvcCxcclxuICAgIFJpZ2h0LFxyXG4gICAgQm90dG9tXHJcbn1cclxuXHJcbmNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgUmVjdCB7XHJcbiAgICBjaGVja0NvbGxpc2lvbihhbm90aGVyUmVjdDogUmVjdCk6IFNpZGV7XHJcbiAgICAgICAgdmFyIHcgPSAwLjUgKiAodGhpcy53aWR0aCgpICsgYW5vdGhlclJlY3Qud2lkdGgoKSk7XHJcbiAgICAgICAgdmFyIGggPSAwLjUgKiAodGhpcy5oZWlnaHQoKSArIGFub3RoZXJSZWN0LmhlaWdodCgpKTtcclxuICAgICAgICB2YXIgZHggPSB0aGlzLmNlbnRlclgoKSAtIGFub3RoZXJSZWN0LmNlbnRlclgoKTtcclxuICAgICAgICB2YXIgZHkgPSB0aGlzLmNlbnRlclkoKSAtIGFub3RoZXJSZWN0LmNlbnRlclkoKTtcclxuXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKGR4KSA8PSB3ICYmIE1hdGguYWJzKGR5KSA8PSBoKSB7XHJcbiAgICAgICAgICAgIHZhciB3eSA9IHcgKiBkeTtcclxuICAgICAgICAgICAgdmFyIGh4ID0gaCAqIGR4O1xyXG5cclxuICAgICAgICAgICAgaWYod3kgPiBoeCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHd5ID4gLWh4ID8gU2lkZS5Ub3AgOiBTaWRlLkxlZnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd3kgPiAtaHggPyBTaWRlLlJpZ2h0IDogU2lkZS5Cb3R0b207XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gU2lkZS5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgIH0gICBcclxufVxyXG5cclxuY2xhc3MgU3ByaXRlIGV4dGVuZHMgT2JzdGFjbGUge1xyXG4gICAgc3ByaXRlOiBIVE1MRWxlbWVudDtcclxuICAgIGlzVmlzaWJsZTogQm9vbGVhbjtcclxuICAgIG1heFJpZ2h0OiBudW1iZXI7XHJcbiAgICBzdGFydFBvczogUmVjdDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGU6IEhUTUxFbGVtZW50LCBtYXhSaWdodD86IG51bWJlcikge1xyXG4gICAgICAgIGxldCBib3R0b20gPSBzcHJpdGUub2Zmc2V0VG9wICsgc3ByaXRlLm9mZnNldEhlaWdodCxcclxuICAgICAgICAgICAgdG9wID0gIHNwcml0ZS5vZmZzZXRUb3AsXHJcbiAgICAgICAgICAgIGxlZnQgPSBzcHJpdGUub2Zmc2V0TGVmdCxcclxuICAgICAgICAgICAgcmlnaHQgPSBzcHJpdGUub2Zmc2V0TGVmdCArIHNwcml0ZS5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgc3VwZXIodG9wLCBsZWZ0LCBib3R0b20sIHJpZ2h0KTtcclxuICAgICAgICB0aGlzLnN0YXJ0UG9zID0gbmV3IFJlY3QodG9wLCBsZWZ0LCBib3R0b20sIHJpZ2h0KTtcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICB0aGlzLm1heFJpZ2h0ID0gbWF4UmlnaHQ7XHJcbiAgICAgICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBtb3ZlVG8ocmVjdDogUmVjdCkge1xyXG4gICAgICAgIHN1cGVyLm1vdmVUbyhyZWN0KTtcclxuXHJcbiAgICAgICAgbGV0IHt4OiBwb3NYLCB5OiBwb3NZIH0gPSByZWN0LnRvcExlZnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zdHlsZS5sZWZ0ID0gcG9zWCArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnN0eWxlLnRvcCA9IHBvc1kgKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgICBtb3ZlTGVmdChzdGVwOiBudW1iZXIsIG9mZnNldD86IG51bWJlcikge1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuY2xvbmUoKTtcclxuICAgICAgICBuZXdQb3NpdGlvbi5tb3ZlTGVmdChzdGVwKTtcclxuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuXHJcbiAgICAgICAgaWYobmV3UG9zaXRpb24udG9wTGVmdC54IC0gb2Zmc2V0ID49IDAgKVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVUbyhuZXdQb3NpdGlvbik7XHJcbiAgICB9c1xyXG5cclxuICAgIG1vdmVSaWdodChzdGVwOiBudW1iZXIsIG9mZnNldD86IG51bWJlcikge1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuY2xvbmUoKTtcclxuICAgICAgICBuZXdQb3NpdGlvbi5tb3ZlUmlnaHQoc3RlcCk7XHJcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XHJcblxyXG4gICAgICAgIGlmKG5ld1Bvc2l0aW9uLmJvdHRvbVJpZ2h0LnggKyBvZmZzZXQgPD0gdGhpcy5tYXhSaWdodCApXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVRvKG5ld1Bvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrQ29sbGlzaW9uKGFub3RoZXJSZWN0OiBSZWN0KTogU2lkZXtcclxuICAgICAgICBpZighdGhpcy5pc1Zpc2libGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNpZGUuTm9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNoZWNrQ29sbGlzaW9uKGFub3RoZXJSZWN0KTtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbmNsYXNzIFBhZGRsZSBleHRlbmRzIFNwcml0ZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGU6IEhUTUxFbGVtZW50LCBtYXhSaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc3ByaXRlLCBtYXhSaWdodClcclxuICAgIH1cclxuXHJcblxyXG4gICAgY2FsY3VsYXRlSGl0QW5nbGUoYmFsbFg6IG51bWJlciwgYmFsbFJhZGl1czogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICB2YXIgaGl0U3BvdCA9IGJhbGxYIC0gdGhpcy50b3BMZWZ0Lng7XHJcbiAgICAgICAgdmFyIG1heFBhZGRsZSA9IHRoaXMud2lkdGgoKSArIGJhbGxSYWRpdXM7XHJcbiAgICAgICAgdmFyIG1pblBhZGRsZSA9IC1iYWxsUmFkaXVzO1xyXG4gICAgICAgIHZhciBwYWRkbGVSYW5nZSA9IG1heFBhZGRsZSAtIG1pblBhZGRsZTsgICAgICAgXHJcblxyXG4gICAgICAgIHZhciBtaW5BbmdsZSA9IDE2MDtcclxuICAgICAgICB2YXIgbWF4QW5nbGUgPSAyMDtcclxuICAgICAgICB2YXIgYW5nbGVSYW5nZSA9IG1heEFuZ2xlIC0gbWluQW5nbGU7XHJcblxyXG4gICAgICAgIHJldHVybiAoKGhpdFNwb3QgKiBhbmdsZVJhbmdlKSAvIHBhZGRsZVJhbmdlKSArIG1pbkFuZ2xlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCYWxsIGV4dGVuZHMgU3ByaXRlIHtcclxuICAgIHNwcml0ZTogSFRNTEVsZW1lbnQ7XHJcbiAgICByYWRpdXM6IG51bWJlcjtcclxuICAgIGRpcjogVmVjdG9yO1xyXG4gICAgdmVsb2NpdHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGU6IEhUTUxFbGVtZW50LCB2ZWxvY2l0eTogbnVtYmVyLCBtYXhSaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoc3ByaXRlKVsnYm9yZGVyLXJhZGl1cyddKTtcclxuICAgICAgICBsZXQgcG9zID0gbmV3IFBvaW50KHNwcml0ZS5vZmZzZXRMZWZ0LCBzcHJpdGUub2Zmc2V0VG9wKTtcclxuICAgICAgICBzdXBlcihzcHJpdGUsIG1heFJpZ2h0KTtcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy5kaXIgPSBuZXcgVmVjdG9yKDAsMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNhbGN1bGF0ZU5ld1Bvc2l0aW9uKCk6IFJlY3Qge1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuY2xvbmUoKTtcclxuICAgICAgICBuZXdQb3NpdGlvbi5hZGQodGhpcy5kaXIpO1xyXG4gICAgICAgIHJldHVybiBuZXdQb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIG1vdmVMZWZ0KHN0ZXA6IG51bWJlciwgcGFkZGxlV2lkdGg6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuY2xvbmUoKTtcclxuICAgICAgICBuZXdQb3NpdGlvbi5tb3ZlTGVmdChzdGVwKTtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gKHBhZGRsZVdpZHRoIC8gMikgLSB0aGlzLnJhZGl1cyB8fCAwO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VwZXIubW92ZUxlZnQoc3RlcCwgb2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUmlnaHQoc3RlcDogbnVtYmVyLCBwYWRkbGVXaWR0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIG5ld1Bvc2l0aW9uLm1vdmVSaWdodChzdGVwKTtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gKHBhZGRsZVdpZHRoIC8gMikgLSB0aGlzLnJhZGl1cyB8fCAwO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VwZXIubW92ZVJpZ2h0KHN0ZXAsIG9mZnNldCk7XHJcbiAgICB9XHJcblxyXG4gICAgYm91bmNlSG9yaXpvbnRhbCgpIHtcclxuICAgICAgICB0aGlzLmRpci5mbGlwWCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGJvdW5jZVZlcnRpY2FsKCkge1xyXG4gICAgICAgIHRoaXMuZGlyLmZsaXBZKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYm91bmNlV2l0aEFuZ2xlKGFuZ2xlOiBudW1iZXIpIHtcclxuICAgICAgICBhbmdsZSA9IGFuZ2xlICooTWF0aC5QSSAvIDE4MCk7XHJcbiAgICAgICAgdGhpcy5kaXIueCA9IE1hdGguY29zKGFuZ2xlKSAqIHRoaXMudmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy5kaXIueSA9IC1NYXRoLnNpbihhbmdsZSkgKiB0aGlzLnZlbG9jaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIHJlbGVhc2UoKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbSA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyAtMSA6IDE7XHJcbiAgICAgICAgdGhpcy5kaXIgPW5ldyBWZWN0b3IocmFuZG9tLCAtdGhpcy52ZWxvY2l0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVRvKHJlY3Q6IFJlY3QpIHtcclxuICAgICAgICBzdXBlci5tb3ZlVG8ocmVjdCk7XHJcblxyXG4gICAgICAgIGxldCB7eDogcG9zWCwgeTogcG9zWSB9ID0gcmVjdC50b3BMZWZ0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuc3R5bGUubGVmdCA9IHBvc1ggKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zdHlsZS50b3AgPSBwb3NZICsgJ3B4JztcclxuICAgIH1cclxufSAgIFxyXG5cclxuY2xhc3MgQnJpY2sgZXh0ZW5kcyBTcHJpdGUge1xyXG4gICAgc2NvcmUgOm51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGU6IEhUTUxFbGVtZW50LCBzY29yZSA6bnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc3ByaXRlKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5jbGFzc0xpc3QucmVtb3ZlKCdzdXBlcicpO1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICAgIH0gXHJcbn1cclxuXHJcbmNsYXNzIFN1cGVyQnJpY2sgZXh0ZW5kcyBCcmljayB7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3ByaXRlOiBIVE1MRWxlbWVudCwgc2NvcmUgOm51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHNwcml0ZSwgc2NvcmUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmNsYXNzTGlzdC5hZGQoJ3N1cGVyJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG4gICAgfSBcclxufVxyXG5cclxuZW51bSBHYW1lU3RhdGUge1xyXG4gICAgQmFsbE5vdFJlbGVhc2VkLFxyXG4gICAgUnVubmluZyxcclxuICAgIEdhbWVPdmVyICAgICAgIFxyXG59XHJcblxyXG5lbnVtIEtleUNvZGVzIHtcclxuICAgIExFRlQgPSAzNyxcclxuICAgIFJJR0hUID0gMzlcclxufVxyXG5cclxuY2xhc3MgR2FtZSB7XHJcbiAgICBsb29wSW50ZXJ2YWw6IG51bWJlciA9IDEwO1xyXG4gICAgcGFkZGxlU3RlcDogbnVtYmVyID0gMzA7XHJcbiAgICB2ZWxvY2l0eTogbnVtYmVyID0gNTtcclxuICAgIG5vcm1hbEJyaWNrU2NvcmU6IG51bWJlciA9IDEwO1xyXG4gICAgc3VwZXJCcmlja1Njb3JlOiBudW1iZXIgPSAzMDtcclxuICAgIGJyaWNrc0xlZnQ6IG51bWJlciA9IDA7XHJcbiAgICBsaXZlc0xlZnQ6IG51bWJlciA9IDM7XHJcbiAgICBzY29yZTogbnVtYmVyO1xyXG5cclxuICAgIG1pbl9QZXJjZW50T2ZTdXBlckJyaWNrczogbnVtYmVyID0gMTA7XHJcbiAgICBtYXhfUGVyY2VudE9mU3VwZXJCcmlja3M6IG51bWJlciA9IDQwO1xyXG4gICAgXHJcbiAgICBiYWxsRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBib2FyZEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gICAgbGl2ZXNFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgc2NvcmVFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgYmFsbDogQmFsbDtcclxuICAgIHBhZGRsZTogUGFkZGxlO1xyXG4gICAgYnJpY2tzOiBBcnJheTxCcmljaz4gPSBbXTtcclxuXHJcbiAgICBnYW1lU3RhdGU6IEdhbWVTdGF0ZTtcclxuICAgIGtleU1hcCA9e307XHJcblxyXG4gICAgd2FsbExlZnQ6IE9ic3RhY2xlO1xyXG4gICAgd2FsbFRvcDogT2JzdGFjbGU7XHJcbiAgICB3YWxsUmlnaHQ6IE9ic3RhY2xlO1xyXG4gICAgd2FsbEJvdHRvbTogT2JzdGFjbGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYmFsbEVsZW1lbnQ6IEhUTUxFbGVtZW50LCBwYWRkbGVFbGVtZW50OiBIVE1MRWxlbWVudCwgYnJpY2tzOiBIVE1MQ29sbGVjdGlvbiwgYm9hcmRFbGVtZW50OiBIVE1MRWxlbWVudCwgc3RhdHNFbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLkJhbGxOb3RSZWxlYXNlZDtcclxuICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IGJvYXJkRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxpdmVzRWxlbWVudCA9IHN0YXRzRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI2xpdmVzXCIpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc3RhdHNFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIik7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlID0gbmV3IFBhZGRsZSAocGFkZGxlRWxlbWVudCwgYm9hcmRFbGVtZW50Lm9mZnNldFdpZHRoKVxyXG4gICAgICAgIHRoaXMuYmFsbCA9IG5ldyBCYWxsIChiYWxsRWxlbWVudCwgdGhpcy52ZWxvY2l0eSwgYm9hcmRFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3VwZXJCcmlja3NDb3VudDpudW1iZXIgPSB0aGlzLmNvdW50T2ZTdXBlckJyaWNrcyhicmlja3MubGVuZ3RoKTtcclxuICAgICAgICBsZXQgc3VwZXJCcmlja3NJbmRleGVzOkFycmF5PG51bWJlcj4gPSB0aGlzLmluZGV4ZXNPZlN1cGVyQnJpY2tzKHN1cGVyQnJpY2tzQ291bnQsIGJyaWNrcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBicmlja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGJyaWNrOiBCcmljaztcclxuICAgIFxyXG4gICAgICAgICAgICBpZihzdXBlckJyaWNrc0luZGV4ZXMuaW5kZXhPZihpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBicmljayA9IG5ldyBTdXBlckJyaWNrKDxIVE1MRWxlbWVudD5icmlja3NbaV0sIHRoaXMuc3VwZXJCcmlja1Njb3JlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJpY2tzTGVmdCArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJpY2sgPSBuZXcgQnJpY2soPEhUTUxFbGVtZW50PmJyaWNrc1tpXSwgdGhpcy5ub3JtYWxCcmlja1Njb3JlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJpY2tzTGVmdCArKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5icmlja3MucHVzaChicmljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdhbGxzKHRoaXMuYmFsbC5yYWRpdXMsIHRoaXMuYm9hcmRFbGVtZW50Lm9mZnNldFdpZHRoLCB0aGlzLmJvYXJkRWxlbWVudC5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMubmV3R2FtZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb3VudE9mU3VwZXJCcmlja3MoYWxsQnJpY2tzQ291bnQpIHtcclxuICAgICAgICBsZXQgbWluID0gdGhpcy5taW5fUGVyY2VudE9mU3VwZXJCcmlja3M7XHJcbiAgICAgICAgbGV0IG1heCA9IHRoaXMubWF4X1BlcmNlbnRPZlN1cGVyQnJpY2tzO1xyXG4gICAgICAgIGxldCBwZXJjZW50ID0gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbikgLyAxMDA7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gTWF0aC5yb3VuZChhbGxCcmlja3NDb3VudCAqIHBlcmNlbnQpO1xyXG5cclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgaW5kZXhlc09mU3VwZXJCcmlja3Moc3VwZXJCcmlja3NDb3VudCwgYWxsQnJpY2tzQ291bnQpIHtcclxuICAgICAgICBsZXQgaW5kZXhlczogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgc3VwZXJCcmlja3NDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXI7XHJcblxyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChhbGxCcmlja3NDb3VudC0xKSk7XHJcbiAgICAgICAgICAgIH13aGlsZShpbmRleGVzLmluZGV4T2YoaW5kZXgpICE9IC0xKVxyXG5cclxuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbmRleGVzO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVdhbGxzKHJhZGl1czogbnVtYmVyLCBtYXhYOiBudW1iZXIsIG1heFk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMud2FsbExlZnQgPSBuZXcgT2JzdGFjbGUoLSByYWRpdXMsIC0gcmFkaXVzLCBtYXhZICsgcmFkaXVzLCAwKTtcclxuICAgICAgICB0aGlzLndhbGxUb3AgPSBuZXcgT2JzdGFjbGUoLSByYWRpdXMsIC0gcmFkaXVzLCAwLCBtYXhYICsgcmFkaXVzKTtcclxuICAgICAgICB0aGlzLndhbGxSaWdodCA9IG5ldyBPYnN0YWNsZSgtIHJhZGl1cywgbWF4WCwgbWF4WSArIHJhZGl1cywgbWF4WCArIHJhZGl1cyk7XHJcbiAgICAgICAgdGhpcy53YWxsQm90dG9tID0gbmV3IE9ic3RhY2xlKG1heFksIC0gcmFkaXVzLCBtYXhZICsgcmFkaXVzLCBtYXhYICsgcmFkaXVzKTsgICAgIFxyXG4gICAgfTtcclxuIFxyXG4gICAgbmV3R2FtZSgpIHtcclxuICAgICAgICB0aGlzLmxpdmVzTGVmdCA9IHRoaXMubGl2ZXNMZWZ0IHwgMztcclxuICAgICAgICB0aGlzLmxpdmVzRWxlbWVudC50ZXh0Q29udGVudCA9IFwiXCIgKyB0aGlzLmxpdmVzTGVmdDtcclxuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC50ZXh0Q29udGVudCA9IFwiMFwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhZGRTY29yZShwb2ludHM/OiBudW1iZXIpIHtcclxuICAgICAgICBwb2ludHMgPSBwb2ludHMgfHwgMTA7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IHBhcnNlSW50KHRoaXMuc2NvcmVFbGVtZW50LnRleHRDb250ZW50KSArIHBvaW50czsgIFxyXG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50LnRleHRDb250ZW50ID0gXCJcIiArIHRoaXMuc2NvcmU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHdvbigpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5HYW1lT3ZlcjtcclxuICAgICAgICAgICAgYWxlcnQoXCJZb3Ugd29uIHdpdGggc2NvcmU6IFwiICsgdGhpcy5zY29yZSk7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0sIDUwMCkgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGxvc3RMaXZlKCkge1xyXG4gICAgICAgIGlmKC0tdGhpcy5saXZlc0xlZnQpIHtcclxuICAgICAgICAgICAgdGhpcy5saXZlc0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIlwiICsgdGhpcy5saXZlc0xlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLkJhbGxOb3RSZWxlYXNlZDtcclxuICAgICAgICAgICAgdGhpcy5iYWxsLm1vdmVUbyggdGhpcy5iYWxsLnN0YXJ0UG9zICk7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLm1vdmVUbyggdGhpcy5wYWRkbGUuc3RhcnRQb3MgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5HYW1lT3ZlcjtcclxuICAgICAgICAgICAgYWxlcnQoXCJZb3UgbG9zdFwiKTtcclxuICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZSkgPT4gdGhpcy5rZXlNYXBbZS5rZXlDb2RlXSA9IGZhbHNlKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4gdGhpcy5rZXlNYXBbZS5rZXlDb2RlXSA9IHRydWUpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZ2FtZVN0YXRlID09IEdhbWVTdGF0ZS5CYWxsTm90UmVsZWFzZWQpe1xyXG4gICAgICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLnJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTdGF0ZSA9IEdhbWVTdGF0ZS5SdW5uaW5nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5HYW1lT3Zlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3QmFsbFBvc2l0aW9uID0gdGhpcy5iYWxsLmNhbGN1bGF0ZU5ld1Bvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmtleU1hcFtLZXlDb2Rlcy5MRUZUXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUubW92ZUxlZnQoNSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmdhbWVTdGF0ZSA9PSBHYW1lU3RhdGUuQmFsbE5vdFJlbGVhc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5tb3ZlTGVmdCg1LCB0aGlzLnBhZGRsZS53aWR0aCgpICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlNYXBbS2V5Q29kZXMuUklHSFRdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5tb3ZlUmlnaHQoNSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmdhbWVTdGF0ZSA9PSBHYW1lU3RhdGUuQmFsbE5vdFJlbGVhc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5tb3ZlUmlnaHQoNSwgdGhpcy5wYWRkbGUud2lkdGgoKSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lU3RhdGUgIT09IEdhbWVTdGF0ZS5SdW5uaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMud2FsbEJvdHRvbS5jaGVja0NvbGxpc2lvbihuZXdCYWxsUG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvc3RMaXZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICBpZiAoIHRoaXMud2FsbExlZnQuY2hlY2tDb2xsaXNpb24obmV3QmFsbFBvc2l0aW9uKSB8fCB0aGlzLndhbGxSaWdodC5jaGVja0NvbGxpc2lvbihuZXdCYWxsUG9zaXRpb24pIClcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5ib3VuY2VIb3Jpem9udGFsKCk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLndhbGxUb3AuY2hlY2tDb2xsaXNpb24obmV3QmFsbFBvc2l0aW9uKSApXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhbGwuYm91bmNlVmVydGljYWwoKTtcclxuXHJcbiAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgYnJpY2sgb2YgdGhpcy5icmlja3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCB3YXNIaXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goYnJpY2suY2hlY2tDb2xsaXNpb24obmV3QmFsbFBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoU2lkZS5MZWZ0KTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKFNpZGUuUmlnaHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5ib3VuY2VIb3Jpem9udGFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FzSGl0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIChTaWRlLlRvcCk6XHJcbiAgICAgICAgICAgICAgICBjYXNlIChTaWRlLkJvdHRvbSk6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLmJvdW5jZVZlcnRpY2FsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FzSGl0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhazsgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHdhc0hpdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2NvcmUoYnJpY2suc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnJpY2tzTGVmdC0tO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihicmljayBpbnN0YW5jZW9mIFN1cGVyQnJpY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5icmlja3MuaW5kZXhPZihicmljayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJpY2tzW2luZGV4XSA9IG5ldyBCcmljayhicmljay5zcHJpdGUsIHRoaXMubm9ybWFsQnJpY2tTY29yZSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmljay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmJyaWNrc0xlZnQgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucGFkZGxlLmNoZWNrQ29sbGlzaW9uKG5ld0JhbGxQb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5ib3VuY2VXaXRoQW5nbGUodGhpcy5wYWRkbGUuY2FsY3VsYXRlSGl0QW5nbGUodGhpcy5iYWxsLmNlbnRlclgoKSwgdGhpcy5iYWxsLnJhZGl1cykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJhbGwubW92ZVRvKHRoaXMuYmFsbC5jYWxjdWxhdGVOZXdQb3NpdGlvbigpKTtcclxuXHJcbiAgICAgICAgfSwgdGhpcy5sb29wSW50ZXJ2YWwpXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBnYW1lID0gbmV3IEdhbWUoXHJcbiAgICA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5iYWxsXCIpLFxyXG4gICAgPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGFkZGxlXCIpLFxyXG4gICAgPEhUTUxDb2xsZWN0aW9uPmRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJicmlja1wiKSxcclxuICAgIDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWUtYm9hcmRcIiksXHJcbiAgICA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLXN0YXRzXCIpXHJcbik7XHJcblxyXG5nYW1lLnJ1bigpOyJdfQ==
