const canvas = document.getElementById('canvas');
const bottom = document.getElementById('bottom');
const clearbottom = document.getElementById('clearbottom')

window.onload = window.onresize = function() {
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.8;
}

const ctx = canvas.getContext('2d');  

//////
const vertices = [];
const Ants = [];
const mutationsCount = 10;
//////

const alphaV = document.querySelector('#alphaValue');
const alphaS = document.querySelector('#alphaSlider');
const betaV = document.querySelector('#betaValue');
const betaS = document.querySelector('#betaSlider');
const gammaV = document.querySelector('#gammaValue');
const gammaS = document.querySelector('#gammaSlider');
const iterationsV = document.querySelector('#iterationsValue');
const iterationsS = document.querySelector('#iterationsSlider');
const pheromonesV = document.querySelector('#pheromonesValue');
const pheromonesS = document.querySelector('#pheromonesSlider');

let alpha = 3;//the influence of pheromones on the probability of a path
let beta = 2;//the influence of distance on the probability of a path
let gamma = 1;//how much pheromones ant create relative to distance
let iterationsCount = 100;//how much iteration ants does
let pheromonesDelay = 0.5;//how much pheromones remains per iteration 

alphaS.addEventListener('input', (e) => {
  alpha = e.target.value
  alphaV.value = e.target.value
}, true)
alphaV.addEventListener('input', (e) => {
    alpha = e.target.value
    alphaS.value = e.target.value
}, true)
betaS.addEventListener('input', (e) => {
beta = e.target.value
betaV.value = e.target.value
}, true)
betaS.addEventListener('input', (e) => {
    beta = e.target.value
    betaV.value = e.target.value
}, true)

gammaS.addEventListener('input', (e) => {
gamma = e.target.value
gammaV.value = e.target.value
}, true)
gammaV.addEventListener('input', (e) => {
    gamma = e.target.value
    gammaS.value = e.target.value
}, true)

iterationsS.addEventListener('input', (e) => {
iterationsCount = e.target.value
iterationsV.value = e.target.value
}, true)
iterationsV.addEventListener('input', (e) => {
    iterationsCount = e.target.value
    iterationsS.value = e.target.value
}, true)

pheromonesS.addEventListener('input', (e) => {
    pheromonesDelay = e.target.value/100
    pheromonesV.value = e.target.value/100
}, true)
pheromonesV.addEventListener('input', (e) => {
    pheromonesDelay = e.target.value/100
    pheromonesS.value = e.target.value/100
}, true)

////canvas
const lineWidth = 3;
const verticesSize = 10;
const lineColor = 'black';
const canvasColor = 'skyblue';
//////

//////
let istherelines = false;
let istherevertices = false;
//////

canvas.addEventListener('mousedown', function(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    //console.log(e.clientX, canvas.offsetLeft, e.clientY, canvas.offsetTop, e.offsetX, e.offsetY);
    let tempVertices = new vertice(x, y);
    vertices.push(tempVertices);
    ctx.beginPath();
    ctx.arc(x, y, verticesSize, 0, Math.PI*2);
    ctx.fill()
  });

class vertice{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
        this.pheromones = 0;
    }
}
class Ant{
    constructor(i)
    {
        this.tabuList = [];
        this.startVertices = vertices[i];
        this.currentVertices = vertices[i];
        this.tabuList.push(i);
    }
    iteration()
    {
        let chances = [];
        let chancesSum = 0;
        for (let i = 0; i<vertices.length; ++i)
        {
            if (!contains(this.tabuList, i))
            {
                let weight = getWeight(this.currentVertices.x, this.currentVertices.y, vertices[i].x, vertices[i].y);
                let pheromones = vertices[i].pheromones;
                let tempChances = Math.pow(pheromones, alpha) * Math.pow(weight, beta);
                if (pheromones == 0)
                    tempChances = Math.pow(weight, beta);
                chances.push(tempChances);
                chancesSum += tempChances;
            }
            else
            {
                chances.push(0);
            }
        }
        for (let i = 0; i<chances.length; ++i)
        {
            chances[i] = chances[i]/chancesSum;
        }
        let choosedIndex = randomWithProbability(chances);
        this.tabuList.push(choosedIndex);
        vertices[choosedIndex].pheromones += gamma/getWeight(this.currentVertices.x, this.currentVertices.y, vertices[choosedIndex].x, vertices[choosedIndex].y); 
        this.currentVertices = vertices[choosedIndex];
    }
    endIteration()
    {
        this.tabuList.length = 1;
        this.currentVertices = this.startVertices;
    }
};

