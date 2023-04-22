const canvas = document.getElementById('canvas');
const bottom = document.getElementById('bottom');
const clearbottom = document.getElementById('clearbottom')

// bottom.onclick = function(e) 
// {
//   console.log("generation", generationsCount.value, "population", populationSize.value);
//   geneticAlgorithm();
// }
// clearbottom.onclick = function(e)
// {
//   clear();
// }

window.onload = window.onresize = function() {
  canvas.width = window.innerWidth * 0.486;
  canvas.height = window.innerHeight * 0.486;
}

const ctx = canvas.getContext('2d');  

// console.log(window.innerWidth, window.innerHeight);
// console.log(canvas.width, canvas.height);

//////
const vertices = [];
const mutationsCount = 10;
const populationSize = document.querySelector('#populationValue');
const generationsCount = document.querySelector('#generationValue')
let keepRunning = false;
let generation;
//////

const populationRange = document.querySelector('#populationSlider');
let popS = 15;
let genS = 100;

populationRange.addEventListener('input', (e) => {
  popS = e.target.value
  populationSize.value = e.target.value
}, true)
populationSize.addEventListener('input', (e) => {
    popS = e.target.value
    populationRange.value = e.target.value
}, true)

const generationRange = document.querySelector('#generationSlider')
generationRange.addEventListener('input', (e) => {
    genS = e.target.value
    generationsCount.value = e.target.value
}, true)
generationsCount.addEventListener('input', (e) => {
    genS = e.target.value
    generationRange.value = e.target.value
}, true)

////canvas
const lineWidth = 3;
const lineColor = 'black';
const canvasColor = 'skyblue';
//////

//////
let istherelines = false;
let istherevertices = false;
//////

