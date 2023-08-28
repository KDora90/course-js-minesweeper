const canvas = document.getElementById('myCanvas');
const c = canvas.getContext('2d');
const actionButton = document.getElementById('action-button');
const mineCounter = document.getElementById('mine-count');
const timeCounter = document.getElementById('time');

const size = 50;
const colums = canvas.width / size;
const rows = canvas.height / size;
const mine = 'mine';
const mineCount = 30;
const images = {
    'hidden': document.getElementById('hidden'),
    'mine': document.getElementById('exploded-mine'),
    'flag': document.getElementById('flag'),
    'flaggedWrong': document.getElementById('flagged-wrong'),
    '0': document.getElementById('field-0'),
    '1': document.getElementById('field-1'),
    '2': document.getElementById('field-2'),
    '3': document.getElementById('field-3'),
    '4': document.getElementById('field-4'),
    '5': document.getElementById('field-5'),
    '6': document.getElementById('field-6'),
    '7': document.getElementById('field-7'),
    '8': document.getElementById('field-8'),
};
const buttons = {
  start: 'assets/button-start.png',
  lost: 'assets/button-lost.png',
  won: 'assets/button-won.png',
}
let isGameOver;
let isFirstClick ;
let exploredFields;
let flagMap;
let map;
let exploredMap;
let remainingMines;
let timer;

initGame();

canvas.addEventListener("click", function(event) {
  // Kattintás helye canvas koordinátarendszerében
  if (isGameOver) return;
  const x = event.offsetX;
  const y = event.offsetY;
  const col = Math.floor(x / size);
  const row = Math.floor(y / size);
  if (isFirstClick) {
    placeMines(map, mineCount, row, col);
    calculateFieldValues(map);
    isFirstClick = false;
    strartTimer();
  }
 exploreField(row, col);
 drawMap();
 checkGameEnd(row, col);
  
});

canvas.addEventListener("contextmenu", function(event) {
  event.preventDefault(); // megakadályozzuk a jobb klikket
  const x = event.offsetX;
  const y = event.offsetY;
  const col = Math.floor(x / size);
  const row = Math.floor(y / size);
  if (exploredMap[row][col]) {
    const neighbourCoordinates = findNeighbourFields(map, row, col);
    let flaggedNeighbours = countFlaggedNeighbours(neighbourCoordinates);  
    if (flaggedNeighbours === map[row][col]) {
      for (let i = 0; i < neighbourCoordinates.length; i++) {
        let coordinate = neighbourCoordinates[i];
        exploreField(coordinate.row, coordinate.col);
      }
    }
  } else{
    flagMap[row][col] = !flagMap[row][col];
    remainingMines += flagMap[row][col] ? -1 : 1; // ternary operator
    mineCounter.innerText = convertNumberTo3DigitString(remainingMines);
  }
    drawMap();
    if (isGameOver) {
      showWrongFlags();
    }
});

actionButton.addEventListener('click', function() {
  initGame();
  stopTimer();
  timeCounter.innerText = convertNumberTo3DigitString(0);
});

function checkGameEnd(row, col) {
  if (map[row][col] === mine && exploredMap[row][col]) {
    looseGame();
    stopTimer();
  } else if (exploredFields === rows * colums - mineCount) {
    isGameOver = true;
    actionButton.src = buttons.won;
    stopTimer();
  }
}

function strartTimer () {
  let seconds = 0;
  timer = setInterval(function() {
    seconds = Math.min(seconds + 1, 999);
    timeCounter.innerText = convertNumberTo3DigitString(seconds);
  }, 1000);
}
function stopTimer() {
  clearInterval(timer);
}

function initGame() {
  isGameOver = false;
  isFirstClick = true;
  exploredFields = 0;
  map = createMap();
  exploredMap = createBooleanMap();
  flagMap = createBooleanMap();
  drawMap();
  actionButton.src = buttons.start;
  remainingMines = mineCount;
  mineCounter.innerText = convertNumberTo3DigitString(remainingMines);
  
} 
function looseGame() {
  isGameOver = true;
  actionButton.src = buttons.lost;
  showWrongFlags();

}

function showWrongFlags() {
  for (let rowI = 0; rowI < rows; rowI++) {
    for (let colI = 0; colI < colums; colI++) {
      if (flagMap[rowI][colI] && map[rowI][colI] !== mine) {
        drawImage(images.flaggedWrong, colI * size, rowI * size);
      }
    }
  }


}
  

function exploreField(row, col) {
  if (!exploredMap[row][col] && !flagMap[row][col]) {
    exploredFields++;
    exploredMap[row][col] = true;
    checkGameEnd(row, col);
    if (map[row][col] === 0) {
      let neighbourCoordinates = findNeighbourFields(map, row, col);
      for (let i = 0; i < neighbourCoordinates.length; i++) {
        let coordinate = neighbourCoordinates[i]; // {row: 2, col: 3}
        exploreField(coordinate.row, coordinate.col); // rekurzió
      }
    }
  }
}



