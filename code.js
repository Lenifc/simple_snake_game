const board = document.querySelector('#board')

const snakeStart = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}, {x: 10, y: 13}, {x: 10, y: 14}]
let snakePosition = snakeStart
let snakeSpeed = 1 // ilosć odświeżeń na sekundę
let lastRefreshTime = 0

// requestAnimationFrame lepsza alternatywa dla setInterval
function refreshAnimation(getCurrentTime){
    requestAnimationFrame(refreshAnimation)

    // zapobiega nadmiernemu odświeżaniu pozycji - ogranicza jedynie do nieco ponad jednej sekundy
    if((getCurrentTime - lastRefreshTime) / 1000 <= 1 / snakeSpeed) return
    
    updatePosition()
    renderSnake()
    lastRefreshTime = getCurrentTime
}
requestAnimationFrame(refreshAnimation)

// odświeza pozycję węża, jabłek oraz sprawdza czy są spełnione warunki, aby kontynuowac grę
function updatePosition(){
    // bierzemy ostatni element i nadpisujemy go na poprzedni ( w przypadku, gdy wąż jest dłuższy niż 1!)
    for(let i = snakePosition.length - 1 ; i >= 1; i--){
        snakePosition[i] = { ...snakePosition[i-1] }
    }

    // odświeżenie pozycji na podstawie ostatniego naciśniętego klawisza
    let changePosition = getControlls()
    snakePosition[0].x += changePosition.x
    snakePosition[0].y += changePosition.y
}

// generuje kwadraty w odpowiednich miejscach na planszy
function renderSnake(){
    board.innerHTML = ''
    snakePosition.forEach(position => {
        let snakeSquare = document.createElement('div')
        snakeSquare.id = 'snake' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

        snakeSquare.style.gridColumnStart = position.x
        snakeSquare.style.gridRowStart = position.y

        board.appendChild(snakeSquare)
    })
}
    
// sprawdza ktory klawisz byl ostatnio wcisniety i 
function getControlls(){
    x = 1
    y = 0

    return { x, y }
}