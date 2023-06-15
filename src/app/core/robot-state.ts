export class RobotState {
    maxSpeed: number = 0;
    radarDistance: number = 0;

    constructor(
        maxSpeed: number,
        radarDistance: number
    ) {
        this.maxSpeed = maxSpeed;
        this.radarDistance = radarDistance;
    }
}