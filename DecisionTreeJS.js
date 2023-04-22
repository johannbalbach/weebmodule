const csvFile = document.getElementById("csv-file");

let header = []
let targetID = 0
let maxDepth = 10
let arr = []
let decision = null

const id_value = document.querySelector('#id-value')
id_value.addEventListener('input', (e) => {
    targetID = e.target.value - 1
}, true)
const depth_value = document.querySelector('#depth-value')
depth_value.addEventListener('input', (e) => {
    maxDepth = e.target.value - 1
}, true)
const decision_text = document.querySelector('#decision-value')
decision_text.addEventListener('input', (e) => {
    decision = e.target.value
}, true)

function readArray(){
    const file = csvFile.files[0]
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = function() {
        let data = reader.result.split('\r\n')
        for(let i = 0; i < data.length; i++){
            arr[i] = data[i]
            arr[i] = arr[i].split(',')
        }
        header = arr[0]
        arr = arr.slice(1)
        createTree()
    }
}

class Node {
    constructor(data, parent, div) {
        this.data = data
        this.entropy = this.calculateEntropy()
        this.left = null
        this.right = null
        this.availableQuestions = this.identifyQuestions()
        this.question = this.calculateDataGrow()

        this.isLeaf = false
        this.prediction = null
        this.div = div
        this.parent = parent
        this.level = 0
        if(parent != null)
            this.level = parent.level + 1
    }

    //Определяет какие вопросы можно задать данной ноде
    identifyQuestions(arr = this.data){
        let questions = []
        this.columns = []
        for(let i = 0; i < header.length; i++){
            if(i != targetID)
                this.columns.push(i)
        }

        this.columns.forEach((columnIndex) => {
            let max = Number.MIN_SAFE_INTEGER

            /*if(typeof(arr[0][columnIndex]) === 'number')
            {
                for(let i = 0; i < arr.length; i++){
                    if(arr[i][columnIndex] > max){
                        max = arr[i][columnIndex]
                    }
                }

                for(let i = 0; i < arr.length; i++){
                    if(arr[i][columnIndex] < max){
                        questions.push(new Question(header[columnIndex], columnIndex, parseInt(arr[i][columnIndex])))
                    }
                }
            }*/
            
            for(let i = 0; i < arr.length; i++){
                let curValue =  arr[i][columnIndex]
                if(!isNaN(parseInt(curValue)))
                    curValue = parseInt(curValue)
                let currentQuestion = new Question(header[columnIndex], columnIndex, curValue)
                if(!questions.some(item => {
                    return Object.entries(currentQuestion).every(([key, value]) => {
                        return item.hasOwnProperty(key) && item[key] === value;
                    })
                })){
                    questions.push(currentQuestion)
                }
            }
            //questions.push(new Question(header[columnIndex], columnIndex, arr[i][columnIndex]))
        })

        return questions
    }

    //Считает энтропию ноды
    calculateEntropy(arr = this.data){
        const map = new Map()

        for(let i = 0; i < arr.length; i++){
            const value = arr[i][targetID]
            
            if(map.has(value)){
                map.set(value, map.get(value) + 1)
            }else{
                map.set(value, 1)
            }
        }

        let entropy = 0

        for(const obj of map){
            let probability = obj[1] / arr.length
            entropy -= probability * Math.log2(probability)
        }

        return entropy
    }

    //Смотрит разбиение текущей ноды на все доступные ей вопросы, для каждого разбиения считает его энтропию
    calculateDataGrow(){
        let questionsEntropy = []

        for(let i = 0; i < this.availableQuestions.length; i++){
            let currentQuestion = this.availableQuestions[i]

            let left = []
            let right = []
            for(let j = 0; j < this.data.length; j++){
                if(this.data[j][currentQuestion.column] <= currentQuestion.value){
                    left.push(this.data[j])
                }else{
                    right.push(this.data[j])
                }
            }

            let currentEntropy = this.entropy
            currentEntropy -= (left.length / (this.data.length)) * this.calculateEntropy(left)
            currentEntropy -= (right.length / (this.data.length)) * this.calculateEntropy(right)
            questionsEntropy.push({name: currentQuestion.name, column: currentQuestion.column, value: currentQuestion.value, entropy: currentEntropy})
        }

        let maxEntropy = 0
        let maxEntropyIndex = 0
        for(let i = 0; i < questionsEntropy.length; i++){
            if(questionsEntropy[i].entropy > maxEntropy){
                maxEntropy = questionsEntropy[i].entropy
                maxEntropyIndex = i
            }
        }

        return questionsEntropy[maxEntropyIndex]
    }
}

class Question{
    constructor(name, column, value){
        this.name = name
        this.column = column
        this.value = value
        this.type = typeof value
    }
}

class DecisionTree {
    constructor(data){
        this.root = new Node(data, null)
        this.depth = 0
        this.divs = []
    }

