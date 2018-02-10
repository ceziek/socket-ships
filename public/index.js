// import State from './components/State.js';
// import Game from './components/Game.js';
// import GameEmitter from './components/GameEmitter.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const socket = io('http://fuku.nazwa.pl:3000');
// const socket = io('http://localhost:3000');

const worker = new Worker('worker.js');

let state = {};
let keyState = {}

worker.onmessage = (event) => {
    state = event.data;
};

keyEvents();
requestAnimationFrame(() => render());

function render() {
    ctx.clearRect(0, 0, 1000, 800);

    // const playerState = state[id];
    // const canvasUpperLeftCornerX = playerState.x - (canvas.width / 2);
    // const canvasUpperLeftCornerY = playerState.y - (canvas.height / 2);

    for (let key in state) {
        if (state[key]) {
            draw(ctx, state[key], 0, 0);
        }
    }

    requestAnimationFrame(() => render());
}

function draw(ctx, entity, canvasUpperLeftCornerX, canvasUpperLeftCornerY) {
    const points = [...entity.points];
    const pointsAdjustedToCanvas = points.map((point) => {
        return {
            x: point.x - canvasUpperLeftCornerX,
            y: point.y - canvasUpperLeftCornerY
        }
    });

    const firstPoint = pointsAdjustedToCanvas[0];

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    pointsAdjustedToCanvas.forEach((point, i) => {
        if (i !== 0) {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.fill();
    ctx.closePath();
}

function keyEvents() {
    document.addEventListener("keydown", (event) => {
        let keys = ['w', 's', 'a', 'd', ' '];

        keys.forEach((key) => {
            if (event.key === key) {
                event.preventDefault();
                keyState[key] = true;
            }
        });

        worker.postMessage(keyState);
    });

    document.addEventListener("keyup", (event) => {
        let keys = ['w', 's', 'a', 'd', ' '];

        keys.forEach((key) => {
            if (event.key === key) {
                event.preventDefault();
                delete keyState[event.key];
            }
        });

        worker.postMessage(keyState)
    });
}


// socket.on('connect', () => {
//     const state = new State();
//     const gameEmitter = new GameEmitter(state, socket);
//     const game = new Game(canvas, gameEmitter);
//     game.start();
// });
//
// window.upgrade = function () {
//     console.log('upgrade');
//     socket.emit('upgrade');
// };
//
// window.clean = function () {
//     console.log('clean');
//     socket.emit('clean');
// };






