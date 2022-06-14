const board = document.querySelector('#board')

const snakeStart = [{x: 10, y: 10}]
let snakePosition = snakeStart


(function refreshAnimation(){
    requestAnimationFrame(refreshAnimation)

    
    renderSnake()
})()


function renderSnake(){
    snakePosition.forEach(position => {
        let snakeSquare = document.createElement('div')
        snakeSquare.id = 'snake'

        snakeSquare.style.gridColumnStart = position.x
        snakeSquare.style.gridRowStart = position.y

        board.appendChild(snakeSquare)
    })
}