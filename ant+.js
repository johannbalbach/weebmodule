//just food/home pheromone distance
const canvas = document.getElementById('canvas');

window.onload = window.onresize = function() {
    canvas.width = window.innerWidth * 0.5;
    canvas.height = window.innerHeight * 0.8;
    CreateMatrix();
  }
const ctx = canvas.getContext('2d');  

let isMouseDown = false; 
keepRunning = false;
Ants = [];
Cells = [];
Pheromones = [];
Colonies = [];
const alphaV = document.querySelector('#alphaValue');
const alphaS = document.querySelector('#alphaSlider');
const betaV = document.querySelector('#betaValue');
const betaS = document.querySelector('#betaSlider');
const gammaV = document.querySelector('#gammaValue');
const gammaS = document.querySelector('#gammaSlider');
const iterationsV = document.querySelector('#iterationsValue');
const iterationsS = document.querySelector('#iterationsSlider');
let AntsCount = 50;
let PheromonesDelay = 8;
let AntsSensivity = 10;
let iterationsCount = 5000;

alphaS.addEventListener('input', (e) => {
  AntsCount = e.target.value
  alphaV.value = e.target.value
}, true)
alphaV.addEventListener('input', (e) => {
    AntsCount = e.target.value
    alphaS.value = e.target.value
}, true)
betaS.addEventListener('input', (e) => {
PheromonesDelay = e.target.value
betaV.value = e.target.value
}, true)
betaV.addEventListener('input', (e) => {
    PheromonesDelay = e.target.value
    betaS.value = e.target.value
}, true)
gammaS.addEventListener('input', (e) => {
AntsSensivity = e.target.value
gammaV.value = e.target.value
}, true)
gammaV.addEventListener('input', (e) => {
    AntsSensivity = e.target.value
    gammaS.value = e.target.value
}, true)
iterationsS.addEventListener('input', (e) => {
    iterationsCount = e.target.value
    iterationsV.value = e.target.value
    }, true)

//canvas or draw parametrs
backgroundColor = 'skyblue';//rgb(78, 29, 29)
antColor = 'red';
antWithFoodColor = 'blue';
antSize = 2;

foodColor = 'green';
foodSize = 10;
wallColor = 'grey';
wallSize = 10;
colonyColor = 'pink';
colonySize = 10;
eraserSize = 10;

isitColony = false;
isitFood = false;
isitWall = false;
isitEraser = false;
//



