import { Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { RobotStateService } from 'src/app/services/robot-state.service';

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'robotcarui-throttle-widget',
  templateUrl: './throttle-widget.component.html',
  styleUrls: ['./throttle-widget.component.scss'],
})
export class ThrottleWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('forwardThrottleForce') forwardThrottleForce!: ElementRef;
  @ViewChild('backwardThrottleForce') backwardThrottleForce!: ElementRef;
  @ViewChild('maxSpeedIndicator') maxSpeedIndicator!: ElementRef;

  leftTrigger: number = 0;
  rightTrigger: number = 0;
  boost: boolean = false;
  maxSpeed: number = 50;

  destroy$ = new Subject<void>();

  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService,
    public robotStateService: RobotStateService,
    public appConfigService: AppConfigService,
  ) {
    this.handleThrottle();
    this.handleMaxSpeed();
  }

  ngAfterViewInit(): void {
    this.updateMaxSpeedIndicatorPosition(this.maxSpeed);
  }

  handleThrottle() {
    this.gamepadService.leftTriggerChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.appConfigService.carControlSendInterval),
      )
      .subscribe((leftTrigger) => {
        if (!this.rightTrigger && this.leftTrigger !== leftTrigger) {
          this.leftTrigger = leftTrigger;
          this.backwardThrottleForce.nativeElement.style.height = `${Math.round(
            Math.abs(leftTrigger) * 100,
          )}%`;
          this.robotCommunicationService.sendCommand({
            speedThrottle: -leftTrigger,
          });
        }
      });
    this.gamepadService.rightTriggerChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.appConfigService.carControlSendInterval),
      )
      .subscribe((rightTrigger) => {
        if (!this.leftTrigger && this.rightTrigger !== rightTrigger) {
          this.rightTrigger = rightTrigger;
          this.forwardThrottleForce.nativeElement.style.height = `${Math.round(
            Math.abs(rightTrigger) * 100,
          )}%`;
          this.robotCommunicationService.sendCommand({
            speedThrottle: rightTrigger,
          });
        }
      });
    this.gamepadService.yButtonChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((yButton) => {
        const boost = yButton === 1;
        if (boost !== this.boost) {
          this.boost = boost;
          this.robotCommunicationService.sendCommand({ boost: boost ? 1 : 0 });
          this.boost
            ? (this.maxSpeedIndicator.nativeElement.style.top = 0)
            : this.updateMaxSpeedIndicatorPosition(this.maxSpeed);
        }
      });
  }

  handleMaxSpeed() {
    this.gamepadService.leftShoulderChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.appConfigService.carControlSendInterval),
      )
      .subscribe((leftShoulder) => {
        if (leftShoulder) {
          const newSpeed =
            this.maxSpeed - this.appConfigService.maxSpeedChangeIncrement <
            this.appConfigService.minRobotSpeed
              ? this.appConfigService.minRobotSpeed
              : this.maxSpeed - this.appConfigService.maxSpeedChangeIncrement;
          this.robotStateService.setMaxSpeed(newSpeed);
          this.robotCommunicationService.sendCommand({ maxSpeed: newSpeed });
          this.updateMaxSpeedIndicatorPosition(newSpeed);
        }
      });

    this.gamepadService.rightShoulderChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.appConfigService.carControlSendInterval),
      )
      .subscribe((rightShoulder) => {
        if (rightShoulder) {
          const newSpeed =
            this.maxSpeed + this.appConfigService.maxSpeedChangeIncrement >
            this.appConfigService.maxRobotSpeed
              ? this.appConfigService.maxRobotSpeed
              : this.maxSpeed + this.appConfigService.maxSpeedChangeIncrement;
          this.robotStateService.setMaxSpeed(newSpeed);
          this.robotCommunicationService.sendCommand({ maxSpeed: newSpeed });
          this.updateMaxSpeedIndicatorPosition(newSpeed);
        }
      });

    this.robotStateService.robotStateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((robotState) => {
        if (this.maxSpeed !== robotState.maxSpeed) {
          this.maxSpeed = robotState.maxSpeed;
          this.updateMaxSpeedIndicatorPosition(this.maxSpeed);
        }
      });
  }

  updateMaxSpeedIndicatorPosition(newSpeed: number) {
    this.maxSpeedIndicator.nativeElement.style.top = `${
      100 - Math.round((newSpeed / this.appConfigService.maxRobotSpeed) * 100)
    }%`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