function calculateFieldValues(map) {
    for (let rowI = 0; rowI < rows; rowI++) {
        for (let colI = 0; colI < colums; colI++) {
            let field = map[rowI][colI];
            if (field !== mine) {
                let neighbourCoordinates = findNeighbourFields(map, rowI, colI);
                let mineCount = countMines(map, neighbourCoordinates);
                map[rowI][colI] = mineCount;
            }
          }
        }
      }
function countMines(map, coordinates) {
    let mineCount = 0;
    for (i = 0; i < coordinates.length; i++) {
        let coordinate = coordinates[i];
        let field = map[coordinate.row][coordinate.col];
        if (field === mine) {
            mineCount++;
        } 
    }
    return mineCount;
}
function countFlaggedNeighbours(coordinates) {
  let flaggedNeighbours = 0;
  for (let i = 0; i < coordinates.length; i++) {
    let coordinate = coordinates[i];
    if (flagMap[coordinate.row][coordinate.col]) {
      flaggedNeighbours++;
    }
  }
  return flaggedNeighbours;
}

  function findNeighbourFields(map, rowI, colI) {
    let neighbourCoordinates = [];
    for (let row = rowI - 1; row <= rowI + 1; row++) {
        for (let col = colI - 1; col <= colI + 1; col++) {
            if (row >= 0 && row < rows && col >= 0 && col < colums) {
                if (row !== rowI || col !== colI) {
                    neighbourCoordinates.push({row: row, col: col});
                }
            }
        }
    }
    return neighbourCoordinates;
}


                


function placeMines(map, mineCount, startRow, startCol) {
    let mines = 0;
    while (mines < mineCount) { 
        let x = Math.floor(Math.random() * colums);
        let y = Math.floor(Math.random() * rows);
        if (x !== startCol && y !== startRow && map[y][x] !== mine) {
            map[y][x] = mine;
            mines++;
        }
}
}

function createMap() {
    let map = [];
    for (let j = 0; j < rows; j++) {
        let row = [];
        for (let i = 0; i < colums; i++) {
            row[i] = 0;
        }
        map[j] = row;
    }
    return map;
}

function createBooleanMap() {
    let exploredMap = [];
    for (let j = 0; j < rows; j++) {
        let row = [];
        for (let i = 0; i < colums; i++) {
            row[i] = false;
        }
        exploredMap[j] = row;
    }
    return exploredMap;
}

function drawMap() {
    for (let rowI = 0; rowI < rows; rowI++) {
        for (let colI = 0; colI < colums; colI++) {
          if (!exploredMap[rowI][colI]) {
            drawImage(images.hidden, colI * size, rowI * size);
            if (flagMap[rowI][colI]) {
              drawImage(images.flag, colI * size, rowI * size);
            }
          } else {
            let field = map[rowI][colI];
            let image = images[field];
            drawImage(image, colI * size, rowI * size);
        }
    }

} 
}

function drawImage(image, x, y) {
    c.drawImage(image, x, y, size, size);
}

function convertNumberTo3DigitString(number) {
  if (number < 0) {
    return '🤥'
   } else if (number < 10) {
      return '00' + number;
    } else if (number < 100) {  
      return '0' + number;
    } else {
      return number;
    }
  }

// Ez a függvény megvárja, amíg az összes kép betöltődik, és csak utána hívja meg a paraméterként kapott másik függvényt.
// Az első paraméter a meghívandó függvény, a második paraméter a betöltési idő, ami 0-ról indul.
function whenAllImagesLoaded(onAllImagesLoaded, loadTime = 0) {
    const imageCount = Object.values(images).length; // az összes kép száma
    let loadedImages = 0; // azoknak a képeknek a száma, amik már betöltődtek
    for (let image of Object.values(images)) { // végigmegyünk az összes képen
      if (image.complete) { // ha a kép betöltődött
        loadedImages++; // növeljük a betöltött képek számát
      }
    }
    // ha még nem töltődött be minden kép, és még nem telt el 3 másodperc
    if (loadedImages < imageCount && loadTime < 3000) { 
      console.log('Waiting for images to load'); // kiírjuk, hogy várunk a képekre
      setTimeout(() => { // 100ms múlva újra meghívjuk ezt a függvényt (rekurzió)
        whenAllImagesLoaded(onAllImagesLoaded, loadTime + 100); // a betöltési időt 100ms-al növeljük
      }, 100);
    }
    if (loadTime >= 3000) { // ha már eltelt 3 másodperc
      console.log('Images could not be loaded'); // kiírjuk, hogy nem sikerült betölteni a képeket
    } else if (imageCount === loadedImages) { // különben ha minden kép betöltődött
      onAllImagesLoaded(); // meghívjuk a paraméterként kapott függvényt
    }
  }
