//traps and danger and death pheromones
const canvas = document.getElementById('canvas');
const bottomSimulation = document.getElementById('bottomSimulation');
const bottomFood = document.getElementById('bottomFood');
const bottomColony= document.getElementById('bottomColony');
const bottomWall = document.getElementById('bottomWall');
const bottomEraser = document.getElementById('bottomEraser');

window.onload = window.onresize = function() {
    canvas.width = window.innerWidth * 0.486;
    canvas.height = window.innerHeight * 0.486;
    CreateMatrix();
  }
const ctx = canvas.getContext('2d');  


keepRunning = false;

AntsCount = 10;
PheromonesDelay = 10;
AntsSensivity = 5;
AntsLiveDuration = 100;

Ants = [];
Cells = [];
Pheromones = [];
Colonies = [];


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
        this.colonyIndex = i;
        this.x = x;
        this.y = y;
        this.IsThereFood = false;
        this.liveDuration = AntsLiveDuration;
        this.Distance = 0;
        // this.prevPlace = [
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        //     {x: 0, y: 0},
        // ]
        // this.iterator = 0;
    }
    contains(SelectedCell)
    {
        let contains = false;
        // for (let i = 0; i<10; ++i)
        // {
        //     if (SelectedCell.x == this.prevPlace[i].x && SelectedCell.y == this.prevPlace[i].y)
        //     {
        //         contains = true;
        //     }
        // }
        return contains;
    }
    iteration()
    {
        // this.liveDuration -= 1;
        // if (this.liveDuration <= 0)
        // {
        //     DrawDeadAnt(this.x, this.y);
        //     this.directionAngle = 0;//0 - N;  1 - NE; 2 - E; 3 - SE; 4 - S; 5 - SW; 6 - W; 7 - NW;
        //     this.directions = [
        //         {x: 0, y: -1}, //N
        //         {x: 1, y: -1}, //NE
        //         {x: 1, y: 0}, //E
        //         {x: 1, y: 1}, //SE
        //         {x: 0, y: 1}, //S
        //         {x: -1, y:1}, //SW
        //         {x:-1, y:0}, //W,
        //         {x:-1, y:-1} //NW
        //         ];
        //     this.x = x;
        //     this.y = y;
        //     this.IsThereFood = false;
        //     this.liveDuration = AntsLiveDuration;
        // }
        let NeighbourCells = GetCircle(this.x, this.y, AntsSensivity);
        if (this.IsThereFood)
        {
            Cells[this.x][this.y].foodPheromone += 2;
            Cells[this.x][this.y].foodPheromoneDistance += this.Distance;
            Cells[this.x][this.y].colonyIndex = this.colonyIndex;
        }
        else
        {
            Cells[this.x][this.y].homePheromone += 2;
            Cells[this.x][this.y].homePheromone += this.Distance;
            Cells[this.x][this.y].colonyIndex = this.colonyIndex;
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
            // if (this.iterator >= 10)
            // {
            //     this.iterator = 0;
            // }
            // this.prevPlace[this.iterator++].x = SelectedCell.x;
            // this.prevPlace[this.iterator++].y = SelectedCell.y;

            this.x = SelectedCell.x;
            this.y = SelectedCell.y;
            if (Cells[SelectedCell.x][SelectedCell.y].food > 0)
            {
                this.IsThereFood = true;
                this.Distance = 0;
                Cells[SelectedCell.x][SelectedCell.y].food -= 0;
            }
            else if (Cells[SelectedCell.x][SelectedCell.y].colony > 0)
            {
                this.IsThereFood = false;
                this.Distance = 0;
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
        this.colonyIndex = 0;
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
function GetPointsValue(CentreX, CentreY, NeighbourCells, goingHome)
{
    let CellsChances = [];
    let ChancesSum = 0;
    for (let i = 0; i < NeighbourCells.length; ++i)
    {
        if (goingHome)
        {
            ChancesSum += Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone
        }
        else
        {
            ChancesSum += Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone
        }
    } 
    if (ChancesSum == 0)
    {
        for (let i = 0; i < NeighbourCells.length; ++i)
        {
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
                    CellsChances.push(1/NeighbourCells.length);
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
                    CellsChances.push(1/NeighbourCells.length);
                }
            }
            else
            {
                CellsChances.push(1/NeighbourCells.length);
            }  
        }
    }
    else
    {
        for (let i = 0; i < NeighbourCells.length; ++i)
        {
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
                        CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone/(ChancesSum));
                    }
                    else{
                        CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone/(ChancesSum));
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
                        CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone/(ChancesSum));
                    }
                    else{
                        CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone/(ChancesSum));
                    }
                }  
            }
            else
            {
                if (goingHome){
                    CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].homePheromone/(ChancesSum));
                }
                else{
                    CellsChances.push(Cells[NeighbourCells[i].x][NeighbourCells[i].y].foodPheromone/(ChancesSum));
                }
            }  
        }
        console.log("ok", ChancesSum, CellsChances);
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
                array.push({x:i, y:j});   
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

function CreateAnts(x, y, colonyIndex)
{
    for (let i =0; i<AntsCount/Colonies.length; ++i)
    {
        let tempAnt = new ant(x, y, colonyIndex);
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
        if (++intervalTimes == 10)
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
        if (++intervalTimes == 10)
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
        if (++intervalTimes == 10)
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
            CreateAnts(Colonies[i].x, Colonies[i].y);
    }
    let i = 0;
    while(i<1000)  
    {
        ++i;
        for (let i = 0; i<AntsCount; ++i)
        {
            Ants[i].iteration();
        }
        for (let i = 0; i<Pheromones.length; ++i)
        {
            if (Cells[Pheromones[i].x][Pheromones[i].y].homePheromone > 0)
                Cells[Pheromones[i].x][Pheromones[i].y].homePheromone -= 1;
            if (Cells[Pheromones[i].x][Pheromones[i].y].foodPheromone > 0)
                Cells[Pheromones[i].x][Pheromones[i].y].foodPheromone -= 1;
        }
        for (let i = 0; i<Colonies.length; ++i)
        {
            DrawColonies(i);
        }
    }
}

canvas.addEventListener('mousedown', function(e) {
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
  
bottomSimulation.onclick =  function(e) 
{
    console.log("started");
    simulation();
}
bottomColony.onclick =  function(e) 
{
    isitColony = 1;
    isitEraser = 0;
    isitFood = 0;
    isitWall = 0;
}
bottomFood.onclick =  function(e) 
{
    isitColony = 0;
    isitEraser = 0;
    isitFood = 1;
    isitWall = 0;
}
bottomWall.onclick =  function(e) 
{
    isitColony = 0;
    isitEraser = 0;
    isitFood = 0;
    isitWall = 1;
}
bottomEraser.onclick =  function(e) 
{
    isitColony = 0;
    isitEraser = 1;
    isitFood = 0;
    isitWall = 0;
}