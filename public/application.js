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
    // show() {
    //     this.sprite.style.display = "";
    //     this.isVisible = true;
    // }
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
    // stop() {
    //     this.dir = new Vector (0,0);
    // }
    Ball.prototype.release = function () {
        this.dir = new Vector(0, -this.velocity);
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
            }
            else {
                brick = new Brick(bricks[i], this.normalBrickScore);
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
        var score = parseInt(this.scoreElement.textContent) + points;
        this.scoreElement.textContent = "" + score;
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
                    if (brick instanceof SuperBrick) {
                        var index = _this.bricks.indexOf(brick);
                        _this.bricks[index] = new Brick(brick.sprite, _this.normalBrickScore);
                    }
                    else {
                        brick.hide();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHBsaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUE7SUFJSSxlQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRUQsbUJBQUcsR0FBSCxVQUFJLEtBQVk7UUFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0FiQSxBQWFDLElBQUE7QUFFRDtJQUlJLGNBQVksR0FBVyxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsS0FBYTtRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRCxrQkFBRyxHQUFILFVBQUksS0FBWTtRQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7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RUFBRSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtvQkFDdkUsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2pCLENBQUM7b0JBRUQsS0FBSyxDQUFDO2dCQUNWLENBQUM7YUFDSjtZQUVELEVBQUUsQ0FBQSxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsS0FBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwRyxDQUFDO1lBRUQsS0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFdkQsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUN6QixDQUFDO0lBQ0wsV0FBQztBQUFELENBck1BLEFBcU1DLElBQUE7QUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FDRixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUMvQixRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUM5QixRQUFRLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLEVBQzNDLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQ3JDLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQ3JELENBQUM7QUFFRixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgUG9pbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBhZGQocG9pbnQ6IFBvaW50KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IHBvaW50Lng7XHJcbiAgICAgICAgdGhpcy55ICs9IHBvaW50Lnk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFJlY3R7XHJcbiAgICB0b3BMZWZ0OiBQb2ludDtcclxuICAgIGJvdHRvbVJpZ2h0OiBQb2ludDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCBib3R0b206IG51bWJlciwgcmlnaHQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludChsZWZ0LCB0b3ApO1xyXG4gICAgICAgIHRoaXMuYm90dG9tUmlnaHQgPSBuZXcgUG9pbnQocmlnaHQsIGJvdHRvbSk7XHJcbiAgICB9XHJcbiAgXHJcbiAgICBjbG9uZSgpOiBSZWN0IHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlY3QodGhpcy50b3BMZWZ0LnksIHRoaXMudG9wTGVmdC54LCB0aGlzLmJvdHRvbVJpZ2h0LnksIHRoaXMuYm90dG9tUmlnaHQueCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKHBvaW50OiBQb2ludCkge1xyXG4gICAgICAgIHRoaXMudG9wTGVmdC5hZGQocG9pbnQpO1xyXG4gICAgICAgIHRoaXMuYm90dG9tUmlnaHQuYWRkKHBvaW50KTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdChzdGVwOiBudW1iZXIpe1xyXG4gICAgICAgIHRoaXMudG9wTGVmdC54IC09IHN0ZXA7XHJcbiAgICAgICAgdGhpcy5ib3R0b21SaWdodC54IC09IHN0ZXA7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KHN0ZXA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy50b3BMZWZ0LnggKz0gc3RlcDtcclxuICAgICAgICB0aGlzLmJvdHRvbVJpZ2h0LnggKz0gc3RlcDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVG8ocmVjdDogUmVjdCkge1xyXG4gICAgICAgIHRoaXMudG9wTGVmdCA9IHJlY3QudG9wTGVmdDtcclxuICAgICAgICB0aGlzLmJvdHRvbVJpZ2h0ID0gcmVjdC5ib3R0b21SaWdodDtcclxuICAgIH1cclxuXHJcbiAgICB3aWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ib3R0b21SaWdodC54IC0gdGhpcy50b3BMZWZ0Lng7XHJcbiAgICB9XHJcblxyXG4gICAgaGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJvdHRvbVJpZ2h0LnkgLSB0aGlzLnRvcExlZnQueTtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJYKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy50b3BMZWZ0LnggKyB0aGlzLmJvdHRvbVJpZ2h0LngpIC8gMjtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJZKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy50b3BMZWZ0LnkgKyB0aGlzLmJvdHRvbVJpZ2h0LnkpIC8gMjtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmVjdG9yIGV4dGVuZHMgUG9pbnQge1xyXG4gICAgZmxpcFgoKSB7XHJcbiAgICAgICAgdGhpcy54ICo9IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGZsaXBZKCkge1xyXG4gICAgICAgIHRoaXMueSAqPSAtMTtcclxuICAgIH1cclxufVxyXG5cclxuZW51bSBTaWRlIHtcclxuICAgIE5vbmUsXHJcbiAgICBMZWZ0LFxyXG4gICAgVG9wLFxyXG4gICAgUmlnaHQsXHJcbiAgICBCb3R0b21cclxufVxyXG5cclxuY2xhc3MgT2JzdGFjbGUgZXh0ZW5kcyBSZWN0IHtcclxuICAgIGNoZWNrQ29sbGlzaW9uKGFub3RoZXJSZWN0OiBSZWN0KTogU2lkZXtcclxuICAgICAgICB2YXIgdyA9IDAuNSAqICh0aGlzLndpZHRoKCkgKyBhbm90aGVyUmVjdC53aWR0aCgpKTtcclxuICAgICAgICB2YXIgaCA9IDAuNSAqICh0aGlzLmhlaWdodCgpICsgYW5vdGhlclJlY3QuaGVpZ2h0KCkpO1xyXG4gICAgICAgIHZhciBkeCA9IHRoaXMuY2VudGVyWCgpIC0gYW5vdGhlclJlY3QuY2VudGVyWCgpO1xyXG4gICAgICAgIHZhciBkeSA9IHRoaXMuY2VudGVyWSgpIC0gYW5vdGhlclJlY3QuY2VudGVyWSgpO1xyXG5cclxuICAgICAgICBpZiAoTWF0aC5hYnMoZHgpIDw9IHcgJiYgTWF0aC5hYnMoZHkpIDw9IGgpIHtcclxuICAgICAgICAgICAgdmFyIHd5ID0gdyAqIGR5O1xyXG4gICAgICAgICAgICB2YXIgaHggPSBoICogZHg7XHJcblxyXG4gICAgICAgICAgICBpZih3eSA+IGh4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd3kgPiAtaHggPyBTaWRlLlRvcCA6IFNpZGUuTGVmdDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3eSA+IC1oeCA/IFNpZGUuUmlnaHQgOiBTaWRlLkJvdHRvbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTaWRlLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfSAgIFxyXG59XHJcblxyXG5jbGFzcyBTcHJpdGUgZXh0ZW5kcyBPYnN0YWNsZSB7XHJcbiAgICBzcHJpdGU6IEhUTUxFbGVtZW50O1xyXG4gICAgaXNWaXNpYmxlOiBCb29sZWFuO1xyXG4gICAgbWF4UmlnaHQ6IG51bWJlcjtcclxuICAgIHN0YXJ0UG9zOiBSZWN0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZTogSFRNTEVsZW1lbnQsIG1heFJpZ2h0PzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGJvdHRvbSA9IHNwcml0ZS5vZmZzZXRUb3AgKyBzcHJpdGUub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgICAgICB0b3AgPSAgc3ByaXRlLm9mZnNldFRvcCxcclxuICAgICAgICAgICAgbGVmdCA9IHNwcml0ZS5vZmZzZXRMZWZ0LFxyXG4gICAgICAgICAgICByaWdodCA9IHNwcml0ZS5vZmZzZXRMZWZ0ICsgc3ByaXRlLm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBzdXBlcih0b3AsIGxlZnQsIGJvdHRvbSwgcmlnaHQpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRQb3MgPSBuZXcgUmVjdCh0b3AsIGxlZnQsIGJvdHRvbSwgcmlnaHQpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG4gICAgICAgIHRoaXMubWF4UmlnaHQgPSBtYXhSaWdodDtcclxuICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIG1vdmVUbyhyZWN0OiBSZWN0KSB7XHJcbiAgICAgICAgc3VwZXIubW92ZVRvKHJlY3QpO1xyXG5cclxuICAgICAgICBsZXQge3g6IHBvc1gsIHk6IHBvc1kgfSA9IHJlY3QudG9wTGVmdDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnN0eWxlLmxlZnQgPSBwb3NYICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuc3R5bGUudG9wID0gcG9zWSArICdweCc7XHJcbiAgICB9XHJcblxyXG4gICAgIG1vdmVMZWZ0KHN0ZXA6IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIG5ld1Bvc2l0aW9uLm1vdmVMZWZ0KHN0ZXApO1xyXG4gICAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xyXG5cclxuICAgICAgICBpZihuZXdQb3NpdGlvbi50b3BMZWZ0LnggLSBvZmZzZXQgPj0gMCApXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVRvKG5ld1Bvc2l0aW9uKTtcclxuICAgIH1zXHJcblxyXG4gICAgbW92ZVJpZ2h0KHN0ZXA6IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIG5ld1Bvc2l0aW9uLm1vdmVSaWdodChzdGVwKTtcclxuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuXHJcbiAgICAgICAgaWYobmV3UG9zaXRpb24uYm90dG9tUmlnaHQueCArIG9mZnNldCA8PSB0aGlzLm1heFJpZ2h0IClcclxuICAgICAgICAgICAgdGhpcy5tb3ZlVG8obmV3UG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2hvdygpIHtcclxuICAgIC8vICAgICB0aGlzLnNwcml0ZS5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcclxuICAgIC8vICAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgY2hlY2tDb2xsaXNpb24oYW5vdGhlclJlY3Q6IFJlY3QpOiBTaWRle1xyXG4gICAgICAgIGlmKCF0aGlzLmlzVmlzaWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gU2lkZS5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VwZXIuY2hlY2tDb2xsaXNpb24oYW5vdGhlclJlY3QpO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuY2xhc3MgUGFkZGxlIGV4dGVuZHMgU3ByaXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZTogSFRNTEVsZW1lbnQsIG1heFJpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihzcHJpdGUsIG1heFJpZ2h0KVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBjYWxjdWxhdGVIaXRBbmdsZShiYWxsWDogbnVtYmVyLCBiYWxsUmFkaXVzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHZhciBoaXRTcG90ID0gYmFsbFggLSB0aGlzLnRvcExlZnQueDtcclxuICAgICAgICB2YXIgbWF4UGFkZGxlID0gdGhpcy53aWR0aCgpICsgYmFsbFJhZGl1cztcclxuICAgICAgICB2YXIgbWluUGFkZGxlID0gLWJhbGxSYWRpdXM7XHJcbiAgICAgICAgdmFyIHBhZGRsZVJhbmdlID0gbWF4UGFkZGxlIC0gbWluUGFkZGxlOyAgICAgICBcclxuXHJcbiAgICAgICAgdmFyIG1pbkFuZ2xlID0gMTYwO1xyXG4gICAgICAgIHZhciBtYXhBbmdsZSA9IDIwO1xyXG4gICAgICAgIHZhciBhbmdsZVJhbmdlID0gbWF4QW5nbGUgLSBtaW5BbmdsZTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgoaGl0U3BvdCAqIGFuZ2xlUmFuZ2UpIC8gcGFkZGxlUmFuZ2UpICsgbWluQW5nbGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJhbGwgZXh0ZW5kcyBTcHJpdGUge1xyXG4gICAgc3ByaXRlOiBIVE1MRWxlbWVudDtcclxuICAgIHJhZGl1czogbnVtYmVyO1xyXG4gICAgZGlyOiBWZWN0b3I7XHJcbiAgICB2ZWxvY2l0eTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZTogSFRNTEVsZW1lbnQsIHZlbG9jaXR5OiBudW1iZXIsIG1heFJpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcmFkaXVzID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShzcHJpdGUpWydib3JkZXItcmFkaXVzJ10pO1xyXG4gICAgICAgIGxldCBwb3MgPSBuZXcgUG9pbnQoc3ByaXRlLm9mZnNldExlZnQsIHNwcml0ZS5vZmZzZXRUb3ApO1xyXG4gICAgICAgIHN1cGVyKHNwcml0ZSwgbWF4UmlnaHQpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgICB0aGlzLmRpciA9IG5ldyBWZWN0b3IoMCwwKTtcclxuICAgIH07XHJcblxyXG4gICAgY2FsY3VsYXRlTmV3UG9zaXRpb24oKTogUmVjdCB7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIG5ld1Bvc2l0aW9uLmFkZCh0aGlzLmRpcik7XHJcbiAgICAgICAgcmV0dXJuIG5ld1Bvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgbW92ZUxlZnQoc3RlcDogbnVtYmVyLCBwYWRkbGVXaWR0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIG5ld1Bvc2l0aW9uLm1vdmVMZWZ0KHN0ZXApO1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAocGFkZGxlV2lkdGggLyAyKSAtIHRoaXMucmFkaXVzIHx8IDA7XHJcblxyXG4gICAgICAgIHJldHVybiBzdXBlci5tb3ZlTGVmdChzdGVwLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodChzdGVwOiBudW1iZXIsIHBhZGRsZVdpZHRoOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgbmV3UG9zaXRpb24ubW92ZVJpZ2h0KHN0ZXApO1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAocGFkZGxlV2lkdGggLyAyKSAtIHRoaXMucmFkaXVzIHx8IDA7XHJcblxyXG4gICAgICAgIHJldHVybiBzdXBlci5tb3ZlUmlnaHQoc3RlcCwgb2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBib3VuY2VIb3Jpem9udGFsKCkge1xyXG4gICAgICAgIHRoaXMuZGlyLmZsaXBYKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYm91bmNlVmVydGljYWwoKSB7XHJcbiAgICAgICAgdGhpcy5kaXIuZmxpcFkoKTtcclxuICAgIH1cclxuXHJcbiAgICBib3VuY2VXaXRoQW5nbGUoYW5nbGU6IG51bWJlcikge1xyXG4gICAgICAgIGFuZ2xlID0gYW5nbGUgKihNYXRoLlBJIC8gMTgwKTtcclxuICAgICAgICB0aGlzLmRpci54ID0gTWF0aC5jb3MoYW5nbGUpICogdGhpcy52ZWxvY2l0eTtcclxuICAgICAgICB0aGlzLmRpci55ID0gLU1hdGguc2luKGFuZ2xlKSAqIHRoaXMudmVsb2NpdHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3RvcCgpIHtcclxuICAgIC8vICAgICB0aGlzLmRpciA9IG5ldyBWZWN0b3IgKDAsMCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgcmVsZWFzZSgpIHtcclxuICAgICAgICB0aGlzLmRpciA9bmV3IFZlY3RvciAoMCwtdGhpcy52ZWxvY2l0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVRvKHJlY3Q6IFJlY3QpIHtcclxuICAgICAgICBzdXBlci5tb3ZlVG8ocmVjdCk7XHJcblxyXG4gICAgICAgIGxldCB7eDogcG9zWCwgeTogcG9zWSB9ID0gcmVjdC50b3BMZWZ0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuc3R5bGUubGVmdCA9IHBvc1ggKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zdHlsZS50b3AgPSBwb3NZICsgJ3B4JztcclxuICAgIH1cclxufSAgIFxyXG5cclxuY2xhc3MgQnJpY2sgZXh0ZW5kcyBTcHJpdGUge1xyXG4gICAgc2NvcmUgOm51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGU6IEhUTUxFbGVtZW50LCBzY29yZSA6bnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc3ByaXRlKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5jbGFzc0xpc3QucmVtb3ZlKCdzdXBlcicpO1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICAgIH0gXHJcbn1cclxuXHJcbmNsYXNzIFN1cGVyQnJpY2sgZXh0ZW5kcyBCcmljayB7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3ByaXRlOiBIVE1MRWxlbWVudCwgc2NvcmUgOm51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHNwcml0ZSwgc2NvcmUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmNsYXNzTGlzdC5hZGQoJ3N1cGVyJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG4gICAgfSBcclxufVxyXG5cclxuZW51bSBHYW1lU3RhdGUge1xyXG4gICAgQmFsbE5vdFJlbGVhc2VkLFxyXG4gICAgUnVubmluZyxcclxuICAgIEdhbWVPdmVyICAgICAgIFxyXG59XHJcblxyXG5lbnVtIEtleUNvZGVzIHtcclxuICAgIExFRlQgPSAzNyxcclxuICAgIFJJR0hUID0gMzlcclxufVxyXG5cclxuY2xhc3MgR2FtZSB7XHJcbiAgICBsb29wSW50ZXJ2YWw6IG51bWJlciA9IDEwO1xyXG4gICAgcGFkZGxlU3RlcDogbnVtYmVyID0gMzA7XHJcbiAgICB2ZWxvY2l0eTogbnVtYmVyID0gNTtcclxuICAgIG5vcm1hbEJyaWNrU2NvcmU6IG51bWJlciA9IDEwO1xyXG4gICAgc3VwZXJCcmlja1Njb3JlOiBudW1iZXIgPSAzMDtcclxuICAgIGxpdmVzTGVmdDogbnVtYmVyID0gMztcclxuXHJcbiAgICBtaW5fUGVyY2VudE9mU3VwZXJCcmlja3MgPSAxMDtcclxuICAgIG1heF9QZXJjZW50T2ZTdXBlckJyaWNrcyA9IDQwO1xyXG4gICAgXHJcbiAgICBiYWxsRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBib2FyZEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gICAgbGl2ZXNFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgc2NvcmVFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgYmFsbDogQmFsbDtcclxuICAgIHBhZGRsZTogUGFkZGxlO1xyXG4gICAgYnJpY2tzOiBBcnJheTxCcmljaz4gPSBbXTtcclxuXHJcbiAgICBnYW1lU3RhdGU6IEdhbWVTdGF0ZTtcclxuICAgIGtleU1hcCA9e307XHJcblxyXG4gICAgd2FsbExlZnQ6IE9ic3RhY2xlO1xyXG4gICAgd2FsbFRvcDogT2JzdGFjbGU7XHJcbiAgICB3YWxsUmlnaHQ6IE9ic3RhY2xlO1xyXG4gICAgd2FsbEJvdHRvbTogT2JzdGFjbGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYmFsbEVsZW1lbnQ6IEhUTUxFbGVtZW50LCBwYWRkbGVFbGVtZW50OiBIVE1MRWxlbWVudCwgYnJpY2tzOiBIVE1MQ29sbGVjdGlvbiwgYm9hcmRFbGVtZW50OiBIVE1MRWxlbWVudCwgc3RhdHNFbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLkJhbGxOb3RSZWxlYXNlZDtcclxuICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IGJvYXJkRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxpdmVzRWxlbWVudCA9IHN0YXRzRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI2xpdmVzXCIpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc3RhdHNFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIik7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlID0gbmV3IFBhZGRsZSAocGFkZGxlRWxlbWVudCwgYm9hcmRFbGVtZW50Lm9mZnNldFdpZHRoKVxyXG4gICAgICAgIHRoaXMuYmFsbCA9IG5ldyBCYWxsIChiYWxsRWxlbWVudCwgdGhpcy52ZWxvY2l0eSwgYm9hcmRFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3VwZXJCcmlja3NDb3VudDpudW1iZXIgPSB0aGlzLmNvdW50T2ZTdXBlckJyaWNrcyhicmlja3MubGVuZ3RoKTtcclxuICAgICAgICBsZXQgc3VwZXJCcmlja3NJbmRleGVzOkFycmF5PG51bWJlcj4gPSB0aGlzLmluZGV4ZXNPZlN1cGVyQnJpY2tzKHN1cGVyQnJpY2tzQ291bnQsIGJyaWNrcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBicmlja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGJyaWNrOiBCcmljaztcclxuICAgIFxyXG4gICAgICAgICAgICBpZihzdXBlckJyaWNrc0luZGV4ZXMuaW5kZXhPZihpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBicmljayA9IG5ldyBTdXBlckJyaWNrKDxIVE1MRWxlbWVudD5icmlja3NbaV0sIHRoaXMuc3VwZXJCcmlja1Njb3JlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyaWNrID0gbmV3IEJyaWNrKDxIVE1MRWxlbWVudD5icmlja3NbaV0sIHRoaXMubm9ybWFsQnJpY2tTY29yZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnJpY2tzLnB1c2goYnJpY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVXYWxscyh0aGlzLmJhbGwucmFkaXVzLCB0aGlzLmJvYXJkRWxlbWVudC5vZmZzZXRXaWR0aCwgdGhpcy5ib2FyZEVsZW1lbnQub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLm5ld0dhbWUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY291bnRPZlN1cGVyQnJpY2tzKGFsbEJyaWNrc0NvdW50KSB7XHJcbiAgICAgICAgbGV0IG1pbiA9IHRoaXMubWluX1BlcmNlbnRPZlN1cGVyQnJpY2tzO1xyXG4gICAgICAgIGxldCBtYXggPSB0aGlzLm1heF9QZXJjZW50T2ZTdXBlckJyaWNrcztcclxuICAgICAgICBsZXQgcGVyY2VudCA9IChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pIC8gMTAwO1xyXG4gICAgICAgIGxldCBjb3VudCA9IE1hdGgucm91bmQoYWxsQnJpY2tzQ291bnQgKiBwZXJjZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfVxyXG5cclxuICAgIGluZGV4ZXNPZlN1cGVyQnJpY2tzKHN1cGVyQnJpY2tzQ291bnQsIGFsbEJyaWNrc0NvdW50KSB7XHJcbiAgICAgICAgbGV0IGluZGV4ZXM6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN1cGVyQnJpY2tzQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoYWxsQnJpY2tzQ291bnQtMSkpO1xyXG4gICAgICAgICAgICB9d2hpbGUoaW5kZXhlcy5pbmRleE9mKGluZGV4KSAhPSAtMSlcclxuXHJcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5kZXhlcztcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVXYWxscyhyYWRpdXM6IG51bWJlciwgbWF4WDogbnVtYmVyLCBtYXhZOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLndhbGxMZWZ0ID0gbmV3IE9ic3RhY2xlKC0gcmFkaXVzLCAtIHJhZGl1cywgbWF4WSArIHJhZGl1cywgMCk7XHJcbiAgICAgICAgdGhpcy53YWxsVG9wID0gbmV3IE9ic3RhY2xlKC0gcmFkaXVzLCAtIHJhZGl1cywgMCwgbWF4WCArIHJhZGl1cyk7XHJcbiAgICAgICAgdGhpcy53YWxsUmlnaHQgPSBuZXcgT2JzdGFjbGUoLSByYWRpdXMsIG1heFgsIG1heFkgKyByYWRpdXMsIG1heFggKyByYWRpdXMpO1xyXG4gICAgICAgIHRoaXMud2FsbEJvdHRvbSA9IG5ldyBPYnN0YWNsZShtYXhZLCAtIHJhZGl1cywgbWF4WSArIHJhZGl1cywgbWF4WCArIHJhZGl1cyk7ICAgICBcclxuICAgIH07XHJcbiBcclxuICAgIG5ld0dhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5saXZlc0xlZnQgPSB0aGlzLmxpdmVzTGVmdCB8IDM7XHJcbiAgICAgICAgdGhpcy5saXZlc0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIlwiICsgdGhpcy5saXZlc0xlZnQ7XHJcbiAgICAgICAgdGhpcy5zY29yZUVsZW1lbnQudGV4dENvbnRlbnQgPSBcIjBcIjtcclxuICAgIH1cclxuXHJcbiAgICBhZGRTY29yZShwb2ludHM/OiBudW1iZXIpIHtcclxuICAgICAgICBwb2ludHMgPSBwb2ludHMgfHwgMTA7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gcGFyc2VJbnQodGhpcy5zY29yZUVsZW1lbnQudGV4dENvbnRlbnQpICsgcG9pbnRzOyAgXHJcbiAgICAgICAgdGhpcy5zY29yZUVsZW1lbnQudGV4dENvbnRlbnQgPSBcIlwiICsgc2NvcmU7XHJcbiAgICB9XHJcblxyXG4gICAgbG9zdExpdmUoKSB7XHJcbiAgICAgICAgaWYoLS10aGlzLmxpdmVzTGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpdmVzRWxlbWVudC50ZXh0Q29udGVudCA9IFwiXCIgKyB0aGlzLmxpdmVzTGVmdDtcclxuICAgICAgICAgICAgdGhpcy5nYW1lU3RhdGUgPSBHYW1lU3RhdGUuQmFsbE5vdFJlbGVhc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmJhbGwubW92ZVRvKCB0aGlzLmJhbGwuc3RhcnRQb3MgKTtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUubW92ZVRvKCB0aGlzLnBhZGRsZS5zdGFydFBvcyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLkdhbWVPdmVyO1xyXG4gICAgICAgICAgICBhbGVydChcIllvdSBsb3N0XCIpO1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChlKSA9PiB0aGlzLmtleU1hcFtlLmtleUNvZGVdID0gZmFsc2UpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleU1hcFtlLmtleUNvZGVdID0gdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYodGhpcy5nYW1lU3RhdGUgPT0gR2FtZVN0YXRlLkJhbGxOb3RSZWxlYXNlZCl7XHJcbiAgICAgICAgICAgICAgICBpZihlLmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhbGwucmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZVN0YXRlID0gR2FtZVN0YXRlLlJ1bm5pbmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLkdhbWVPdmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBuZXdCYWxsUG9zaXRpb24gPSB0aGlzLmJhbGwuY2FsY3VsYXRlTmV3UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMua2V5TWFwW0tleUNvZGVzLkxFRlRdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5tb3ZlTGVmdCg1KTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2FtZVN0YXRlID09IEdhbWVTdGF0ZS5CYWxsTm90UmVsZWFzZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLm1vdmVMZWZ0KDUsIHRoaXMucGFkZGxlLndpZHRoKCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleU1hcFtLZXlDb2Rlcy5SSUdIVF0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLm1vdmVSaWdodCg1KTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuZ2FtZVN0YXRlID09IEdhbWVTdGF0ZS5CYWxsTm90UmVsZWFzZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLm1vdmVSaWdodCg1LCB0aGlzLnBhZGRsZS53aWR0aCgpICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWVTdGF0ZSAhPT0gR2FtZVN0YXRlLlJ1bm5pbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy53YWxsQm90dG9tLmNoZWNrQ29sbGlzaW9uKG5ld0JhbGxQb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9zdExpdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy53YWxsTGVmdC5jaGVja0NvbGxpc2lvbihuZXdCYWxsUG9zaXRpb24pIHx8IHRoaXMud2FsbFJpZ2h0LmNoZWNrQ29sbGlzaW9uKG5ld0JhbGxQb3NpdGlvbikgKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWxsLmJvdW5jZUhvcml6b250YWwoKTtcclxuICAgICAgICAgICAgZWxzZSBpZiAoIHRoaXMud2FsbFRvcC5jaGVja0NvbGxpc2lvbihuZXdCYWxsUG9zaXRpb24pIClcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5ib3VuY2VWZXJ0aWNhbCgpO1xyXG5cclxuICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBicmljayBvZiB0aGlzLmJyaWNrcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdhc0hpdDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaChicmljay5jaGVja0NvbGxpc2lvbihuZXdCYWxsUG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIChTaWRlLkxlZnQpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoU2lkZS5SaWdodCk6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLmJvdW5jZUhvcml6b250YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB3YXNIaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgKFNpZGUuVG9wKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKFNpZGUuQm90dG9tKTpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhbGwuYm91bmNlVmVydGljYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB3YXNIaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAod2FzSGl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTY29yZShicmljay5zY29yZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGJyaWNrIGluc3RhbmNlb2YgU3VwZXJCcmljaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmJyaWNrcy5pbmRleE9mKGJyaWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icmlja3NbaW5kZXhdID0gbmV3IEJyaWNrKGJyaWNrLnNwcml0ZSwgdGhpcy5ub3JtYWxCcmlja1Njb3JlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyaWNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucGFkZGxlLmNoZWNrQ29sbGlzaW9uKG5ld0JhbGxQb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFsbC5ib3VuY2VXaXRoQW5nbGUodGhpcy5wYWRkbGUuY2FsY3VsYXRlSGl0QW5nbGUodGhpcy5iYWxsLmNlbnRlclgoKSwgdGhpcy5iYWxsLnJhZGl1cykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJhbGwubW92ZVRvKHRoaXMuYmFsbC5jYWxjdWxhdGVOZXdQb3NpdGlvbigpKTtcclxuXHJcbiAgICAgICAgfSwgdGhpcy5sb29wSW50ZXJ2YWwpXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBnYW1lID0gbmV3IEdhbWUoXHJcbiAgICA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5iYWxsXCIpLFxyXG4gICAgPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGFkZGxlXCIpLFxyXG4gICAgPEhUTUxDb2xsZWN0aW9uPmRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJicmlja1wiKSxcclxuICAgIDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWUtYm9hcmRcIiksXHJcbiAgICA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLXN0YXRzXCIpXHJcbik7XHJcblxyXG5nYW1lLnJ1bigpOyJdfQ==
