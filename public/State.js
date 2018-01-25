export default class State {
    constructor() {
        this.state = {};
    }

    update(obj) {
        // console.log('OBJECT TO UPDATE', obj);

        const newState = Object.assign({}, this.state);

        newState[obj.id] = obj.state;

        this.state = Object.assign({}, newState);
        console.log('STATE UPDATE', this.state)
    }

    destroy(id) {
        delete this.state[id];
    }
}
