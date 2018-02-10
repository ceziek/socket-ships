export default class Missile {
    constructor(id, {x, y, width, height, angle = 0, throttle = 0, type = 'missile'}) {
        this.id = id;

        this.state = {
            x,
            y,
            width,
            height,
            angle,
            throttle,
            type
        };

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
                x: this.state.x + this.state.width / 2,
                y: this.state.y + this.state.height / 2
            }, {
                x: this.state.x - this.state.width / 2,
                y: this.state.y + this.state.height / 2
            }
        ];
    }

    draw(ctx, canvasUpperLeftCornerX, canvasUpperLeftCornerY) {
        const points = [...this.points];
        const pointsAdjustedToCanvas = points.map((point) => {
            return {
                x: point.x - canvasUpperLeftCornerX,
                y: point.y - canvasUpperLeftCornerY
            }
        });

        const firstPoint = pointsAdjustedToCanvas[0];

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        pointsAdjustedToCanvas.forEach((point, i) => {
            if (i !== 0) {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.rotate(this.state.angle);

        this.state.x += this.state.throttle * Math.cos(convertToRadians(this.state.angle));
        this.state.y += this.state.throttle * Math.sin(convertToRadians(this.state.angle));

        this.points.forEach((point) => {
            point.x += this.state.throttle * Math.cos(convertToRadians(this.state.angle));
            point.y += this.state.throttle * Math.sin(convertToRadians(this.state.angle))
        });
    }

    step() {
        this.move()
    }

    rotate(angle) {
        let state = Object.assign({}, this.state);
        let points = angle ? this.getPeriphery() : this.points;

        state.angle = state.angle < 0 ? state.angle + 360 : state.angle;
        state.angle = state.angle > 360 ? 0 : state.angle;

        let deviation = angle ? angle : state.angle;


        points.forEach((point) => {
            let tempX = point.x - state.x;
            let tempY = point.y - state.y;

            let rotatedX = tempX * Math.cos(convertToRadians(deviation)) - tempY * Math.sin(convertToRadians(deviation));
            let rotatedY = tempX * Math.sin(convertToRadians(deviation)) + tempY * Math.cos(convertToRadians(deviation));

            point.x = rotatedX + state.x;
            point.y = rotatedY + state.y;
        });

        this.points = [...points];
        this.update(state)
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

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}