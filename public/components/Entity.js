"use strict";

export default class Entity {
    constructor(id, {x, y, width, height, angle = 0, throttle = 0, deviation = 0}, controllable) {
        this.id = id;

        this.state = {
            x,
            y,
            width,
            height,
            angle
        };

        this.controllable = controllable;
        this.state.points = this.getPeriphery();
    }
}