import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotState } from '../core/robot-state';

@Injectable({
  providedIn: 'root'
})
export class RobotStateService {
  public robotStateFirstSync$: Subject<RobotState> = new Subject();
  public robotStateChange: Subject<RobotState> = new Subject();

  public robotState: RobotState = new RobotState();

  constructor() { }

  processEspMessage(json: any) {
    if (json.handshake) {
      // Properties retrieved only once, during the first sync
      this.robotState.maxSpeed = json.maxSpeed ?? this.robotState.maxSpeed;
      this.robotState.safeStopDistance = json.safeStopDistance ?? this.robotState.safeStopDistance;
      this.robotState.servoAngle = json.servoAngle ?? this.robotState.servoAngle;
      this.robotState.servoSpeed = json.servoSpeed ?? this.robotState.servoSpeed;
      this.robotState.cameraQuality = json.cameraQuality ?? this.robotState.cameraQuality;
      this.robotState.cameraResolution = json.cameraResolution ?? this.robotState.cameraResolution;
      this.robotState.cameraContrast = json.cameraContrast ?? this.robotState.cameraContrast;
      this.robotState.cameraBrightness = json.cameraBrightness ?? this.robotState.cameraBrightness;
      this.robotState.cameraSaturation = json.cameraSaturation ?? this.robotState.cameraSaturation;
      this.robotStateFirstSync$.next(this.robotState);
    } else {
      // Retrieved every "frame"
      this.robotState.radarDistance = json.radarDistance ?? this.robotState.radarDistance;
      this.robotState.batteryVoltage = json.batteryVoltage ?? this.robotState.batteryVoltage;
      this.robotState.unoLoopDuration = json.unoLoopDuration ?? this.robotState.unoLoopDuration;
      this.robotState.espLoopDuration = json.espLoopDuration ?? this.robotState.espLoopDuration;
      this.robotState.wifiStrength = json.wifiStrength ?? this.robotState.wifiStrength;
      this.robotStateChange.next(this.robotState);
    }
  }

  setMaxSpeed(maxSpeed: number) {
    this.robotState.maxSpeed = maxSpeed;
    this.robotStateChange.next(this.robotState);
  }

}
