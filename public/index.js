"use strict";

class GameClient {
    constructor(canvas, worker) {
        this.state = {};
        this.keyState = {};
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.worker = worker;

        this.worker.onmessage = (event) => {
            this.state = event.data;
        };
    }

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const state = Object.assign({}, this.state);

        this.worker.postMessage(this.keyState);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let key in state) {
            if (state.hasOwnProperty(key)) {
                // const playerState = state[key];
                // const canvasUpperLeftCornerX = playerState.x - (canvas.width / 2);
                // const canvasUpperLeftCornerY = playerState.y - (canvas.height / 2);
                this.draw(ctx, state[key], 0, 0);
            }
        }

        requestAnimationFrame(() => this.render());
    }

    draw(ctx, entityState, canvasUpperLeftCornerX, canvasUpperLeftCornerY) {
        console.log(entityState);

        const points = [...entityState.points];
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

    keyEvents() {
        document.addEventListener("keydown", (event) => {
            let keys = ['w', 's', 'a', 'd', ' '];

            keys.forEach((key) => {
                if (event.key === key) {
                    event.preventDefault();
                    this.keyState[key] = true;
                }
            });
        });

        document.addEventListener("keyup", (event) => {
            let keys = ['w', 's', 'a', 'd', ' '];

            keys.forEach((key) => {
                if (event.key === key) {
                    event.preventDefault();
                    delete this.keyState[event.key];
                }
            });
        });
    }
}

const canvas = document.getElementById('canvas');
const worker = new Worker('worker.js');

const gameClient = new GameClient(canvas, worker);
gameClient.keyEvents();
gameClient.render();







