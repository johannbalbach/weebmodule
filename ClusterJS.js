let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')
ctx.lineWidth = 2

//Нарисовать сетку
function drawGrid(){
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1;
    for(let i = 0; i <= 600; i+=60){
        ctx.moveTo(i,0)
        ctx.lineTo(i,600)
        ctx.stroke()
        ctx.moveTo(0,i)
        ctx.lineTo(600,i)
        ctx.stroke()
    }
}
drawGrid()

//Конструктор объекта (те самые точки, которые расставляет пользователь)
function dataUnit(x,y,cluster){
    this.x = x
    this.y = y
    this.cluster = cluster
}

//Конструктор центра кластера
function centerUnit(x,y,number){
    this.x = x
    this.y = y
    this.number = number
    this.childs = []
}

//Массив всех объектов, подлежащих кластеризации (всех точек)
let openSet = []
let centersClusters = []

let count = 30
//Кол-во кластеров
let kGroups = 3

const n_range = document.querySelector('#n-slider')
const n_value = document.querySelector('#n-value')
n_range.addEventListener('input', (e) => {
  count = e.target.value
  n_value.value = e.target.value
}, true)
n_value.addEventListener('input', (e) => {
    count = e.target.value
    n_range.value = e.target.value
}, true)

const k_range = document.querySelector('#k-slider')
const k_value = document.querySelector('#k-value')
k_range.addEventListener('input', (e) => {
    kGroups = e.target.value
    k_value.value = e.target.value
}, true)
k_value.addEventListener('input', (e) => {
    kGroups = e.target.value
    k_range.value = e.target.value
}, true)

canvas.addEventListener('click', function(event){
    let x = event.offsetX
    let y = event.offsetY

    let unit = new dataUnit(x,y,null)
    openSet.push(unit)
    drawData(unit)
    count++
})

//Рисуем либо точки из массива, либо одиночные
function drawData(unit){
    ctx.fillStyle = '#E0E0E0'
    
    if(Object.prototype.toString.call(unit).includes('Array')){
        unit.forEach(element => {
            ctx.beginPath()
            ctx.arc(element.x, element.y, 10, 0, Math.PI*2)
            ctx.fill()
        });
    }
    else{
        ctx.beginPath()
        ctx.arc(unit.x, unit.y, 10, 0, Math.PI*2)
        ctx.fill()
    }
}

function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawGrid()
}

//Кнопка RANDOM
function randomUnits(){
    openSet = []
    centersClusters = []
    ctx.beginPath()
    clearCanvas()
    //Рандомное создание COUNT объектов на плоскости
    for(let i = 0; i < count; i++){
        let x = Math.floor(Math.random()*580+10)
        let y = Math.floor(Math.random()*580+10)
        openSet.push(new dataUnit(x,y,null))
    }

    drawData(openSet)
}

function distanceBetween(obj1, obj2){
    let x = Math.abs(obj1.x - obj2.x)
    let y = Math.abs(obj1.y - obj2.y)

    return Math.sqrt(x*x+y*y)
}

function sliceOnClusters(){
    centersClusters = []
    //clearCanvas()
    //Случайно определим начальных K-центров из всех точек
    /*
    for(let i = 0; i < kGroups; i++){
        let index = Math.floor((count/kGroups)*i)
        let unit = openSet[index]
        let center = new centerUnit(unit.x,unit.y,i)

        centersClusters.push(center)
    }*/

    function locateCentres(){
        let setForRandom = []
        for(let i = 0; i < openSet.length; i++){
            setForRandom[i] = openSet[i]
        }

        for(let i = 0; i < kGroups; i++){
            let index = Math.floor(Math.random()*setForRandom.length)

            let unit = setForRandom[index]
            let center = new centerUnit(unit.x,unit.y,i)

            centersClusters.push(center)
            setForRandom.splice(index,1)
        }
    }

    //Определяем каждую точку в кластер
    function newClusters(){
        for(let i = 0; i < openSet.length; i++){
            let minDistance = Number.MAX_SAFE_INTEGER
            let clusterIndex = 0

            for(let j = 0; j < centersClusters.length; j++){
                let distance = distanceBetween(openSet[i],centersClusters[j])
                if(distance < minDistance){
                    minDistance = distance
                    clusterIndex = j
                }
            }

            openSet[i].cluster = clusterIndex
            centersClusters[clusterIndex].childs.push(openSet[i])
        }
    }

    //Считаем центры кластеров
    function calculateCentres(){
        for(let i = 0; i < centersClusters.length; i++){
            let sumX = 0
            let sumY = 0
            let count = 0
            
            let center = centersClusters[i]
            for(let j = 0; j < center.childs.length; j++){
                let child = center.childs[j]

                sumX += child.x
                sumY += child.y
                count++
            }

            let avgX = sumX/count
            let avgY = sumY/count

            center.x = avgX
            center.y = avgY
        }
    }

    let intervalTimes = 0
    let intervalID = setInterval(() => {
        if (intervalTimes === 0)
            locateCentres()
        newClusters()
        calculateCentres()
        drawCanvas()
        if (++intervalTimes === 100) {
            clearInterval(intervalID);
        }
    }, 30)
}

function drawCanvas(){
    clearCanvas()

    //let colours = ['red','blue','green','orange','purple','black','navy','yellow','lime','aqua']
    let colours = ['red','blue','green','orange','purple','yellow','brown','aqua','black','lime']

    //Рисуем точки
    for(let i = 0; i < openSet.length; i++){
        let unit = openSet[i]

        ctx.beginPath()
        ctx.fillStyle = '#E0E0E0'
        ctx.strokeStyle = colours[unit.cluster]
        ctx.arc(unit.x, unit.y, 10, 0, Math.PI*2)
        ctx.lineWidth = 4;
        ctx.stroke()
        ctx.fill()
    }

    //Рисуем крестики (центры кластеров)
    for(let i = 0; i < centersClusters.length; i++){
        let unit = centersClusters[i]

        ctx.beginPath()
        ctx.fillStyle = colours[unit.number]
        ctx.fillRect(unit.x-12,unit.y-2,24,4)
        ctx.fillRect(unit.x-2,unit.y-12,4,24)
    }
}