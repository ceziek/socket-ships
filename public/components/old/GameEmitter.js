import Emitter from './Emitter.js'

export default class GameEmitter extends Emitter {
    constructor(state, socket) {
        super();

        this.state = state;
        this.socket = socket;
        this.socketId = this.socket.id;

        this.socketEvents();
        this.emitterEvents();
    }

    socketEvents() {
        this.socket.on('state', (state) => {
            for (let key in state) {
                let entity = {
                    id: key,
                    state: state[key]
                };

                this.state.update(entity);
            }
            this.emitState();
        });

        this.socket.on('update', (entity) => {
            this.state.update(entity);
            this.emitState();
        });

        this.socket.on('destroy', (id) => {
            this.state.destroy(id);
            this.emitState();
        });
    }

    emitterEvents() {
        this.on('init', (player) => {
            this.socket.emit('init', player);
        });

        this.on('update and emit', (entity) => {
            this.state.update(entity);
            this.socket.emit('update', entity);
            this.emitState();
        });

        this.on('update', (entity) => {
            this.state.update(entity);
            this.emitState();
        });

        this.on('destroy', (id) => {
            this.state.destroy(id);
            this.socket.emit('destroy', id);
            this.emitState();
        });
    }

    emitState() {
        this.emit('state', Object.assign({}, this.state.state));
    }
}