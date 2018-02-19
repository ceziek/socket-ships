"use strict";

importScripts('components/Entity.js');

class Player extends Entity {
    constructor(id, {x, y, width, height, angle = 0, throttle = 0}, bounds) {
        super(id, {x, y, width, height, angle}, bounds);

        this.state.throttle = throttle;
    }

    step() {
        this.rotate();

        this.state.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
        this.state.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle));

        this.state.points.forEach((point) => {
            point.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
            point.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle))
        });
    }
}

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}


// NOT WORKING
// function animateProperties(obj, target) {
//
//     let newObj = {};
//
//     for (let key in obj) {
//         let factor = 0.5; // (key === 'x' || key === 'y') ? 0.1 : 1;
//
//         if (obj.hasOwnProperty(key)) {
//
//             let prop = obj[key];
//             let targetProp = target[key];
//
//             if (!(key === 'x' || key === 'y')) {
//                 prop = targetProp
//             } else {
//                 if (prop !== targetProp) {
//                     if (prop > targetProp) {
//                         prop -= factor;
//                         if (prop < targetProp) {
//                             prop = targetProp;
//                         }
//                     } else {
//                         prop += factor;
//                         if (prop > targetProp) {
//                             prop = targetProp;
//                         }
//                     }
//                 }
//             }
//
//             newObj[key] = prop;
//         }
//     }
//
//     return Object.assign({}, newObj)
// }