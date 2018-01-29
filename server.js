const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = new require('socket.io')(http);

const { exec } = require('child_process');

class State {
    constructor() {
        this.state = {};
    }

    update(obj) {
        const newState = Object.assign({}, this.state);
        // TODO: const newState = {...this.state};

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

    socket.on('upgrade', () => {

        console.log('UPGRADE');

        exec(`cd /home/czarek/socket-ships && git pull`, (err, stdout) => {
            console.log(err);
            console.log(stdout);

            process.exit();
            }
        );
    });

    socket.on('disconnect', () => {
        console.log('disconnected');
        state.destroy(socket.id);
        socket.broadcast.emit('destroy', socket.id);
    });
});