    create(node = this.root){
        let leftData = []
        let rightData = []

        this.depth = Math.max(this.depth, node.level)
        for(let i = 0; i < node.data.length; i++){
            if (node.data[i][node.question.column] <= node.question.value){
                leftData.push(node.data[i])
            }else{
                rightData.push(node.data[i])
            }
        }

        if(node.question === null || node.entropy === 0 || node.level > maxDepth){
            node.isLeaf = true
            let predictions = []

            const map = new Map()
            for(let i = 0; i < node.data.length; i++){
                const value = node.data[i][targetID]
                
                if(map.has(value)){
                    map.set(value, map.get(value) + 1)
                }else{
                    map.set(value, 1)
                }
            }

            let key = 0
            let maxValue = 0
            const mapArray = Array.from(map.entries());
            for(let i = 0; i < mapArray.length; i++){
                if(mapArray[i][1] >= maxValue){
                    maxValue = mapArray[i][1]
                    key = i
                }
            }

            node.prediction = node.data[key][targetID]
            return
        }

        if(leftData.length > 0){
            let leftNode = new Node(leftData, node)
            node.left = leftNode
            this.create(leftNode)
        }
        if(rightData.length > 0){
            let rightNode = new Node(rightData, node)
            node.right = rightNode
            this.create(rightNode)
        }
    }

    print(node = this.root){
        if(!node.isLeaf){
            if(node.question.type === 'number')
                console.log(' '.repeat(node.level) + node.question.name + ' <= ' + node.question.value + ' ' + node.level)
            else
                console.log(' '.repeat(node.level) + node.question.name + ': ' + node.question.value + ' ' + node.level)
        }else
            console.log(' '.repeat(node.level) + node.prediction + ' ' + node.level)

        if(node.left !== null){
            this.print(node.left)
        }
        if(node.right !== null){
            this.print(node.right)
        }
    }

    draw(node = this.root, parentDiv = null, position = null, nodeRow = []){
        const nodeContainer = document.getElementById('node-container')
        const div = document.createElement('div')

        /*
        div.style.top = 100*node.level + 'px'
        div.style.left = '600px'*/
        if(!node.isLeaf){
            div.classList.add('node')
            if(typeof node.question.value === 'number')
                div.innerHTML = node.question.name + ' <= ' + node.question.value + '<br />' + 'YES&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspNO'
            else
                div.innerHTML = node.question.name + ': ' + node.question.value + '<br />' + 'YES&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspNO'
        }else{
            div.classList.add('leaf')
            div.innerHTML = node.prediction
        }
        node.div = div

        /*
        if(position == 'left'){
            div.style.left = (parseInt(parentDiv.style.left.replace('px','')) - (300 / node.level)) + 'px'
        }
        if(position == 'right')
            div.style.left = (parseInt(parentDiv.style.left.replace('px','')) + (300 / node.level)) + 'px'
        */

        if(nodeRow.length <= node.level){
            const divRow = document.createElement('div')
            divRow.classList.add('nodeRow')
            //divRow.style.width = 100/node.level + '%'
            nodeRow.push(divRow)
            nodeContainer.appendChild(divRow);
        }
        
        nodeRow[node.level].appendChild(div)
        this.divs.push([div, parentDiv])

        if(node.left != null){
            this.draw(node.left, div, 'left', nodeRow)
        }
        if(node.right != null){
            this.draw(node.right, div, 'right', nodeRow)
        }
    }

    drawLines(){
        const svgContainer = document.querySelector('svg')

        for(let i = 0; i < this.divs.length; i++){
            let div = this.divs[i][0]
            let parent = this.divs[i][1]

            if(parent!==null)
            {
                let rectParent = parent.getBoundingClientRect()
                let rectDiv= div.getBoundingClientRect()
                let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
                line.setAttribute('x1', rectParent.left + 50)
                line.setAttribute('y1', rectParent.top - 200)
                line.setAttribute('x2', rectDiv.left + 50)
                line.setAttribute('y2', rectDiv.top - 200)
                line.setAttribute('stroke', 'rgba(189, 130, 244, 0.5)')
                line.setAttribute('stroke-width', 5)
                svgContainer.appendChild(line)
            }
        }
    }

    async find(element){
        let row = []
        let str = []
        str = element.split(',')
        let index = 0
        for(let i = 0; i < str.length + 1; i++){
            if(i === targetID){
                row.push([])
            }else{
                row.push(str[index])
                index++
            }
        }

        function tryParseInt(element){
            if(typeof element === 'number')
                return parseInt(element)
            return element
        }

        let current = this.root
        console.log(current.question)
        while(!current.isLeaf){
            current.div.style.backgroundColor = 'rgb(255, 91, 91)'
            if(tryParseInt(row[current.question.column]) <= current.question.value)
                current = current.left
            else
                current = current.right
            await sleep(500)
        }
        current.div.style.backgroundColor = 'rgb(255, 91, 91)'
    }

    eraseDivs(element){
        let row = []
        let str = []
        str = element.split(',')
        let index = 0
        for(let i = 0; i < str.length + 1; i++){
            if(i === targetID){
                row.push([])
            }else{
                row.push(str[index])
                index++
            }
        }

        function tryParseInt(element){
            if(typeof element === 'number')
                return parseInt(element)
            return element
        }

        let current = this.root
        console.log(current.question)
        while(!current.isLeaf){
            current.div.style.backgroundColor = 'rgb(189, 130, 244)'
            if(tryParseInt(row[current.question.column]) <= current.question.value)
                current = current.left
            else
                current = current.right
        }
        current.div.style.backgroundColor = '#4de24d'
    }
}

let tree

function createTree(){
    tree = new DecisionTree(arr)
    tree.create()
    tree.print()
    tree.draw()
    tree.drawLines()
}

function erase(){
    tree.eraseDivs(decision)
}

function findDecision(){
    if(decision!=null)
        tree.find(decision)
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}