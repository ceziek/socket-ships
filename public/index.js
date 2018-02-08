import State from './State.js';
import Game from './Game.js';
import GameEmitter from './GameEmitter.js'

const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

const socket = io('http://fuku.nazwa.pl:3000');
// const socket = io('http://localhost:3000');

const worker = new Worker('worker.js');


socket.on('connect', () => {
    const state = new State();
    const gameEmitter = new GameEmitter(state, socket);
    const game = new Game(canvas, gameEmitter);
    game.start();
});

window.upgrade = function () {
    console.log('upgrade');
    socket.emit('upgrade');
};

window.clean = function () {
    console.log('clean');
    socket.emit('clean');
};






