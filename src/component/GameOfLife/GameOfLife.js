import {Component} from "react";
import "./main.css";

const CELL_SIZE = 10;

export default class GameOfLife extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: [],
            interval: 100,
            isRunning: false
        };

        const board_size = this.props.size || CELL_SIZE;

        this.rows = board_size;
        this.cols = board_size;
        this.board = this.makeEmptyBoard();
    }

    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }
        return board;
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({x, y});
                }
            }
        }
        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.scrollX) - doc.clientLeft, y: (rect.top + window.scrollY) - doc.clientTop,
        };
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({cells: this.makeCells()});
    }

    runGame = () => {
        this.setState({isRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({isRunning: false});
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        // console.log('running iteration');
        let newBoard = this.makeEmptyBoard();

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    newBoard[y][x] = neighbors === 2 || neighbors === 3;
                } else {
                    if (!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({cells: this.makeCells()});
        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }

    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({cells: this.makeCells()});
    }

    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }

        this.setState({cells: this.makeCells()});
        this.runGame();
    }

    toggleGameControl = (event) => {
        if(event.target.className !== "Board" && event.target.className !== "Cell") {
            return;
        }

        if (this.state.isRunning) {
            this.stopGame();
        } else {
            this.runGame();
        }
    }

    render() {
        const {cells} = this.state;
        return (
            <div className="Game">
                <div className="Board"
                     style={{
                         width: this.rows * CELL_SIZE,
                         height: this.rows * CELL_SIZE,
                         backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                     }}
                     onClick={this.toggleGameControl} ref={(n) => {
                    this.boardRef = n;
                }}>
                    {
                        cells.map(cell => (
                            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} onClick={this.toggleGameControl}/>
                        ))
                    }
                </div>
                <div className={"Controls" + (this.state.isRunning ? " hidden" : "")}
                     onClick={this.toggleGameControl}
                     style={{
                         height: this.rows * CELL_SIZE,
                         backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                     }}>
                    <div className="Buttons">
                        <button className="button" onClick={this.handleRandom}>Random</button>
                        <button className="button" onClick={this.handleClear}>Clear</button>
                    </div>
                </div>
            </div>);
    }
}

class Cell extends Component {
    render() {
        const {x, y, onClick} = this.props;
        return (<div className="Cell" style={{
            left: `${CELL_SIZE * x + 1}px`,
            top: `${CELL_SIZE * y + 1}px`,
            width: `${CELL_SIZE - 1}px`,
            height: `${CELL_SIZE - 1}px`,
        }} onClick={onClick}/>);
    }
}