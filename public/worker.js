"use strict";

importScripts('socket.io.js');
importScripts('components/GameWorker.js');

const socket = io('http://fuku.nazwa.pl:3000');
// const socket = io('http://localhost:3000');

socket.on('connect', () => {
    const gameWorker = new GameWorker(socket);
    gameWorker.initPlayer();
    gameWorker.socketListener();

    self.onmessage = (event) => {
        switch (event.data.type) {
            case 'clean' :
                socket.emit('clean');
                break;
            case 'upgrade':
                socket.emit('upgrade');
                break;
            default :
                gameWorker.keyState = event.data;
                gameWorker.gameStep();
                break;
        }
    }
});

socket.on('disconnect', () => {
    socket.emit('destroy', socket.id)
});