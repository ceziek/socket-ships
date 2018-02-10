"use strict";

importScripts('socket.io.js');
importScripts('components/GameWorker.js');

const socket = io('http://fuku.nazwa.pl:3000');

socket.on('connect', () => {
    const gameWorker = new GameWorker(socket);
    gameWorker.initPlayer();
    gameWorker.socketListener();
    gameWorker.gameStep();

    self.onmessage = (event) => {
        console.log(event.data);
        gameWorker.keyState = event.data;
        console.log(gameWorker.keyState);
    }
});


