const board = document.querySelector('#board')

const snakeStart = {x: 10, y: 10}
let snakePosition = [snakeStart]
let applePosition = { x: Math.floor(Math.random()*20+1), y: Math.floor(Math.random()*20+1)} // generuje jabłko w losowym miejscu po wczytaniu gry
let snakeSpeed = 3 // ilosć odświeżeń na sekundę
let lastRefreshTime = 0
let directions = {x: 0, y: 0}
let lastMove = directions
let gameOver = false

// requestAnimationFrame lepsza alternatywa dla setInterval
refreshAnimation = (getCurrentTime) => {
    if(!gameOver) requestAnimationFrame(refreshAnimation)
    
    // zapobiega nadmiernemu odświeżaniu pozycji - ogranicza jedynie do nieco ponad jednej sekundy
    if(((getCurrentTime - lastRefreshTime) / 1000 <= 1 / snakeSpeed) && lastRefreshTime !== 0) return
    debugConsoleLogs()
    
    updatePosition()
    renderSnake()
    renderApple()
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
    lastMove = directions
    snakePosition[0].x += directions.x
    snakePosition[0].y += directions.y
    checkCollision()
}

// generuje kwadraty w odpowiednich miejscach na planszy
function renderSnake(){
    board.innerHTML = '' // czyszczenie planszy zapobiega pozostawaniu starych pozycji węża
    if(checkIfAppleOnSnake(applePosition)) snakePosition.push(applePosition) // Gdy jabłko znajdzie się na ciele węża zostanie on powększony o długość: 1

    snakePosition.forEach(position => {
        let snakeSquare = document.createElement('div')
        snakeSquare.id = 'snake' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

        snakeSquare.style.gridColumnStart = position.x
        snakeSquare.style.gridRowStart = position.y

        board.appendChild(snakeSquare)
    })
}

// generuje jeden kwadrat z jabłkiem w losowym miejscu na planszy wykluczając zajęte pozycje przez węża
function renderApple(){
    if(checkIfAppleOnSnake(applePosition)) applePosition = { x: Math.floor(Math.random()*20+1), y: Math.floor(Math.random()*20+1)}

    let appleSquare = document.createElement('div')
    appleSquare.id = 'apple' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

    appleSquare.style.gridColumnStart = applePosition.x
    appleSquare.style.gridRowStart = applePosition.y

    board.appendChild(appleSquare)
}

// sprawdza czy weszliśmy na węża oraz czy jabłko nie zostało wygenerowane na obecnych pozycjach węża
function checkIfAppleOnSnake(positionToCheck){
    return snakePosition.some(currentSnakePosition => {
        return positionToCheck.x === currentSnakePosition.x && positionToCheck.y === currentSnakePosition.y
    })
}

function checkCollision(){
    let snakeHead = snakePosition[0]
    if((snakeHead.x > 20 || 
        snakeHead.x < 1 || 
        snakeHead.y > 20 || 
        snakeHead.y < 1) || 
        biteHimself(snakeHead)) gameOver = true
}

// funkcja podobna jak przy sprawdzaniu czy jablko znajduje sie na wężu, tylko filtruje głowe
function biteHimself(snakeHead){
    return snakePosition.some((currentSnakePosition, index) => {
        if(index === 0) return false
        else return snakeHead.x === currentSnakePosition.x && snakeHead.y === currentSnakePosition.y
    })
}

// sprawdza ktory klawisz byl ostatnio wcisniety i nakierowuje węża w odpowiednią stronę
// zawiera także zabezpieczenie, aby nie można wykonać nagłego zwrotu o 180stopni
window.addEventListener('keydown', e => {
    if(e.code == 'ArrowUp') directions = lastMove.y === 1 ? directions : {x: 0, y: -1 } // oś Y jest odwrócona
    if(e.code == 'ArrowDown') directions = lastMove.y === -1 ? directions : {x: 0, y: 1} // oś Y jest odwrócona
    if(e.code == 'ArrowRight') directions = lastMove.x === -1 ? directions : {x: 1, y: 0}
    if(e.code == 'ArrowLeft') directions = lastMove.x === 1 ? directions : {x: -1, y: 0}
})

function debugConsoleLogs(){
    console.clear()
    console.log("SNAKE'S HEAD POSITION: ", snakePosition[0]);
    console.log('APPLE POSITION: ', applePosition);
    console.log('CURRENT DIRECTION: ', directions);
    if(snakePosition.length > 3) console.log("SNAKE EAT'S HIMSELF: ", checkIfAppleOnSnake(snakePosition[0], 'snake'));
}