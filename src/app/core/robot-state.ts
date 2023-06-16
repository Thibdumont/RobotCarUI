export class RobotState {
    maxSpeed: number = 0;
    radarDistance: number = 0;
    loopDuration: number = 0;

    constructor(
        maxSpeed: number,
        radarDistance: number,
        loopDuration: number
    ) {
        this.maxSpeed = maxSpeed;
        this.radarDistance = radarDistance;
        this.loopDuration = loopDuration;
    }
}