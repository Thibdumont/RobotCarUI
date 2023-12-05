export class RobotState {
  // Motor settings
  public maxSpeed: number = 0;
  public turnFactor: number = 0;
  public autoSpeedMode: number = 0;
  public autoSpeedFactor: number = 0;
  public safeStopDistance: number = 0;

  // Servo settings
  public servoAngle: number = 0;
  public servoSpeed: number = 0;

  //Radar
  public radarDistance: number = 0;

  // IR captor
  public onGround: number = 0;

  // Battery
  public batteryVoltage: number = 0;

  // Wifi
  public wifiStrength: number = 0;

  //HUD
  public hudRadarDistance: number = 0;
  public hudBatteryVoltage: number = 0;
  public hudOnGround: number = 0;
  public hudUnoLoopTime: number = 0;
  public hudEspLoopTime: number = 0;

  //Camera settings
  public cameraResolution: number = 0;
  public cameraQuality: number = 0;
  public cameraContrast: number = 0;
  public cameraBrightness: number = 0;
  public cameraSaturation: number = 0;

  //Debug
  public unoLoopDuration: number = 0;
  public espLoopDuration: number = 0;
}
