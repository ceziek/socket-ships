import Missile from './Missile.js'

export default class Player {
    constructor(id, {x, y, width, height, angle = 0, throttle = 0, deviation = 0}, controllable) {
        this.id = id;

        this.state = {
            x,
            y,
            width,
            height,
            angle,
            throttle,
            deviation
        };

        this.controllable = controllable;

        this.points = this.getPeriphery();
    }

    getPeriphery() {
        return [
            {
                x: this.state.x - this.state.width / 2,
                y: this.state.y - this.state.height / 2
            }, {
                x: this.state.x + this.state.width / 2,
                y: this.state.y - this.state.height / 2
            }, {
                x: this.state.x + this.state.width / 2 + 15,
                y: this.state.y
            }, {
                x: this.state.x + this.state.width / 2,
                y: this.state.y + this.state.height / 2
            }, {
                x: this.state.x - this.state.width / 2,
                y: this.state.y + this.state.height / 2
            }
        ];
    }

    rotate(angle) {
        let state = Object.assign({}, this.state);
        let points = angle ? this.getPeriphery() : this.points;

        state.angle = state.angle < 0 ? state.angle + 360 : state.angle;
        state.angle = state.angle > 360 ? 0 : state.angle;

        let deviation = angle ? angle : state.deviation;


        points.forEach((point) => {
            let tempX = point.x - state.x;
            let tempY = point.y - state.y;

            let rotatedX = tempX * Math.cos(convertToRadians(deviation)) - tempY * Math.sin(convertToRadians(deviation));
            let rotatedY = tempX * Math.sin(convertToRadians(deviation)) + tempY * Math.cos(convertToRadians(deviation));

            point.x = rotatedX + state.x;
            point.y = rotatedY + state.y;
        });

        state.deviation = 0;

        this.points = [...points];
        this.update(state)
    }

    step() {


        this.state.angle += this.state.deviation;

        this.move();
    }

    move() {
        //this.rotate(this.controllable ? null : this.state.angle);
        this.rotate(this.state.angle);


        this.state.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
        this.state.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle));

        this.points.forEach((point) => {
            point.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
            point.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle))
        });
    }

    animateToState(state) {
        const newState = animateProperties(this.state, state);
        this.update(newState);
    }

    draw(ctx) {
        const firstPoint = this.points[0];

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        this.points.forEach((point, i) => {
            if (i !== 0) {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.fill();
        ctx.closePath();
    }

    update(state) {
        const newState = Object.assign({}, this.state);

        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                newState[key] = state[key];
            }
        }

        this.state = Object.assign({}, newState);
    }
}

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}


// NOT WORKING
function animateProperties(obj, target) {

    let newObj = {};

    for (let key in obj) {
        let factor = 0.5; // (key === 'x' || key === 'y') ? 0.1 : 1;

        if (obj.hasOwnProperty(key)) {

            let prop = obj[key];
            let targetProp = target[key];

            if (!(key === 'x' || key === 'y')) {
                prop = targetProp
            } else {
                if (prop !== targetProp) {
                    if (prop > targetProp) {
                        prop -= factor;
                        if (prop < targetProp) {
                            prop = targetProp;
                        }
                    } else {
                        prop += factor;
                        if (prop > targetProp) {
                            prop = targetProp;
                        }
                    }
                }
            }

            newObj[key] = prop;
        }
    }

    return Object.assign({}, newObj)
}