canvas.addEventListener('mousedown', function(e) {
  const xinteger = e.offsetX;
  const yinteger = e.offsetY;
  vertices.push({xinteger, yinteger});
  ctx.beginPath();
  ctx.arc(xinteger, yinteger, 10, 0, Math.PI*2);
  ctx.fill()
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function contains(arr, elem) {
  return arr.includes(elem)
}
function getWeight(arr)
{
  let weight = 0;
  for (let i = 0; i< arr.length-1; i++)
  {
    let dx = Math.abs(vertices[arr[i]].xinteger - vertices[arr[i+1]].xinteger);
    let dy = Math.abs(vertices[arr[i]].yinteger - vertices[arr[i+1]].yinteger);
    let distance = Math.sqrt(dx*dx + dy*dy);
   
    weight+= distance;
  }
  return weight;
}

class indv{
  weight;
  allvertices = [];
  constructor(size)
  {
    let temp = [];
    while (temp.length < vertices.length)
    {
      let vertice = getRandomInt(size);
      if (!contains(temp, vertice))
        temp.push(vertice);
    }
    this.allvertices = temp;
    this.weight = getWeight(this.allvertices);
  }
  GetPotomki(arr)
  {
    let indexes = new indv(arr.length);
    for (let i = 0; i < arr.length; ++i)
    {
      this.allvertices[i] = arr[indexes[i]];
    }
    this.weight = getWeight(this.allvertices);
  }
  setweight()
  {
    this.weight = getWeight(this.allvertices);
  }

}

class population{
  allIndv = [];
  indexes = [];
  constructor()
  {
    for (let i = 0; i<populationSize.value; ++i)
    {
      let temp = new indv(vertices.length);
      this.allIndv.push(temp);
    }
  }
  FullallIndv(fatherIndv) 
  {
    for (let i = 0; i < populationSize.value; i++) 
    {
        let temp = new indv();
        temp.GetPotomki(fatherIndv);
        this.allIndv.push(temp);
        this.indexes.push(i);
    }
  };
  getFather()
  {
    let father = this.allIndv[0];
    for(let i = 1; i<this.allIndv.length; ++i)
    {
      if (this.allIndv[i].weight < father.weight)
      {
        father = this.allIndv[i];
      }
    }
    return father;
  }
  getMother()
  {
    let father = this.getFather();
    let mother = this.allIndv[0];
    for(let i = 1; i<this.allIndv.length; ++i)
    {
      if ((this.allIndv[i].weight < mother.weight) && (this.allIndv[i].weight != father.weight))
      {
        mother = this.allIndv[i];
      }
    }
    return mother;
  }
  sort()
  {
    for (let i = 0; i< this.allIndv.length; ++i)
    {
      for (let j = i; j<this.allIndv.length; ++j)
      {
        if (this.allIndv[i].weight > this.allIndv[j].weight)
        {
          let temp = this.allIndv[i];
          this.allIndv[i] = this.allIndv[j];
          this.allIndv[j] = temp;
          temp = this.indexes[i];
          this.indexes[i] = this.indexes[j];
          this.indexes[j] = temp;
        }
      }
    }
  }
}

function mutation(individual) 
{
  let firstSwapIndex = getRandomInt(individual.allvertices.length);
  let secondSwapIndex = getRandomInt(individual.allvertices.length);
  let arr = individual.allvertices;
  let temp = arr[firstSwapIndex];
  arr[firstSwapIndex] = arr[secondSwapIndex];
  arr[secondSwapIndex] = temp;
  individual.allvertices = arr;
  individual.weight = getWeight(individual.allvertices);
  return individual;
}

function cross(pop)
{
  let father = pop.allIndv[getRandomInt(pop.allIndv.length-1)];
  let mother = pop.allIndv[getRandomInt(pop.allIndv.length-1)];
  const separator = Math.floor(father.allvertices.length/2);
  let firstson = new indv(father.allvertices.length);
  let secondson = new indv(father.allvertices.length);
  for (let i = 0; i < father.allvertices.length; ++i)
  {
    firstson.allvertices[i] = -1;
    secondson.allvertices[i] = -1;
  }
  for (let i = 0; i < separator; ++i)
  {
    firstson.allvertices[i] = father.allvertices[i];
    secondson.allvertices[i] = mother.allvertices[i];
  }
  //generation first son vertices
  let counter = separator;
  for (let i = separator; i < father.allvertices.length; ++i)
  {
    if (!contains(firstson.allvertices, mother.allvertices[i]))
    {
      firstson.allvertices[counter] = mother.allvertices[i];
      ++counter;
    }
  }
  if (firstson.allvertices[father.allvertices.length-1] === -1)
  {
    for (let i = 0; i<separator; ++i)
    {
      if (!contains(firstson.allvertices, mother.allvertices[i]))
      {
        firstson.allvertices[counter] = mother.allvertices[i];
        ++counter;
      }
    }
  }
  //generation second son vertices
  counter = separator;
  for (let i = separator; i < father.allvertices.length; ++i)
  {
    if (!contains(secondson.allvertices, father.allvertices[i]))
    {
      secondson.allvertices[counter] = father.allvertices[i];
      ++counter;
    }
  }
  if (secondson.allvertices[father.allvertices.length-1] === -1)
  {
    for (let i = 0; i<separator; ++i)
    {
      if (!contains(secondson.allvertices, father.allvertices[i]))
      {
        secondson.allvertices[counter] = father.allvertices[i];
        ++counter;
      }
    }
  }
  firstson.weight = getWeight(firstson.allvertices);
  secondson.weight = getWeight(secondson.allvertices);

  //add new individuals into population
  // pop.allIndv[getRandomInt(populationSize)] = firstson;
  // pop.allIndv[getRandomInt(populationSize)] = secondson;
  // for (let i = 0; i < mutationsCount; ++i)
  // {
  //   let temp = getRandomInt(populationSize);
  //   if (temp > 2)
  //     pop.allIndv[temp] = mutation(pop.allIndv[temp]);
  // }
  pop.allIndv[populationSize.value-1] = firstson;
  pop.allIndv[populationSize.value-2] = secondson;
  for (let i = 3; i < mutationsCount+3; ++i)
  {
    pop.allIndv[populationSize.value-i] = mutation(pop.allIndv[populationSize.value-i]);
  }
  pop.sort();
}

function geneticAlgorithm()
{
  generation = new population();  
  generation.sort();
  let bestpath = new indv(generation.allIndv[0].allvertices.length);
  for (let i = 0; i < generationsCount.value; ++i)
  {
    cross(generation);
    //console.log(i, "best way %d", generation.allIndv[0].weight, generation.allIndv[0].allvertices);
    if (i == generationsCount.value-1)
    {
      if (generation.allIndv[0].weight < bestpath.weight)
      {
        bestpath = generation.allIndv[0];
      }
      DrawLines(bestpath.allvertices);
    }
  }
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
  for (let i = 0; i < vertices.length - 1; i++) 
  {
      drawLine(vertices[inputvertices[i]].xinteger, vertices[inputvertices[i]].yinteger,
         vertices[inputvertices[i + 1]].xinteger, vertices[inputvertices[i + 1]].yinteger, lineWidth, lineColor);
  }
  drawLine(vertices[inputvertices[inputvertices.length - 1]].xinteger, vertices[inputvertices[inputvertices.length - 1]].yinteger,
     vertices[inputvertices[0]].xinteger, vertices[inputvertices[0]].yinteger, lineWidth, lineColor);
  istherelines = true;
} 

function ClearLines(inputvertices) 
{
  for (let i = 0; i < inputvertices.length - 1; i++) 
  {
      drawLine(vertices[inputvertices[i]].xinteger, vertices[inputvertices[i]].yinteger,
         vertices[inputvertices[i + 1]].xinteger, vertices[inputvertices[i + 1]].yinteger, lineWidth+2, canvasColor);
  }
  drawLine(vertices[inputvertices[inputvertices.length - 1]].xinteger, vertices[inputvertices[inputvertices.length - 1]].yinteger,
     vertices[inputvertices[0]].xinteger, vertices[inputvertices[0]].yinteger, lineWidth+2, canvasColor);

  for (let i = 0; i < vertices.length; i++)
  {
    ctx.beginPath();  
    ctx.arc(vertices[i].xinteger, vertices[i].yinteger, 10, 0, Math.PI*2);
    ctx.fill();
  }
  istherelines = false;
} 

function clear()
{
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = 'black';
  vertices.length = 0; 
}
function StartBottom() 
{
  console.log('started');
  if(istherelines)
  {
      ClearLines(generation.allIndv[0].allvertices);
  }
  geneticAlgorithm();
}
function ClearBottom()
{
  if (!istherelines)
  {
    clear();
  }
  else if (generation != null)
    ClearLines(generation.allIndv[0].allvertices)
}
