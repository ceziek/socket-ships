import Player from './Player.js'
import Missile from './Missile.js'

export default class Game {
    constructor(ctx, state, socket) {
        this.ctx = ctx;
        this.state = state;
        this.socket = socket;
        this.entities = {};

        this.initPlayer();

        this.socketEvents();
        this.keyEvents();
    }

    keyEvents() {
        document.addEventListener("keydown", (event) => {
            const id = this.socket.id;
            const state = this.state.state[id];
            const keyState = Object.assign({}, state.keyState);

            let keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

            keys.forEach((key) => {
                if (event.key === key) {
                    event.preventDefault();
                    keyState[key] = true;
                }
            });

            const data = {
                id: id,
                state: {
                    keyState: keyState
                }
            };

            this.state.update(data);

            if (event.key === ' ') {
                event.preventDefault();
                this.launchMissile();
            }
        });

        document.addEventListener("keyup", (event) => {
            const id = this.socket.id;
            const state = this.state.state[id];
            const keyState = Object.assign({}, state.keyState);

            delete keyState[event.key];

            const data = {
                id: id,
                state: {
                    keyState: keyState
                }
            };

            this.state.update(data);
            this.socket.emit('update', data);
        });
    }

    socketEvents() {
        this.socket.on('state', (data) => {
            this.state.state = Object.assign({}, data);
        });

        this.socket.on('update', (data) => {
            this.state.update(data);
        });

        this.socket.on('destroy', (id) => {
            this.state.destroy(id);
            delete this.entities[id];
        });
    }

    initPlayer() {
        let id = this.socket.id;

        let offset = 100;
        let initialPlayerState = {
            x: offset + Math.floor(Math.random() * 600),
            y: offset + Math.floor(Math.random() * 600),
            width: 50,
            height: 50,
        };

        this.entities[id] = new Player(id, initialPlayerState, true);

        let data = {
            id: this.entities[id].id,
            state: this.entities[id].state
        };

        this.socket.emit('init', data);
    }

    launchMissile(entity) {
        let entityState = entity ? entity.state : this.entities[this.socket.id].state;

        let initialMissileState = {
            x: entityState.x + 65 * Math.cos(convertToRadians(entityState.angle)),
            y: entityState.y + 65 * Math.sin(convertToRadians(entityState.angle)),
            width: 20,
            height: 10,
            angle: entityState.angle,
            throttle: 5
        };

        const missile =  new Missile(this.socket.id, initialMissileState);

        const data = {
            id: missile.id,
            state: missile.state
        };

        this.state.update(data);
        this.entities[missile.id] = missile;
        this.socket.emit('update', data);

        setTimeout(() => {
            delete this.entities[missile.id];
            this.state.destroy(missile.id);

            const data = {
                id: missile.id
            };
            this.socket.emit('destroy', data);

        }, 1000)
    }

    step() {
        const state = Object.assign({}, this.state.state);

        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                if (!this.entities.hasOwnProperty(key)) {
                    this.entities[key] = new Player(key, state[key], false);
                } else {
                    if (this.entities[key].controllable) {
                        this.entities[key].update(state[key])
                    } else {
                        this.entities[key].animateToState(state[key]);
                    }
                }

                this.entities[key].step();

                for (let obstacleKey in this.entities) {
                    if (obstacleKey !== key) {
                        if (!checkCollision(this.entities[key].points, this.entities[obstacleKey].points)) {
                            this.entities[key].state.throttle = -this.entities[key].state.throttle;
                        }
                    }
                }

                if (this.isChanged(this.entities[key])) {
                    const data = {
                        id: this.entities[key].id,
                        state: this.entities[key].state
                    };
                    this.state.update(data);

                    if (this.entities[key].controllable) {
                        this.socket.emit('update', data);
                    }
                }
            }
        }
    }

    start() {
        this.ctx.clearRect(0, 0, 1000, 800);

        this.step();

        for (let key in this.entities) {
            if (this.entities.hasOwnProperty(key)) {
                this.entities[key].draw(this.ctx);
            }
        }

        requestAnimationFrame(this.start.bind(this));
    }

    isChanged(entity) {
        let playerStr = JSON.stringify(entity.state);
        let stateStr = JSON.stringify(this.state.state[entity.id]);

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

