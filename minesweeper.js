const canvas = document.getElementById('myCanvas');
const c = canvas.getContext('2d');


const size = 50;
const colums = canvas.width / size;
const rows = canvas.height / size;
const mine = 'mine';
const mineCount = 20;
const images = {
    'hidden': document.getElementById('hidden'),
    'mine': document.getElementById('mine'),
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

let map = createMap();
let exploredMap = createExploredMap();
placeMines(map, mineCount);
calculateFieldValues(map);
drawMap();

canvas.addEventListener("click", function(event) {
  // Kattintás helye canvas koordinátarendszerében
  const x = event.offsetX;
  const y = event.offsetY;
  const col = Math.floor(x / size);
  const row = Math.floor(y / size);
 exploreField(row, col);
  drawMap();
});

function exploreField(row, col) {
  if (exploredMap[row][col] === false) {
    exploredMap[row][col] = true;
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


                


function placeMines(map, mineCount) {
    let mines = 0;
    while (mines < mineCount) { 
        let x = Math.floor(Math.random() * colums);
        let y = Math.floor(Math.random() * rows);
        if (map[y][x] !== mine) {
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

function createExploredMap() {
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
          if (exploredMap[rowI][colI] === false) {
            drawImage(images.hidden, colI * size, rowI * size);
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
