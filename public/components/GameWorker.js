"use strict";

importScripts('components/State.js');
importScripts('components/Player.js');

const offset = 100;

const initialPlayerState = {
    x: offset + Math.floor(Math.random() * 600),
    y: offset + Math.floor(Math.random() * 600),
    width: 50,
    height: 50,
};

const playerBounds = [
    {
        x: initialPlayerState.x - initialPlayerState.width / 2,
        y: initialPlayerState.y - initialPlayerState.height / 2
    }, {
        x: initialPlayerState.x + initialPlayerState.width / 2,
        y: initialPlayerState.y - initialPlayerState.height / 2
    }, {
        x: initialPlayerState.x + initialPlayerState.width / 2 + 15,
        y: initialPlayerState.y
    }, {
        x: initialPlayerState.x + initialPlayerState.width / 2,
        y: initialPlayerState.y + initialPlayerState.height / 2
    }, {
        x: initialPlayerState.x - initialPlayerState.width / 2,
        y: initialPlayerState.y + initialPlayerState.height / 2
    }
];

class GameWorker {
    constructor(socket) {
        this.socket = socket;
        this.state = new State();
        this.entities = {};
        this.keyState = {};
    }

    initPlayer() {
        const id = this.socket.id;

        const newPlayer = new Player(id, initialPlayerState, playerBounds);
        const data = {
            id: newPlayer.id,
            state: newPlayer.state
        };

        this.state.update(data);
        this.socket.emit('update', data);
    }

    controlPlayer(key) {
        const player = this.entities[key];

        for (let keyName in this.keyState) {
            switch (keyName) {
                case 'd' :
                    player.state.deviation += 1;
                    break;
                case 'a' :
                    player.state.deviation -= 1;
                    break;
                case 's' :
                    player.state.throttle -= 1;
                    break;
                case 'w' :
                    player.state.throttle += 1;
                    break;
            }
        }

    }

    socketListener() {
        this.socket.on('update', (data) => {
            this.state.update(data);
        });

        this.socket.on('destroy', (id) => {
            this.state.destroy(id);
        });
    }

    gameStep() {
        const playerId = this.socket.id;
        const state = this.state.getState();
        //const canvasUpperLeftCornerX = playerState.x - (this.canvas.width / 2);
        //const canvasUpperLeftCornerY = playerState.y - (this.canvas.height / 2);

        this.populateEntities(state);

        for (let key in this.entities) {
            const entityId = key;

            if (!state.hasOwnProperty(entityId)) {
                delete this.entities[entityId];
            }

            if (entityId === playerId) {
                this.controlPlayer(playerId);
            }

            this.entities[entityId].step();

            this.saveEntityState(key)
        }
    }

    saveEntityState(entityId) {
        const playerId = this.socket.id;
        const entityState = this.entities[entityId].state;

        const data = {
            id: entityId,
            state: entityState
        };
        this.state.update(data);

        if (entityId === playerId) {
            this.socket.emit('update', data);
        }
    }

    populateEntities(state) {
        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                if (!this.entities.hasOwnProperty(key)) {
                    this.entities[key] = new Player(key, state[key], playerBounds);
                } else {
                    this.entities[key].update(state[key]);
                }
            }
        }
    }
}

function isChanged(objState, targetState) {
    let playerStr = JSON.stringify(objState);
    let stateStr = JSON.stringify(targetState);

    return playerStr !== stateStr;
}

function checkCollision(entity1, entity2) {
    let valid = true;

    let shipPoints = [...entity1];
    let obstaclePoints = [...entity2];

    shipPoints.forEach((shipPoint, index) => {
        let nextIndex = index + 1 !== shipPoints.length ? index + 1 : 0;
        let shipSector = [shipPoints[index], shipPoints[nextIndex]];
        let shipLineFactors = getLineFactors(shipSector);

        let a1 = shipLineFactors.factorA;
        let b1 = shipLineFactors.factorB;

        obstaclePoints.forEach((obstaclePoint, index) => {
            let nextIndex = index + 1 !== obstaclePoints.length ? index + 1 : 0;
            let obstacleSector = [obstaclePoints[index], obstaclePoints[nextIndex]];
            let obstacleLineFactors = getLineFactors(obstacleSector);

            let a2 = obstacleLineFactors.factorA;
            let b2 = obstacleLineFactors.factorB;

            //  y = a1x + b1
            //  y = a2x + b2

            // a1x + b1 - a2x - b2 = 0
            // (a1 - a2)x = b2 - b1

            let x = (b2 - b1) / (a1 - a2);
            let y = a1 * x + b1;

            if
            (
                x >= Math.min(shipSector[0].x, shipSector[1].x) && x <= Math.max(shipSector[0].x, shipSector[1].x) &&
                y >= Math.min(shipSector[0].y, shipSector[1].y) && y <= Math.max(shipSector[0].y, shipSector[1].y) &&
                x >= Math.min(obstacleSector[0].x, obstacleSector[1].x) && x <= Math.max(obstacleSector[0].x, obstacleSector[1].x) &&
                y >= Math.min(obstacleSector[0].y, obstacleSector[1].y) && y <= Math.max(obstacleSector[0].y, obstacleSector[1].y)
            ) {
                valid = false;
            }
        })
    });
    return valid;
}

function getLineFactors(sector) {
    let point1 = sector[0];
    let point2 = sector[1];

    // y = Ax + B

    // point1.y = A * point1.x + B;
    // point2.y = A * point2.x + B;

    let factorA = (point1.y - point2.y) / (point1.x - point2.x);
    let factorB = point1.y - ((point1.y - point2.y) * (point1.x) / (point1.x - point2.x));

    return {factorA, factorB}
}

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}

