"use strict";

import Player from '../Ship.js'
import Missile from './Missile.js'

export default class Game {
    constructor(canvas, emitter) {
        this.socketId = emitter.socketId;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.emitter = emitter;
        this.state = {};
        this.entities = {};
        this.keyState = {};
        this.missleLaunched = false;

        this.gameBoard = {
            width: 3000,
            height: 2000
        };

        this.initPlayer();

        this.keyEvents();
        this.emitterEvents();

        this.step();
    }

    keyEvents() {
        document.addEventListener("keydown", (event) => {
            let keys = ['w', 's', 'a', 'd', ' '];

            keys.forEach((key) => {
                if (event.key === key) {
                    event.preventDefault();
                    this.keyState[key] = true;
                }
            });
        });

        document.addEventListener("keyup", (event) => {
            let keys = ['w', 's', 'a', 'd', ' '];

            keys.forEach((key) => {
                if (event.key === key) {
                    event.preventDefault();
                    delete this.keyState[event.key];
                }
            });

        });
    }

    emitterEvents() {
        this.emitter.on('state', (data) => {
            this.state = data;
        });
    }

    initPlayer() {
        let id = this.socketId;

        let offset = 100;
        let initialPlayerState = {
            x: offset + Math.floor(Math.random() * 600),
            y: offset + Math.floor(Math.random() * 600),
            width: 50,
            height: 50,
        };

        let newPlayer = new Player(id, initialPlayerState, true);
        let data = {
            id: newPlayer.id,
            state: newPlayer.state
        };

        this.emitter.emit('init', data);
    }

    launchMissile(entity) {
        if (!this.missleLaunched) {
            let entityState = entity ? entity.state : this.entities[this.socketId].state;

            let initialMissileState = {
                x: entityState.x + 65 * Math.cos(convertToRadians(entityState.angle)),
                y: entityState.y + 65 * Math.sin(convertToRadians(entityState.angle)),
                width: 20,
                height: 10,
                angle: entityState.angle,
                throttle: 10
            };

            let missleId = this.socketId + '-' + Date.now().toString();

            const missile = new Missile(missleId, initialMissileState);

            const data = {
                id: missile.id,
                state: missile.state
            };

            this.emitter.emit('update and emit', data);

            //this.missleLaunched = true;


            // setTimeout(() => {
            //     this.missleLaunched = false;
            // }, 50);

            setTimeout(() => {
                this.emitter.emit('destroy', missile.id);
            }, 3000)
        }
    }

    // TODO: Make something with this dirty method code
    step() {
        const state = Object.assign({}, this.state);

        for (let key in this.entities) {
            if (!state.hasOwnProperty(key)) {
                delete this.entities[key];
            }
        }

        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                if (!this.entities.hasOwnProperty(key)) {
                    if (key === this.socketId) {
                        this.entities[key] = new Player(key, state[key], true);

                    } else {
                        if (state[key].hasOwnProperty('type')) {
                            this.entities[key] =  new Missile(key, state[key]);
                        } else {
                            this.entities[key] = new Player(key, state[key], false);
                        }
                    }
                } else {
                    //this.entities[key].update(state[key])

                    if (this.entities[key].controllable) {
                        this.entities[key].update(state[key])
                    } else {
                        this.entities[key].animateToState(state[key]);
                    }
                }

                if (this.entities[key].controllable) {
                    for (let keyName in this.keyState) {
                        switch (keyName) {
                            case 'd' :
                                this.entities[key].state.deviation += 1;
                                break;
                            case 'a' :
                                this.entities[key].state.deviation -= 1;
                                break;
                            case 's' :
                                this.entities[key].state.throttle -= 1;
                                break;
                            case 'w' :
                                this.entities[key].state.throttle += 1;
                                break;
                            case ' ' :
                                this.launchMissile();
                                break;
                        }
                    }

                    if (
                        !this.keyState.hasOwnProperty('w') &&
                        !this.keyState.hasOwnProperty('s') &&
                        this.entities[key].state.throttle !== 0
                    ) {
                        if (this.entities[key].state.throttle > 0) {
                            this.entities[key].state.throttle -= 1;
                        } else {
                            this.entities[key].state.throttle += 1;
                        }
                    }
                }

                this.entities[key].step();

        /*        if (this.entities[key].controllable) {
                    for (let obstacleKey in this.entities) {
                        if (obstacleKey !== key) {
                            if (this.entities[obstacleKey] instanceof Player) {
                                if (!checkCollision(this.entities[key].points, this.entities[obstacleKey].points)) {
                                    this.entities[key].state.throttle = -this.entities[key].state.throttle;
                                }
                            }

                        }
                    }
                }*/

                if (this.isChanged(this.entities[key])) {
                    const data = {
                        id: this.entities[key].id,
                        state: this.entities[key].state
                    };

                    if (this.entities[key].controllable) {
                        this.emitter.emit('update and emit', data);
                    } else {
                        this.emitter.emit('update', data);
                    }
                }
            }
        }
    }

    start() {
        if (this.state[this.socketId]) {

            this.ctx.clearRect(0, 0, 1000, 800);

            this.step();

            const playerState = this.state[this.socketId];
            const canvasUpperLeftCornerX = playerState.x - (this.canvas.width / 2);
            const canvasUpperLeftCornerY = playerState.y - (this.canvas.height / 2);

            for (let key in this.entities) {
                if (this.entities.hasOwnProperty(key)) {
                    this.entities[key].draw(this.ctx, canvasUpperLeftCornerX, canvasUpperLeftCornerY);
                }
            }
        }

        requestAnimationFrame(() =>  this.start());
    }

    isChanged(entity) {
        let playerStr = JSON.stringify(entity.state);
        let stateStr = JSON.stringify(this.state[entity.id]);

        return playerStr !== stateStr;
    }
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

