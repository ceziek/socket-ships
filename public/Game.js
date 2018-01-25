import Player from './Player.js'

export default class Game {
    constructor(ctx, state, socket) {
        this.ctx = ctx;
        this.state = state;
        this.socket = socket;
        this.entities = {};

        this.events();
    }

    events() {
        this.socket.on('connect', () => {
            let id = this.socket.id;
            let initialPlayerState = {
                x: 50,
                y: 50,
                width: 50,
                height: 50,
                keyState: {}
            };

            this.entities[id] = new Player(id, initialPlayerState, true);

            let data = {
                id: this.entities[id].id,
                state: this.entities[id].state
            };

            this.socket.emit('init', data);
        });

        this.socket.on('state', (data) => {
            this.state.state = Object.assign({}, data);
        });

        this.socket.on('update', (data) => {
            console.log(this.socket.id);
            console.table(data);
            this.state.update(data);
        });

        this.socket.on('destroy', (id) => {
            this.state.destroy(id);
            delete this.entities[id];
        });
    }

    isChanged(player) {
        let playerStr = JSON.stringify(player.state);
        let stateStr = JSON.stringify(this.state.state[player.id]);

        return playerStr !== stateStr;
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

                    console.log('wrong data' , data);
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

        // if (!checkCollision(player.points, obstacle.points)) {
        //     console.log('boom')
        // }

        requestAnimationFrame(this.start.bind(this));
    }
}
