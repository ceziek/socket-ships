"use strict";

importScripts('socket.io.js');
importScripts('components/GameWorker.js');

const socket = io('http://fuku.nazwa.pl:3000');

socket.on('connect', () => {
    const gameWorker = new GameWorker(socket);
    gameWorker.initPlayer();
    gameWorker.socketListener();

    self.onmessage = (event) => {
        gameWorker.keyState = event.data;
        gameWorker.gameStep();
    }
});


