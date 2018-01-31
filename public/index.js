import State from './State.js';
import Game from './Game.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const socket = io('http://fuku.nazwa.pl:3000');
const state = new State();

socket.on('connect', () => {
    const game = new Game(ctx, state, socket);
    game.start();
});

window.upgrade = function() {
    console.log('upgrade');
    socket.emit('upgrade');
};

window.clean = function() {
    console.log('clean');
    socket.emit('clean');
};






