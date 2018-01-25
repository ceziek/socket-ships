import State from './State.js';
import Game from './Game.js';


/*function checkCollision(shipPoints, obstaclePoints) {
    let valid = true;

    shipPoints.forEach((shipPoint, index) => {
        let nextIndex = index + 1 !== shipPoints.length ? index + 1 : 0;
        let shipSector = [shipPoints[index], shipPoints[nextIndex]];
        let shipLineFactors = getLineFactors(shipSector);

        let a1 = shipLineFactors.factorA;
        let b1 = shipLineFactors.factorB;

        obstaclePoints.forEach((obstaclePoint, index) => {
            let nextIndex = index + 1 !== obstaclePoints.length ? index + 1 : 0;
            let obstacleSector = [obstaclePoints[index], obstaclePoints[nextIndex]];
            let obstacleLineFactors = getLineFactors(obstacleSector);

            let a2 = obstacleLineFactors.factorA;
            let b2 = obstacleLineFactors.factorB;

            //  y = a1x + b1
            //  y = a2x + b2

            // a1x + b1 - a2x - b2 = 0
            // (a1 - a2)x = b2 - b1

            let x = (b2 - b1) / (a1 - a2);
            let y = a1 * x + b1;

            if
            (
                x >= Math.min(shipSector[0].x, shipSector[1].x) && x <= Math.max(shipSector[0].x, shipSector[1].x) &&
                y >= Math.min(shipSector[0].y, shipSector[1].y) && y <= Math.max(shipSector[0].y, shipSector[1].y) &&
                x >= Math.min(obstacleSector[0].x, obstacleSector[1].x) && x <= Math.max(obstacleSector[0].x, obstacleSector[1].x) &&
                y >= Math.min(obstacleSector[0].y, obstacleSector[1].y) && y <= Math.max(obstacleSector[0].y, obstacleSector[1].y)
            ) {
                valid = false;
            }
        })
    });
    return valid;
}*/

// function getLineFactors(sector) {
//     let point1 = sector[0];
//     let point2 = sector[1];
//
//     // y = Ax + B
//
//     // point1.y = A * point1.x + B;
//     // point2.y = A * point2.x + B;
//
//     let factorA = (point1.y - point2.y) / (point1.x - point2.x);
//     let factorB = point1.y - ((point1.y - point2.y) * (point1.x) / (point1.x - point2.x));
//
//     return {factorA, factorB}
// }
//


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const socket = io('localhost:3000');
const state = new State();

const game = new Game(ctx, state, socket);

game.start();


