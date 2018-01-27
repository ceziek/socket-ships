export default class State {
    constructor() {
        this.state = {};
    }

    update(obj) {
        const newState = Object.assign({}, this.state);

        if (!newState.hasOwnProperty(obj.id)) {
            newState[obj.id] = {}
        }

        for (let key in obj.state) {
            if (obj.state.hasOwnProperty(key)) {
                newState[obj.id][key] = obj.state[key];
            }
        }

        this.state = Object.assign({}, newState);
    }

    destroy(id) {
        const newState = Object.assign({}, this.state);

        delete newState[id];

        this.state = Object.assign({}, newState);
    }
}
