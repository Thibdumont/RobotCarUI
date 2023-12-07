import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotState } from '../core/robot-state';
import { AppConfigService } from './app-config.service';
import { GamepadService } from './gamepad.service';

@Injectable({
  providedIn: 'root',
})
export class RobotStateService {
  public robotStateFirstSync$: Subject<RobotState> = new Subject();
  public robotStateChange: Subject<RobotState> = new Subject();

  public robotState: RobotState = new RobotState();

  public safeStopDistanceReached: boolean = false;

  constructor(private gamepadService: GamepadService) {}

  processEspMessage(json: any) {
    if (json.syncRequest) {
      // Properties retrieved only once, during the first sync
      // Motor
      this.robotState.maxSpeed = json.maxSpeed ?? this.robotState.maxSpeed;
      this.robotState.safeStopDistance =
        json.safeStopDistance ?? this.robotState.safeStopDistance;
      this.robotState.turnFactor =
        json.turnFactor ?? this.robotState.turnFactor;
      this.robotState.autoSpeedFactor =
        json.autoSpeedFactor ?? this.robotState.autoSpeedFactor;
      this.robotState.autoSpeedMode =
        json.autoSpeedMode ?? this.robotState.autoSpeedMode;
      // Servo
      this.robotState.servoAngle =
        json.servoAngle ?? this.robotState.servoAngle;
      this.robotState.servoSpeed =
        json.servoSpeed ?? this.robotState.servoSpeed;
      // IR Captor
      this.robotState.onGround = json.onGround ?? this.robotState.onGround;
      // Camera
      this.robotState.cameraQuality =
        json.cameraQuality ?? this.robotState.cameraQuality;
      this.robotState.cameraResolution =
        json.cameraResolution ?? this.robotState.cameraResolution;
      this.robotState.cameraContrast =
        json.cameraContrast ?? this.robotState.cameraContrast;
      this.robotState.cameraBrightness =
        json.cameraBrightness ?? this.robotState.cameraBrightness;
      this.robotState.cameraSaturation =
        json.cameraSaturation ?? this.robotState.cameraSaturation;
      // HUD
      this.robotState.hudRadarDistance =
        json.hudRadarDistance ?? this.robotState.hudRadarDistance;
      this.robotState.hudBatteryVoltage =
        json.hudBatteryVoltage ?? this.robotState.hudBatteryVoltage;
      this.robotState.hudOnGround =
        json.hudOnGround ?? this.robotState.hudOnGround;
      this.robotState.hudUnoLoopTime =
        json.hudUnoLoopTime ?? this.robotState.hudUnoLoopTime;
      this.robotState.hudEspLoopTime =
        json.hudEspLoopTime ?? this.robotState.hudEspLoopTime;
      //Battery
      this.robotState.batteryVoltage =
        json.batteryVoltage ?? this.robotState.batteryVoltage;
      //Wifi
      this.robotState.wifiStrength =
        json.wifiStrength ?? this.robotState.wifiStrength;
      //Debug
      this.robotState.unoLoopDuration =
        json.unoLoopDuration ?? this.robotState.unoLoopDuration;
      this.robotState.espLoopDuration =
        json.espLoopDuration ?? this.robotState.espLoopDuration;

      this.robotStateFirstSync$.next(this.robotState);
    } else {
      // Retrieved every "frame"
      this.robotState.radarDistance =
        json.radarDistance ?? this.robotState.radarDistance;
      this.robotState.onGround = json.onGround ?? this.robotState.onGround;
      this.robotState.batteryVoltage =
        json.batteryVoltage ?? this.robotState.batteryVoltage;
      this.robotState.unoLoopDuration =
        json.unoLoopDuration ?? this.robotState.unoLoopDuration;
      this.robotState.espLoopDuration =
        json.espLoopDuration ?? this.robotState.espLoopDuration;
      this.robotState.wifiStrength =
        json.wifiStrength ?? this.robotState.wifiStrength;
      this.robotStateChange.next(this.robotState);
    }

    this.reactToStateChange();
  }

  updateValue(property: string, value: any) {
    this.robotState[property as keyof typeof this.robotState] = value;
    this.robotStateChange.next(this.robotState);
  }

  /**
   * Here, we trigger some stuff relative to state change
   */
  reactToStateChange() {
    if (this.robotState.radarDistance <= this.robotState.safeStopDistance) {
      if (!this.safeStopDistanceReached) {
        this.gamepadService.rumble({
          startDelay: 0,
          duration: 300,
          weakMagnitude: 0,
          strongMagnitude: 1,
        });
        this.safeStopDistanceReached = true;
      }
    } else {
      this.safeStopDistanceReached = false;
    }
  }
}
