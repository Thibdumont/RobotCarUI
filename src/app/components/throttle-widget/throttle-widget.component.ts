import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'robotcarui-throttle-widget',
  templateUrl: './throttle-widget.component.html',
  styleUrls: ['./throttle-widget.component.scss']
})
export class ThrottleWidgetComponent {
  @ViewChild('forwardThrottleForce') forwardThrottleForce!: ElementRef;
  @ViewChild('backwardThrottleForce') backwardThrottleForce!: ElementRef;

  leftTrigger: number = 0;
  rightTrigger: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService,
    private appConfigService: AppConfigService
  ) {
    this.handleThrottle();
    this.handleMaxSpeed();
  }

  handleThrottle() {
    this.gamepadService.leftTriggerChange.subscribe(leftTrigger => {
      if (!this.rightTrigger && this.leftTrigger !== leftTrigger) {
        this.leftTrigger = leftTrigger;
        this.backwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(leftTrigger) * 100))}%`;
        this.robotCommunicationService.sendCommand({ speedThrottle: -leftTrigger });
      } else {
        this.backwardThrottleForce.nativeElement.style.height = '0%';
      }
    });
    this.gamepadService.rightTriggerChange.subscribe(rightTrigger => {
      if (!this.leftTrigger && this.rightTrigger !== rightTrigger) {
        this.rightTrigger = rightTrigger;
        this.forwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(rightTrigger) * 100))}%`;
        this.robotCommunicationService.sendCommand({ speedThrottle: rightTrigger });
      }
    });
  }

  handleMaxSpeed() {
    this.gamepadService.leftShoulderChange.pipe().subscribe(leftShoulder => {
      if (leftShoulder) {
        const newSpeed =
          this.robotCommunicationService.robotState.maxSpeed - this.appConfigService.maxSpeedChangeIncrement < this.appConfigService.minRobotSpeed ?
            this.appConfigService.minRobotSpeed :
            this.robotCommunicationService.robotState.maxSpeed - this.appConfigService.maxSpeedChangeIncrement;
        this.robotCommunicationService.sendCommand({ maxSpeed: newSpeed });
      }
    });

    this.gamepadService.rightShoulderChange.subscribe(rightShoulder => {
      if (rightShoulder) {
        const newSpeed =
          this.robotCommunicationService.robotState.maxSpeed + this.appConfigService.maxSpeedChangeIncrement > this.appConfigService.maxRobotSpeed ?
            this.appConfigService.maxRobotSpeed :
            this.robotCommunicationService.robotState.maxSpeed + this.appConfigService.maxSpeedChangeIncrement;
        this.robotCommunicationService.sendCommand({ maxSpeed: newSpeed });
      }
    });
  }
}
