class Food {
    constructor(canva, context, size) {
        this.canva = canva;
        this.context = context;
        this.size = size;
        this.foodAxis = { x: 0, y: 0 };
    }
    createFood(snakeBody){
        do{
            this.foodAxis.x = Math.floor(Math.random() * this.canva.width / this.size) * this.size;
            this.foodAxis.y = Math.floor(Math.random() * this.canva.height / this.size) * this.size;
        }while(snakeBody.some(s => s.x == this.foodAxis.x && s.y == this.foodAxis.y))
    }
    displayFood(){
        this.context.fillStyle = 'red';
        this.context.beginPath()
        this.context.arc(this.foodAxis.x + (this.size / 2) , this.foodAxis.y + ( this.size / 2), this.size / 2, 0, Math.PI * 2, false)
        this.context.fill()
    }
}

class Snake {
    constructor(canva, context, size, xVel, yVel) {
        this.canva = canva;
        this.context = context;
        this.size = size;
        this.xVel = xVel
        this.yVel = yVel

        this.snake = [
            { x: this.size * 10, y: this.size * 20},
            { x: this.size * 11, y: this.size * 20},
            { x: this.size * 12, y: this.size * 20}
        ];
    }
    setDirection(x, y){
        this.xVel = x
        this.yVel = y
    }
    moveSnake(ate = false){
        let head = this.snake[this.snake.length - 1];
        this.snake.push({ x: head.x + this.xVel, y: head.y + this.yVel });
        if(!ate){
            this.snake.shift();
        }
    }
    displaySnake(){
        let head = this.snake[this.snake.length - 1];
        
        this.snake.forEach((s) => {
            this.context.fillStyle = 'white';
            this.context.fillRect(s.x, s.y, this.size, this.size);
            this.context.strokeStyle = 'black';
            this.context.strokeRect(s.x, s.y, this.size, this.size);
        });
        // for snake eyes
        this.context.beginPath();
        this.context.fillStyle = 'black';
        this.context.arc(head.x + 2.5, head.y + 4, 1.3, 0, Math.PI * 2, false);
        this.context.arc(head.x + 7.5, head.y + 4, 1.3, 0, Math.PI * 2, false);
        this.context.fill();
    }
    
    hasCollided(){
        let head = this.snake[this.snake.length - 1];
        let i = 0
        while(i < this.snake.length - 1){
            if(head.x == this.snake[i].x && head.y == this.snake[i].y){
                return true
            }
            i += 1
        }
        return false
    }
    hasHittedWall(){
        let head = this.snake[this.snake.length - 1];
        let hitted = head.x >= this.canva.width || head.y >= this.canva.height || head.x < 0 || head.y < 0

        return hitted
    }
}


const gameContainer = document.getElementById('game-container')
const gameBoard = document.getElementById('game-board');
let scoreBoard = document.getElementById('score');

const ateSound = new Audio('./Sounds/byte.mp3')
ateSound.preload = 'auto'

const gameOverSound = new Audio('./Sounds/gameOver.mp3')
gameOverSound.preload = 'auto'

const bgm = new Audio('./Sounds/bgm.mp3')
bgm.loop = true
bgm.volume = 0.1

gameBoard.height = 400;
gameBoard.width = 400;

let ctx = gameBoard.getContext('2d');
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, gameBoard.width, gameBoard.height)

let loop;
let gameOver = false
let speed = 10;
let score = 0
let xVel = 10;
let yVel = 0;
let started = false
let paused = false
let restart = false
let directionChanged = false

function clearBoard() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gameBoard.width, gameBoard.height);
}

let snake = new Snake(gameBoard, ctx, 10, xVel, yVel);

let food = new Food(gameBoard, ctx, 10);
food.createFood(snake.snake);
food.displayFood()
snake.displaySnake()

function gameLoop(){
    if(loop) clearInterval(loop)
    if(gameOver || !started) return
    loop = setInterval(() => {
        scoreBoard.textContent = `Score : ${score}`
        clearBoard();

        let head = snake.snake[snake.snake.length - 1]
        let ate = head.x == food.foodAxis.x && head.y == food.foodAxis.y
        snake.moveSnake(ate);
        if(ate){
            score += 5  
            ateSound.currentTime = 0
            ateSound.play()
            food.createFood(snake.snake)
        }
        if(snake.hasCollided() || snake.hasHittedWall()){
            gameOverSound.play()
            bgm.pause()
            bgm.currentTime = 0
            endGame()
        }
        food.displayFood()
        snake.displaySnake();
        directionChanged = false
    }, 140);
}

function eventCheck(e){
    if(!started){
        started = true
        bgm.play()
        gameLoop()
    }
    // Space button
    if(e.keyCode == 32 && !gameOver){
        if(!paused){
            paused = true
            clearInterval(loop)
            gamePauseMsg()
        }else{
            paused = false
            started = true
            gameLoop()
        }
    }
    // r button - for restart 
    if(e.keyCode == 82){
        paused = true
        if(!gameOver) gamePauseMsg()
        clearInterval(loop)
        restartPopUp()

    }

    if(directionChanged) return 
    const Left = 37;
    const Up = 38;
    const Right = 39
    const Down = 40
    
    if(e.keyCode == Left && snake.xVel == 0){
        snake.setDirection(-speed, 0)
        directionChanged = true
    }
    if(e.keyCode == Right && snake.xVel == 0){
        snake.setDirection(speed, 0)
        directionChanged = true
    }
    if(e.keyCode == Up && snake.yVel == 0){
        snake.setDirection(0,-speed)
        directionChanged = true
    }
    if(e.keyCode == Down && snake.yVel == 0){
        snake.setDirection(0, speed)
        directionChanged = true
    }
}
function restartPopUp(){
    if(restart) return
    restart = true
    let popUp = document.createElement('div')
    popUp.innerText = 'Do you want to Restart the game ?'
    popUp.className = 'pop-up'

    btn1 = document.createElement('button')
    btn1.textContent = 'Yes'
    btn2 = document.createElement('button')
    btn2.textContent = 'No'

    popUp.append(btn1, btn2)
    gameContainer.append(popUp)

    btn1.addEventListener('click', () => location.reload())
    btn2.addEventListener('click', removePopUp)

    function removePopUp(){
        restart = false
        popUp.remove()
    }
}
function gamePauseMsg(){
    ctx.font = "bold 30px serif"
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText('Paused', gameBoard.width / 2, gameBoard.height / 2)
}

function endGame(){
    clearInterval(loop)
    gameOver = true
    ctx.fillStyle = 'white'
    ctx.font = "bold 50px serif"
    ctx.textAlign = 'center'
    ctx.fillText('Game Over !', gameBoard.width / 2, gameBoard.height / 2)
}

window.addEventListener('keydown', eventCheck)
