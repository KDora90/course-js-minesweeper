const image = document.getElementById('hidden');
const canvas = document.getElementById('myCanvas');
const c = canvas.getContext('2d');

const size = 50;
const colums = canvas.width / size;
const rows = canvas.height / size;

drawMap();

function drawMap () {
    for (let i = 0; i <colums; i++){
        for (let j = 0; j < rows; j++){
            drawImage(i * size, j * size);

        }
    }

} 

function drawImage(x, y) {
    c.drawImage(image, x, y, size, size);
}


