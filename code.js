const board = document.querySelector('#board')
const endGame = document.querySelector('#endGame')
const results = document.querySelector('#results')
const restartButton = document.querySelector('#restart')

const snakeStart = {x: 10, y: 10}
let snakePosition = [snakeStart]
let applePosition = { x: Math.floor(Math.random()*20+1), y: Math.floor(Math.random()*20+1)} // generuje jabłko w losowym miejscu po wczytaniu gry
let minePosition;
let snakeSpeed = 2 // ilosć odświeżeń na sekundę
let lastRefreshTime = 0
let directions = {x: 0, y: 0}
let lastMove = directions
let gameOver = false
let applesEaten = 0
let timerStarted = false
let timeSurvived = 0
let lastAppleRender = null
let lastMineRender = null
let timestampAtStart
let timestampAtEnd

// requestAnimationFrame lepsza alternatywa dla setInterval
function refreshAnimation (getCurrentTime) {
    if(!gameOver) requestAnimationFrame(refreshAnimation)
    else showResults()
    
    // zapobiega nadmiernemu odświeżaniu pozycji - ogranicza jedynie do nieco ponad jednej sekundy
    if(((getCurrentTime - lastRefreshTime) / 1000 <= 1 / snakeSpeed) && lastRefreshTime !== 0) return
    if(timerStarted) checkForApplesAndMinesUpdate()
    // debugConsoleLogs()
    
    updatePosition()
    renderSnake()
    renderApple()
    renderMine()
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
    if(snakePosition[0].x !== 10 || snakePosition[0].y !== 10) {
        if(!timerStarted) timestampAtStart = Date.now()
        timerStarted = true
    }
}

// generuje kwadraty w odpowiednich miejscach na planszy
function renderSnake(){
    board.innerHTML = '' // czyszczenie planszy zapobiega pozostawaniu starych pozycji węża
    if(checkIfAppleOnSnake(applePosition)) {
        snakePosition.push(applePosition) // Gdy jabłko znajdzie się na ciele węża zostanie on powększony o długość: 1
        applesEaten += 1
        checkSnakeSpeed()
    }

    snakePosition.forEach(position => {
        let snakeSquare = document.createElement('div')
        snakeSquare.id = 'snake' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

        snakeSquare.style.gridColumnStart = position.x
        snakeSquare.style.gridRowStart = position.y

        board.appendChild(snakeSquare)
    })
}

// generuje jeden kwadrat z jabłkiem w losowym miejscu na planszy wykluczając zajęte pozycje przez węża
function renderApple(timeForChange){
    if(checkIfAppleOnSnake(applePosition) || timeForChange) {
        applePosition = { x: Math.floor(Math.random()*20+1), y: Math.floor(Math.random()*20+1)}
        lastAppleRender = Date.now()
    }

    let appleSquare = document.createElement('div')
    appleSquare.id = 'apple' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

    appleSquare.style.gridColumnStart = applePosition.x
    appleSquare.style.gridRowStart = applePosition.y

    board.appendChild(appleSquare)
}

function renderMine(timeForChange){
    if(timeForChange){
        minePosition = { x: Math.floor(Math.random()*20+1), y: Math.floor(Math.random()*20+1)} // generuje mine w losowym miejscu poza wężem
        if(checkIfAppleOnSnake(minePosition)) return renderMine(true) // zapobiega przypadkowemu wygenerowaniu miny na wężu
        lastMineRender = Date.now()
    }
    if(minePosition){
        let mineSquare = document.createElement('div')
        mineSquare.id = 'mine' // kazdy utworzony element otrzymuje ID, aby móc zaaplikować odpowiednie stylowanie

        mineSquare.style.gridColumnStart = minePosition.x
        mineSquare.style.gridRowStart = minePosition.y
        board.appendChild(mineSquare)
    }
}

// sprawdza warunki do utrudnienia rozgrywki
function checkSnakeSpeed(){
    if(applesEaten % 5 == 0) snakeSpeed *= 1.25
}

