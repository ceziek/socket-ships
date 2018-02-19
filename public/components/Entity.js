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

        this.state.points = bounds;

        // this.rotate();
    }

    rotate() {
        let state = Object.assign({}, this.state);
        let points = state.points;
        let deviation = state.deviation;

        points.forEach((point) => {
            let tempX = point.x - state.x;
            let tempY = point.y - state.y;

            let rotatedX = tempX * Math.cos(convertToRadians(deviation)) - tempY * Math.sin(convertToRadians(deviation));
            let rotatedY = tempX * Math.sin(convertToRadians(deviation)) + tempY * Math.cos(convertToRadians(deviation));

            point.x = rotatedX + state.x;
            point.y = rotatedY + state.y;
        });

        state.angle += deviation;

        state.angle = state.angle < 0 ? state.angle + 360 : state.angle;
        state.angle = state.angle > 360 ? 0 : state.angle;

        state.deviation = 0;

        this.update(state);
        this.state.points = [...points];
    }

    draw(ctx, canvasUpperLeftCornerX, canvasUpperLeftCornerY) {
        const points = [...this.state.points];
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