class ant{
    constructor(x, y, i)
    {
        this.colonyindex = i;
        this.x = x;
        this.y = y;
        this.IsThereFood = false;
        this.Distance = 0;
        this.prevPlace = [
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
        ]
        this.iterator = 0;
    }
    contains(SelectedCell)
    {
        let contains = false;
        for (let i = 0; i<10; ++i)
        {
            if (SelectedCell.x == this.prevPlace[i].x && SelectedCell.y == this.prevPlace[i].y)
            {
                contains = true;
            }
        }
        return contains;
    }
    iteration()
    {
        this.liveDuration -= 1;
        // if (this.liveDuration <= 0)
        // {
        //     DrawDeadAnt(this.x, this.y);
        //     this.colonyindex = i;
        //     this.x = Colonies[i].x;
        //     this.y = Colonies[i].y;  
        //     this.IsThereFood = false;
        //     this.liveDuration = AntsLiveDuration;
        // }
        let NeighbourCells = GetCircle(this.x, this.y, AntsSensivity);
        if (this.IsThereFood)
        {
            if (Cells[this.x][this.y].foodPheromone < 100)
                Cells[this.x][this.y].foodPheromone += 15;
            Cells[this.x][this.y].foodPheromoneDistance = this.Distance;
        }
        else
        {
            if(Cells[this.x][this.y].homePheromone < 100)
                Cells[this.x][this.y].homePheromone += 15;
            Cells[this.x][this.y].homePheromoneDistance = this.Distance;
        }
        Pheromones.push({x:this.x, y:this.y});
        let CellsChances = GetPointsValue(this.x, this.y, NeighbourCells, this.IsThereFood);
        let SelectedCell = NeighbourCells[RandomWithProbability(CellsChances)];
        if (SelectedCell != null && !this.contains(SelectedCell))
        {
            let dx = Math.abs(this.x - SelectedCell.x);
            let dy = Math.abs(this.y - SelectedCell.y);
            let distance = Math.sqrt(dx*dx + dy*dy);
            this.Distance += distance;
            DeleteAnt(this.x, this.y);
            if (this.iterator >= 10)
            {
                this.iterator = 0;
            }
            this.prevPlace[this.iterator++].x = SelectedCell.x;
            this.prevPlace[this.iterator++].y = SelectedCell.y;
    
            this.x = SelectedCell.x;
            this.y = SelectedCell.y;
            if (Cells[SelectedCell.x][SelectedCell.y].food > 0)
            {
                this.IsThereFood = true;
                this.Distance = 1;
                Cells[SelectedCell.x][SelectedCell.y].food -= 1;
            }
            else if (Cells[SelectedCell.x][SelectedCell.y].colony > 0)
            {
                this.IsThereFood = false;
                this.Distance = 1;
            }
            DrawAnt(this.x, this.y, this.IsThereFood);
        }
    }
    };
    class cell{
    constructor(x, y)
    {
        this.homePheromone = 0;//max: pheromones delay amount, 0: no pheromones
        this.foodPheromone = 0;
        this.homePheromoneDistance = 0;
        this.foodPheromoneDistance = 0;
        this.x = x;
        this.y = y;
        this.wall = 0;
        this.food = 0;
        this.colony = 0;
    }
    };
    
    function RandomWithProbability(probabilities) 
    {
    let random = Math.random();
    
    let acc = 0;
    for (let i = 0; i < probabilities.length; i++) {
      acc += probabilities[i];
      if (acc >= random) {
        return i;
      }
    }
    
    //console.log('place doesnt choosed');
    return null;
    }
    
    
