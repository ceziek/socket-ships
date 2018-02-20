"use strict";

class Entity {
    constructor(id, {x, y, width, height, angle = 0, deviation = 0}, bounds) {
        this.id = id;

        this.state = {
            x,
            y,
            width,
            height,
            angle,
            deviation
        };

        this.bounds = bounds;

        this.state.points = this.getBounds();

        this.step();
    }

    getBounds() {
        return eval(this.bounds);
    }

    step() {
        this.rotate();
    }

    rotate() {
        let state = Object.assign({}, this.state);
        let points = this.getBounds();
        let deviation = state.angle;

        points.forEach((point) => {
            let tempX = point.x - state.x;
            let tempY = point.y - state.y;

            let rotatedX = tempX * Math.cos(convertToRadians(deviation)) - tempY * Math.sin(convertToRadians(deviation));
            let rotatedY = tempX * Math.sin(convertToRadians(deviation)) + tempY * Math.cos(convertToRadians(deviation));

            point.x = rotatedX + state.x;
            point.y = rotatedY + state.y;
        });

        this.state.points = [...points];
    }

    draw(ctx, canvasUpperLeftCornerX, canvasUpperLeftCornerY) {
        const points = this.getBounds();
        const pointsAdjustedToCanvas = points.map((point) => {
            return {
                x: point.x - canvasUpperLeftCornerX,
                y: point.y - canvasUpperLeftCornerY
            }
        });

        const firstPoint = pointsAdjustedToCanvas[0];

        ctx.save();
        ctx.moveTo(this.state.x, this.state.y);
        ctx.rotate(convertToRadians(this.state.angle));

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

        ctx.restore()
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