import Missile from './Missile.js'

export default class Player {
    constructor(id, {x, y, width, height, keyState = {}, angle = 0, throttle = 0, deviation = 0}, controllable) {
        this.id = id;

        this.state = {
            x,
            y,
            width,
            height,
            keyState,
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
        for (let keyName in this.state.keyState) {
            switch (keyName) {
                case 'ArrowRight' :
                    this.state.deviation += 1;
                    break;
                case 'ArrowLeft' :
                    this.state.deviation -= 1;
                    break;
                case 'ArrowDown' :
                    this.state.throttle -= 1;
                    break;
                case 'ArrowUp' :
                    this.state.throttle += 1;
                    break;

            }
        }

        this.state.angle += this.state.deviation;

        this.move();
    }

    move() {
        //this.rotate(this.controllable ? null : this.state.angle);
        this.rotate(this.state.angle);

        const keyState = Object.assign({}, this.state.keyState);

        if (
            !keyState.hasOwnProperty('ArrowDown') &&
            !keyState.hasOwnProperty('ArrowUp') &&
            this.state.throttle !== 0
        ) {
            if (this.state.throttle > 0) {
                this.state.throttle -= 1;
            } else {
                this.state.throttle += 1;
            }
        }

        this.state.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
        this.state.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle));

        this.points.forEach((point) => {
            point.x += this.state.throttle / 10 * Math.cos(convertToRadians(this.state.angle));
            point.y += this.state.throttle / 10 * Math.sin(convertToRadians(this.state.angle))
        });
    }

    launchMissile() {
        let initialMissileState = {
            x: this.state.x + 50,
            y: this.state.y + 50,
            width: 20,
            height: 5,
            angle: this.state.angle,
            throttle: 2
        };

        return new Missile('14', initialMissileState);
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

    animateToState(state) {
        const newState = animateProperties(this.state, state);
        this.update(newState);
    }
}

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}

function animateProperties(obj, target) {
    let newObj = {};

    for (let key in obj) {
        let factor = (key === 'x' || key === 'y') ? 0.1 : 1;

        if (obj.hasOwnProperty(key)) {
            let prop = obj[key];
            let targetProp = target[key];

            if (prop instanceof Object) {
                if (JSON.stringify(prop) !== JSON.stringify(target)) {
                    prop = targetProp;
                }
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