function GetPointsValue(x, y, NeighbourCells, goingHome)
{
    let CellsChances = [];
    let ChancesSum = 0;
    
    for (let i = 0; i < NeighbourCells.length; ++i)
    {
        let dx = Math.abs(x - NeighbourCells[i].x);
        let dy = Math.abs(y - NeighbourCells[i].y);
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (goingHome)
        {
            if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone > 0)
            {
                if (distance != 0)
                {
                    ChancesSum += (1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance))*(1/distance);
                }
            }
        }
        else
        {
            if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone > 0)
            {
                if (distance != 0)
                {
                    ChancesSum += (1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance))*(1/distance);
                }
            }      
        }
    } 
    if (ChancesSum == 0)
    {
        for (let i = 0; i < NeighbourCells.length; ++i)
        {
            let dx = Math.abs(x - NeighbourCells[i].x);
            let dy = Math.abs(y - NeighbourCells[i].y);
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance != 0)
                ChancesSum += (1/distance);
        } 
        for (let i = 0; i < NeighbourCells.length; ++i)
        {
            let dx = Math.abs(x - NeighbourCells[i].x);
            let dy = Math.abs(y - NeighbourCells[i].y);
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].wall == 1)
            {
                CellsChances.push(0);
            }
            else if(Cells[NeighbourCells[i].x][NeighbourCells[i].y].colony == 1)
            {
                if (goingHome)
                {
                    CellsChances.push(1);
                    break;
                }
                else{
                    if (distance != 0)
                    {
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone != 0)
                        {
                            CellsChances.push(((1/distance) * (1/Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone))/(ChancesSum));
                        }
                        else{
                            CellsChances.push((1/distance)/(ChancesSum));
                        }
                    }
                    else
                        CellsChances.push(0);
                }
            }
            else if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].food == 1)
            {
                if (!goingHome)
                {
                    CellsChances.push(1);
                    break;
                }
                else{
                    if (distance != 0)
                    {
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone != 0)
                        {
                            CellsChances.push(((1/distance) * (1/Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone))/(ChancesSum));
                        }
                        else{
                            CellsChances.push((1/distance)/(ChancesSum));
                        }
                    }
                    else
                        CellsChances.push(0);
                }
            }
            else
            {
                if (distance != 0)
                {
                    if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone != 0)
                    {
                        CellsChances.push(((1/distance) * (1/Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone))/(ChancesSum));
                    }
                    else{
                        CellsChances.push((1/distance)/(ChancesSum));
                    }
                }
                else
                    CellsChances.push(0);
            }  
        }
    }
    else
    {
        for (let i = 0; i < NeighbourCells.length; ++i)
        {
            let dx = Math.abs(x - NeighbourCells[i].x);
            let dy = Math.abs(y - NeighbourCells[i].y);
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].wall == 1)
            {
                CellsChances.push(0);
            }
            else if(Cells[NeighbourCells[i].x][NeighbourCells[i].y].colony == 1)
            {
                if (goingHome){
                    CellsChances.push(1);
                    break;
                }
                else
                {
                    if (goingHome){
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone > 0)
                        {
                            CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance))*(1/distance))/(ChancesSum));
                        }
                        else{
                            CellsChances.push(0);
                        }
                    }
                    else{
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone > 0)
                        {
                            CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance))*(1/distance))/(ChancesSum));
                        }
                        else{
                            CellsChances.push(0);
                        }
                    }
                }  
            }
            else if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].food == 1)
            {
                if (!goingHome){
                    CellsChances.push(1);
                    break;
                }
                else
                {
                    if (goingHome){
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone > 0)
                        {
                            CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance))*(1/distance))/(ChancesSum));
                        }
                        else{
                            CellsChances.push(0);
                        }
                    }
                    else{
                        if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone > 0)
                        {
                            CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance))*(1/distance))/(ChancesSum));
                        }
                        else{
                            CellsChances.push(0);
                        }
                    }
                }  
            }
            else
            {
                if (goingHome){
                    if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone > 0)
                    {
                        CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromoneDistance))*(1/distance))/(ChancesSum));
                    }
                    else{
                        CellsChances.push(0);
                    }
                }
                else{
                    if (Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance!= 0 && distance != 0 && Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone > 0)
                    {
                        CellsChances.push(((1/(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromoneDistance))*(1/distance))/(ChancesSum));
                    }
                    else{
                        CellsChances.push(0);
                    }
                }
            }  
        }
    }
    return CellsChances;
}

function GetDistance(x1, y1, x2, y2)
{
    return Math.sqrt(Math.abs(x1 - x2) ** 2 + Math.abs(y1-y2)**2);
}
function GetCircle(x, y, radius)
{
    let array = [];
    let R = radius;
    let cX = x - R;
    for (let i = cX; i <= x+R; ++i)
    {
        let cY = y +R;
        for (let j = cY; j >= y-R; --j)
        {
            if (((x - i)*(x-i) + (y - j)*(y - j)) <= (R*R))
            {
                if (i>0 && i<canvas.width && j>0 && j<canvas.height)
                {
                    array.push({x:i, y:j});   
                }
            }
        }
    }
    return array;
}
function CreateMatrix()
{
    for (let i=0; i<canvas.width; i++)
    {
        Cells[i] = new Array();
        for (let j = 0; j<canvas.height; ++j)
        {
            temp = new cell(i, canvas.height - j);
            Cells[i][j] = temp;
        }
    }
    for (let i = 0; i<canvas.width; ++i)
    {
        Cells[i][0].wall = 1;
        Cells[i][canvas.height-10].wall = 1;
    }
    for (let i = 0; i<canvas.height; ++i)
    {
        Cells[10][i].wall = 1;
        Cells[canvas.width-10][i].wall = 1;
    }
}

