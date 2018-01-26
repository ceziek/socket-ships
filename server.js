const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = new require('socket.io')(http);

class State {
    constructor() {
        this.state = {};
    }

    update(obj) {
        const newState = Object.assign({}, this.state);

        newState[obj.id] = obj.state;

        this.state = Object.assign({}, newState);
    }

    destroy(id) {
        delete this.state[id];

    }
}

// app.use(express.static('public'));

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
// });

http.listen(3000, () => {
    console.log('listening on *:3000');
});

const state = new State();


io.on('connection', (socket) => {
    console.log('connected');
    console.log('connected', state.state);


    socket.on('disconnect', () => {
        console.log('disconnected', state.state);
        state.destroy(socket.id);
        io.emit('destroy', socket.id);
    });

    socket.on('init', (data) => {
        state.update(data);
        socket.broadcast.emit('update', data);
        socket.emit('state', state.state);
        console.log('init', state.state);

    });

    socket.on('update', (data) => {
        state.update(data);
        socket.broadcast.emit('update', data);
        console.log('update', state.state);
    });
});
