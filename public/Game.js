import Player from './Player.js'

export default class Game {
    constructor(ctx, state, socket) {
        this.ctx = ctx;
        this.state = state;
        this.socket = socket;
        this.entities = {};

        this.init();


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

    init() {
        let id = this.socket.id;
        let initialPlayerState = {
            x: 50,
            y: 50,
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

    step() {
        const state = Object.assign({}, this.state.state);

        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                if (!this.entities.hasOwnProperty(key)) {
                    this.entities[key] = new Player(key, state[key], false);
                } else {
                    this.entities[key].update(state[key])
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