function randomWithProbability(probabilities) 
{
    let random = Math.random();
  
    let acc = 0;
    for (let i = 0; i < probabilities.length; i++) {
      acc += probabilities[i];
      if (acc >= random) {
        return i;
      }
    }

    console.log('place doesnt choosed');
    return null;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function contains(arr, elem) {
    return arr.includes(elem)
  }
function getWeight(x,y,x1,y1)
{
    let dx = Math.abs(x - x1);
    let dy = Math.abs(y - y1);
    let distance = Math.sqrt(dx*dx + dy*dy)
    return distance;
}

function getArrayWeight(arr)
{
    let weight = 0;
    for (let i = 0; i< arr.length-1; i++)
    {
        let dx = Math.abs(vertices[arr[i]].x - vertices[arr[i+1]].x);
        let dy = Math.abs(vertices[arr[i]].y - vertices[arr[i+1]].y);
        let distance = Math.sqrt(dx*dx + dy*dy);

        weight+= distance;
    }
    //console.log("getarray", arr, weight);
    return weight;
}

let bestpath = [];
function simulation()
{
    for (let i = 0; i<vertices.length; ++i)
    {
        let tempAnt = new Ant(i);
        Ants.push(tempAnt);
        bestpath.push(i);
    }
    let counter = 0;
    while (counter < iterationsCount)
    {
        //console.log(bestpath);
        counter++;
        for (let i = 0; i<vertices.length-1; ++i)
        {
            for (let j = 0; j<Ants.length; ++j)
            {
                Ants[j].iteration();
            }
        }
        for (let i = 0; i<vertices.length; ++i)
        {
            if (getArrayWeight(bestpath) > getArrayWeight(Ants[i].tabuList))
            {
                let clone = Object.assign({}, Ants[i])
                bestpath = clone.tabuList.slice();
            }
            //console.log(bestpath);
            vertices[i].pheromones = vertices[i].pheromones * pheromonesDelay;
        }
        if (counter <= iterationsCount - 1)
        {
            for (let i = 0; i<Ants.length; ++i)
            {
                Ants[i].endIteration();
            }
        }
    }
    //console.log(bestpath, vertices, Ants, Ants[0].tabuList);
    DrawLines(bestpath);
} 

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
    currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


function drawLine(x1, y1, x2, y2, width, color) 
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    // ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance/300})`;
    ctx.stroke();
}

function DrawLines(inputvertices) 
{
    //console.log(inputvertices);
    for (let i = 0; i < vertices.length - 1; i++) 
    {
        drawLine(vertices[inputvertices[i]].x, vertices[inputvertices[i]].y,
            vertices[inputvertices[i + 1]].x, vertices[inputvertices[i + 1]].y, lineWidth, lineColor);
    }
    drawLine(vertices[inputvertices[inputvertices.length - 1]].x, vertices[inputvertices[inputvertices.length - 1]].y,
        vertices[inputvertices[0]].x, vertices[inputvertices[0]].y, lineWidth, lineColor);
    istherelines = true;
} 

function ClearLines(inputvertices) 
{
  for (let i = 0; i < inputvertices.length - 1; i++) 
  {
      drawLine(vertices[inputvertices[i]].x, vertices[inputvertices[i]].y,
         vertices[inputvertices[i + 1]].x, vertices[inputvertices[i + 1]].y, lineWidth+2, canvasColor);
  }
  drawLine(vertices[inputvertices[inputvertices.length - 1]].x, vertices[inputvertices[inputvertices.length - 1]].y,
     vertices[inputvertices[0]].x, vertices[inputvertices[0]].y, lineWidth+2, canvasColor);

  for (let i = 0; i < vertices.length; i++)
  {
    ctx.beginPath();  
    ctx.arc(vertices[i].x, vertices[i].y, verticesSize, 0, Math.PI*2);
    ctx.fill();
  }
  istherelines = false;
  for (let i= 0; i< vertices.length; ++i)
  {
    vertices[i].pheromones = 0;
  }
  bestpath.length = 0;
  Ants.length = 0;
} 

function clear()
{
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = 'black';
  vertices.length = 0; 
  bestpath.length = 0;
}
function StartBottom() 
{
  console.log('started');
  if(istherelines)
  {
      ClearLines(bestpath);
  }
  simulation();
}
function ClearBottom()
{
  if (!istherelines)
  {
    clear();
  }
  else if (bestpath != null)
    ClearLines(bestpath);
}