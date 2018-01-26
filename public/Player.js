export default class Player {
    constructor(id, {x, y, width, height, keyState, angle = 0, throttle = 0, deviation = 0}, controllable) {
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
        this.rotate(this.controllable ? null : this.state.angle);

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
        this.state = Object.assign({}, state)
    }
}

function convertToRadians(degree) {
    return degree * (Math.PI / 180);
}