// jako utrudnienie sprawdza czy minal odpowiedni czas na odswiezenie jabłek/min na planszy
// jabłko zmienia pozycję co 10sekund od ostatniego podniesienia
// pierwsza i każda kolejna mina generowana jest po upływie 30 sekund 
function checkForApplesAndMinesUpdate() {
    let timeToChangeApplePosition
    let timeToChangeMinePosition
    timeSurvived = Math.floor((Date.now() - timestampAtStart) / 1000)
    if(lastAppleRender) timeToChangeApplePosition = Math.floor((Date.now() - lastAppleRender) / 1000)
    if(lastMineRender) timeToChangeMinePosition = Math.floor((Date.now() - lastMineRender) / 1000)

    if(timeToChangeApplePosition > 10) renderApple(timeForChange = true)
    if((!timeToChangeMinePosition && 
        timeSurvived !== 0 && 
        timeSurvived % 30 == 0) || 
        timeToChangeMinePosition > 30) renderMine(timeForChange = true)
}


// sprawdza czy weszliśmy na węża oraz czy jabłko nie zostało wygenerowane na obecnych pozycjach węża
function checkIfAppleOnSnake(positionToCheck){
    return snakePosition.some(currentSnakePosition => {
        return positionToCheck.x === currentSnakePosition.x && positionToCheck.y === currentSnakePosition.y
    })
}

// sprawdzenie czy wąż znajduje się poza granicami planszy lub czy nie został ugryziony
function checkCollision(){
    let snakeHead = snakePosition[0]
    if(snakeHead.x > 20 || 
        snakeHead.x < 1 || 
        snakeHead.y > 20 || 
        snakeHead.y < 1 || 
        checkIfAppleOnSnake(minePosition || 0) ||
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

// tablica z wynikiem, czasem oraz możliwością restartu
function showResults(){
    let lastGameScore, lastGameTime, bestScore, bestTime
    timestampAtEnd = Date.now()
    
    if(localStorage.getItem('lastGameScore')) lastGameScore = localStorage.getItem('lastGameScore') 
    if(localStorage.getItem('lastGameTime')) lastGameTime = localStorage.getItem('lastGameTime') 
    if(localStorage.getItem('bestScore')) bestScore = localStorage.getItem('bestScore') < applesEaten ? applesEaten : localStorage.getItem('bestScore') 
    if(localStorage.getItem('bestTime')) bestTime = localStorage.getItem('bestTime') < timeSurvived ? timeSurvived : localStorage.getItem('bestTime')
    
    timeSurvived = Math.floor((timestampAtEnd - timestampAtStart) / 1000)
    
    let score = document.createElement('div')
    let time = document.createElement('div')
    let speed = document.createElement('div')
    
    score.innerText = `Score: ${applesEaten}
    ${lastGameScore ? `Last game score: ${lastGameScore}` : ''}
    ${bestScore ? `Best score ever: ${bestScore}` : ''}`
    
    time.innerText = `Time Survived: ${timeSurvived} seconds
    ${lastGameTime ? `Last game time survived: ${lastGameTime} seconds` : ''}
    ${bestTime ? `Best time ever: ${bestTime} seconds` : ''}`
    
    speed.innerText = `Reached speed multiplier: ${snakeSpeed}`
    
    results.appendChild(score)
    results.appendChild(time)
    results.appendChild(speed)
    endGame.style.display = 'flex'
    

    saveScore()
    // najszybszy sposob na ustawienie startowych wartosci to odswiezenie strony :P 
    restartButton.addEventListener('click', () => window.location.reload())
}

// zapisuje w lokalnej pamieci przegladarki wyniki jak i pobiera je w celu ustalenia najlepszego wyniku
function saveScore(){
    localStorage.setItem('lastGameScore', applesEaten)
    localStorage.setItem('lastGameTime', timeSurvived)
    if(!localStorage.getItem('bestScore') || localStorage.getItem('bestScore') < applesEaten) localStorage.setItem('bestScore', applesEaten)
    if(!localStorage.getItem('bestTime') || localStorage.getItem('bestTime') < timeSurvived) localStorage.setItem('bestTime', timeSurvived)
}


// wszystkie potrzebne dane potrzebne przy tworzeniu/ulepszaniu gry
function debugConsoleLogs(){
    console.clear()
    console.log("SNAKE'S HEAD POSITION: ", snakePosition[0]);
    console.log('APPLE POSITION: ', applePosition);
    console.log('MINE POSITION: ', minePosition);
    console.log('CURRENT DIRECTION: ', directions);
    if(snakePosition.length > 3) console.log("SNAKE EAT'S HIMSELF: ", biteHimself(snakePosition[0]));
    console.log('EATEN APPLES: ', applesEaten);
    console.log('SNAKE SPEED: ', snakeSpeed);
    console.log('TIME SURVIVED: ', timeSurvived);
}