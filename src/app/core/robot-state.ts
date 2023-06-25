export class RobotState {
    maxSpeed: number = 0;
    radarDistance: number = 0;
    unoLoopDuration: number = 0;
    espLoopDuration: number = 0;
    batteryVoltage: number = 0;
    wifiStrength: number = 0;

    constructor(
        maxSpeed: number,
        radarDistance: number,
        unoLoopDuration: number,
        espLoopDuration: number,
        batteryVoltage: number,
        wifiStrength: number
    ) {
        this.maxSpeed = maxSpeed;
        this.radarDistance = radarDistance;
        this.unoLoopDuration = unoLoopDuration;
        this.espLoopDuration = espLoopDuration;
        this.batteryVoltage = batteryVoltage;
        this.wifiStrength = wifiStrength;
    }
}