function CreateAnts(x, y)
{
    for (let i =0; i<AntsCount/Colonies.length; ++i)
    {
        let tempAnt = new ant(x, y);
        Ants.push(tempAnt);
    }
}
async function DrawAnt(x, y, IsThereFood)
{
    let intervalTimes = 0;
    let intervalID = setInterval(() => {
        ctx.beginPath();
        ctx.arc(x, y, antSize, 0, Math.PI*2);
        if (IsThereFood)
            ctx.fillStyle = antColor;
        else
            ctx.fillStyle = antWithFoodColor;
        ctx.fill()
        if (++intervalTimes == 1)
        {
            clearInterval(intervalID);
        }
    }, 2)
}
async function DeleteAnt(x, y)
{
    let intervalTimes = 0;
    let intervalID = setInterval(() => {
        ctx.beginPath();
        ctx.arc(x, y, antSize, 0, Math.PI*2);
        ctx.fillStyle = backgroundColor;
        ctx.fill()
        if (++intervalTimes == 1)
        {
            clearInterval(intervalID);
        }
    }, 2)
}
async function DrawColonies(i)
{
    let intervalTimes = 0;
    let intervalID = setInterval(() => {
        ctx.beginPath();
        ctx.arc(Colonies[i].x, Colonies[i].y, colonySize, 0, Math.PI*2);
        ctx.fillStyle = colonyColor;
        ctx.fill();
        if (++intervalTimes == 1)
        {
            clearInterval(intervalID);
        }
    }, 2)
}
function simulation()
{
    keepRunning = true;

    for (let i = 0; i<Colonies.length; ++i)
    {
        if (Colonies[i].x != null && Colonies[i].y != null)
        {
            CreateAnts(Colonies[i].x, Colonies[i].y);
        }
            
    }
    let counter = 0;
    while(counter<iterationsCount)  
    {
        ++counter;
        for (let i = 0; i<AntsCount; ++i)
        {
            Ants[i].iteration();
        }
        for (let i = 0; i<Pheromones.length; ++i)
        {
            if (Cells[Pheromones[i].x][Pheromones[i].y].homePheromone > 0)
                Cells[Pheromones[i].x][Pheromones[i].y].homePheromone -= PheromonesDelay;
            if (Cells[Pheromones[i].x][Pheromones[i].y].foodPheromone > 0)
                Cells[Pheromones[i].x][Pheromones[i].y].foodPheromone -= PheromonesDelay;
        }
        for (let i = 0; i<Colonies.length; ++i)
        {
            DrawColonies(i);
        }
    }
    console.log("ended");
}

  canvas.addEventListener('mousedown', function(e)
  {
    isMouseDown = true;
    const x = e.offsetX;
    const y = e.offsetY;
    if (isitColony)
    {
        let coloniesCells = GetCircle(x,y, colonySize);
        for (let i = 0; i < coloniesCells.length; i++) 
        {
            Cells[coloniesCells[i].x][coloniesCells[i].y].colony = 1;
        }
        Colonies.push({x:x, y:y});
        ctx.beginPath();
        ctx.arc(x, y, colonySize, 0, Math.PI*2);
        ctx.fillStyle = colonyColor;
        ctx.fill()
    }
    else if (isitFood)
    {
        let foodCells = GetCircle(x,y, foodSize);
        for (let i = 0; i < foodCells.length; i++) 
        {
            if (Cells[foodCells[i].x][foodCells[i].y].food <5)
                Cells[foodCells[i].x][foodCells[i].y].food += 1;
        }
        ctx.beginPath();
        ctx.arc(x, y, foodSize, 0, Math.PI*2);
        ctx.fillStyle = foodColor;
        ctx.fill()
    }
    else if (isitWall)
    {
        let wallCells = GetCircle(x,y, wallSize);
        for (let i = 0; i < wallCells.length; i++) 
        {
            Cells[wallCells[i].x][wallCells[i].y].wall = 1;
        }
        ctx.beginPath();
        ctx.arc(x, y, wallSize, 0, Math.PI*2);
        ctx.fillStyle = wallColor;
        ctx.fill()
    }
    else if (isitEraser)
    {
        let eraserCells = GetCircle(x,y, eraserSize);
        for (let i = 0; i < eraserCells.length; i++) 
        {
            for (let j = 0; j < Colonies.length; ++j)
            {
                if (Colonies[j].x == eraserCells[i].x && Colonies[j].y ==eraserCells[i].y)
                {

                    Colonies.splice(j, 1);
                }
            }
            Cells[eraserCells[i].x][eraserCells[i].y].wall = 0;
            Cells[eraserCells[i].x][eraserCells[i].y].food = 0;
            Cells[eraserCells[i].x][eraserCells[i].y].colony = 0;
        }
        ctx.beginPath();
        ctx.arc(x, y, eraserSize, 0, Math.PI*2);
        ctx.fillStyle = backgroundColor;
        ctx.fill()
    }
    else
    {

    }
  });
  canvas.addEventListener('mouseup', function(){
    isMouseDown = false;
  })
  canvas.addEventListener('mousemove', function(e){
    if (isMouseDown)
    {
        const x = e.offsetX;
        const y = e.offsetY;
        if (isitColony)
        {
            let coloniesCells = GetCircle(x,y, colonySize);
            for (let i = 0; i < coloniesCells.length; i++) 
            {
                Cells[coloniesCells[i].x][coloniesCells[i].y].colony = 1;
            }
            Colonies.push({x:x, y:y});
            ctx.beginPath();
            ctx.arc(x, y, colonySize, 0, Math.PI*2);
            ctx.fillStyle = colonyColor;
            ctx.fill()
        }
        else if (isitFood)
        {
            let foodCells = GetCircle(x,y, foodSize);
            for (let i = 0; i < foodCells.length; i++) 
            {
                if (Cells[foodCells[i].x][foodCells[i].y].food <5)
                    Cells[foodCells[i].x][foodCells[i].y].food += 1;
            }
            ctx.beginPath();
            ctx.arc(x, y, foodSize, 0, Math.PI*2);
            ctx.fillStyle = foodColor;
            ctx.fill()
        }
        else if (isitWall)
        {
            let wallCells = GetCircle(x,y, wallSize);
            for (let i = 0; i < wallCells.length; i++) 
            {
                Cells[wallCells[i].x][wallCells[i].y].wall = 1;
            }
            ctx.beginPath();
            ctx.arc(x, y, wallSize, 0, Math.PI*2);
            ctx.fillStyle = wallColor;
            ctx.fill()
        }
        else if (isitEraser)
        {
            let eraserCells = GetCircle(x,y, eraserSize);
            for (let i = 0; i < eraserCells.length; i++) 
            {
                for (let j = 0; j < Colonies.length; ++j)
                {
                    if (Colonies[j].x == eraserCells[i].x && Colonies[j].y ==eraserCells[i].y)
                    {
    
                        Colonies.splice(j, 1);
                    }
                }
                Cells[eraserCells[i].x][eraserCells[i].y].wall = 0;
                Cells[eraserCells[i].x][eraserCells[i].y].food = 0;
                Cells[eraserCells[i].x][eraserCells[i].y].colony = 0;
            }
            ctx.beginPath();
            ctx.arc(x, y, eraserSize, 0, Math.PI*2);
            ctx.fillStyle = backgroundColor;
            ctx.fill()
        }
        else
        {
    
        }
    }
  })

  
  function BottomSimulation() 
  {
      console.log("started");
      simulation();
  }
  function BottomColony() 
  {
      isitColony = 1;
      isitEraser = 0;
      isitFood = 0;
      isitWall = 0;
  }
  function BottomFood() 
  {
      isitColony = 0;
      isitEraser = 0;
      isitFood = 1;
      isitWall = 0;
  }
  function BottomWall() 
  {
      isitColony = 0;
      isitEraser = 0;
      isitFood = 0;
      isitWall = 1;
  }
  function BottomEraser() 
  {
      isitColony = 0;
      isitEraser = 1;
      isitFood = 0;
      isitWall = 0;
  }