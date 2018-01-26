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
                    keyState : keyState
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
