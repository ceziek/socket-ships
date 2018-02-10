export default class Emitter {
    constructor() {
        this.elRef = document.getElementById('eventEmitter');
    }

    emit(eventName, payload) {
        const event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, payload);

        this.elRef.dispatchEvent(event)
    }

    on(eventName, callback) {
        this.elRef.addEventListener(eventName, (event) => callback(event.detail))
    }
}