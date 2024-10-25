document.addEventListener('DOMContentLoaded', initGame)
document.addEventListener('keydown', handleKeyPress)

let boardMatrix
let players = []
let currentPlayerIndex = 0 

const settings = {
    initialWater: 6,
    initialActions: 3,
    defaultPlayerCount: 4,
    maxRows: 5,
    maxCols: 5
}

let parts = [
    { id: 'part1', location: null, clues: { row: null, column: null } },
    { id: 'part2', location: null, clues: { row: null, column: null } },
    { id: 'part3', location: null, clues: { row: null, column: null } }
]

// Initialization
function initGame() {
    boardMatrix = setupBoard() 
    players = setupPlayers(settings.defaultPlayerCount) 
    placePartsAndClues() 
    drawBoard() 
    refreshPanels() 
}

// Setup the board with matrix
function setupBoard() {
    let matrix = makeMatrix(settings.maxRows, settings.maxCols)
    setupOases(matrix)
    return matrix
}

function makeMatrix(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill('sand'))
}

function setupOases(matrix) {
    let placed = 0
    const totalOases = 4
    while (placed < totalOases) {
        let row = Math.floor(Math.random() * settings.maxRows)
        let col = Math.floor(Math.random() * settings.maxCols)
        if (matrix[row][col] === 'sand' && !(row === 2 && col === 2)) {
            matrix[row][col] = placed === totalOases - 1 ? 'mirage' : 'oasis'
            placed++
        }
    }
}

// Draw the game board
function drawBoard() {
    const boardEl = document.querySelector('.game-board')
    boardEl.innerHTML = ''

    boardMatrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellEl = document.createElement('div')
            cellEl.className = `cell ${cell}`
            cellEl.id = `cell-${rowIndex}-${colIndex}`

            players.forEach(player => {
                if (player.position.row === rowIndex && player.position.col === colIndex) {
                    cellEl.classList.add('player') // Highlight the player's position
                }
            })

            boardEl.appendChild(cellEl)
        })
    })
}

function setupPlayers(count) {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        water: settings.initialWater,
        actions: settings.initialActions,
        partsFound: 0,
        position: { row: 2, col: 2 } 
    }))
}


//curr status ///!!!!!!!!!!COME BACK TO THIS LATER!!!!!!!!!!
function refreshPanels() {
    players.forEach(player => {
        const panel = document.querySelector(`.player-panel.player${player.id}`)
        if (panel) {
            panel.querySelector(`#player${player.id}-water`).textContent = player.water
            panel.querySelector(`#player${player.id}-actions`).textContent = player.actions
        }
    })
}

function placePartsAndClues() {
    parts.forEach(part => {
        let placed = false
        while (!placed) {
            let rowIndex = Math.floor(Math.random() * settings.maxRows)
            let colIndex = Math.floor(Math.random() * settings.maxCols)
            if (boardMatrix[rowIndex][colIndex] === 'sand' && !(rowIndex === 2 && colIndex === 2)) {
                boardMatrix[rowIndex][colIndex] = part.id
                part.location = { row: rowIndex, column: colIndex }
                part.clues.row = rowIndex 
                part.clues.column = colIndex
                placed = true
            }
        }
    })
}

function handleKeyPress(event) {
    const player = players[currentPlayerIndex]
    if (!player) return
    switch (event.key.toLowerCase()) {
        case 'w':
        case 'a':
        case 's':
        case 'd':
            movePlayer(player, event.key.toLowerCase())
            break
        case 'e':
            digAtCurrentPosition(player)
            break
        default:
            return // Ignore other keys
    }
    updateDisplay()
}

function movePlayer(player, direction) {
    const directions = {
        'w': { row: -1, col: 0 },
        's': { row: 1, col: 0 },
        'a': { row: 0, col: -1 },
        'd': { row: 0, col: 1 }
    }
    const move = directions[direction]
    const newRow = player.position.row + move.row
    const newCol = player.position.col + move.col

    if (newRow >= 0 && newRow < settings.maxRows && newCol >= 0 && newCol < settings.maxCols) {
        const oldCell = document.getElementById(`cell-${player.position.row}-${player.position.col}`)
        const newCell = document.getElementById(`cell-${newRow}-${newCol}`)

        oldCell.classList.remove('player')
        newCell.classList.add('player')

        player.position = { row: newRow, col: newCol }
    }
}

function digAtCurrentPosition(player) {
    if (player.actions > 0) {
        const cell = document.getElementById(`cell-${player.position.row}-${player.position.col}`)
        const content = boardMatrix[player.position.row][player.position.col]
        console.log(`Player ${player.id} digs at ${player.position.row}, ${player.position.col} and finds ${content}`)
        player.actions--
        if (content === 'sand') {
            cell.classList.add('dug')
            cell.classList.remove('sand')
        } else if (content.startsWith('part')) {
            revealPart(content, cell)
        }
        handleDigResult(player, content)
    } else {
        console.log("No actions left to dig.")
    }
}

// to reveal part when dug up
function revealPart(content, cell) {
    cell.classList.add('revealed')
    cell.classList.add(content)
    cell.style.backgroundImage = `url('Assets/${content}.png')`
}

function handleDigResult(player, content) {
    switch (content) {
        case 'oasis':
            player.water = settings.initialWater
            break
        case 'mirage':
            break
        case 'part1':
        case 'part2':
        case 'part3':
            player.partsFound++
            break
        default:
            break
    }
}

function updateDisplay() {
    updateGameBoard(boardMatrix)
    refreshPanels()
}

function updateGameBoard(matrix) {
    const boardEl = document.querySelector('.game-board')
    matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellEl = document.getElementById(`cell-${rowIndex}-${colIndex}`)
            cellEl.className = `cell ${cell}` // Reapply classes based on current state

            if (cell === 'oasis' || cell === 'mirage') {
                cellEl.style.backgroundImage = `url('Assets/${cell === 'oasis' ? 'Oasis.png' : 'Drought.png'}')`
            } else {
                cellEl.style.backgroundImage = '' // Clear images for non-special cells
            }

            players.forEach(player => {
                if (player.position.row === rowIndex && player.position.col === colIndex) {
                    cellEl.classList.add('player')
                }
            })

            if (cell.startsWith('part') && cellEl.classList.contains('revealed')) {
                cellEl.style.backgroundImage = `url('Assets/${cell}.png')`
            }
        })
    })
}
