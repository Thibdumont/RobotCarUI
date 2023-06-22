export class RobotState {
    maxSpeed: number = 0;
    radarDistance: number = 0;
    loopDuration: number = 0;
    batteryVoltage: number = 0;
    wifiStrength: number = 0;

    constructor(
        maxSpeed: number,
        radarDistance: number,
        loopDuration: number,
        batteryVoltage: number,
        wifiStrength: number
    ) {
        this.maxSpeed = maxSpeed;
        this.radarDistance = radarDistance;
        this.loopDuration = loopDuration;
        this.batteryVoltage = batteryVoltage;
        this.wifiStrength = wifiStrength;
    }
}