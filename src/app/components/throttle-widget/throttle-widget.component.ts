import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

const maxRobotSpeed = 250;
const minRobotSpeed = 50;
const maxSpeedChangeIncrement = 10;

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
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.handleThrottle();
    this.handleMaxSpeed();
  }

  handleThrottle() {
    this.gamepadService.leftTriggerChange.subscribe(leftTrigger => {
      this.leftTrigger = leftTrigger;
      if (!this.rightTrigger) {
        this.backwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(leftTrigger) * 100))}%`;
      } else {
        this.backwardThrottleForce.nativeElement.style.height = '0%';
      }
    });
    this.gamepadService.rightTriggerChange.subscribe(rightTrigger => {
      this.rightTrigger = rightTrigger;
      this.forwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(rightTrigger) * 100))}%`;
    });
  }

  handleMaxSpeed() {
    this.gamepadService.leftShoulderChange.pipe().subscribe(leftShoulder => {
      if (leftShoulder) {
        const newSpeed =
          this.robotCommunicationService.robotState.maxSpeed - maxSpeedChangeIncrement < minRobotSpeed ?
            minRobotSpeed :
            this.robotCommunicationService.robotState.maxSpeed - maxSpeedChangeIncrement;
        this.robotCommunicationService.sendCommand(
          {
            speed: newSpeed
          }
        );
      }
    });

    this.gamepadService.rightShoulderChange.subscribe(rightShoulder => {
      if (rightShoulder) {
        const newSpeed =
          this.robotCommunicationService.robotState.maxSpeed + maxSpeedChangeIncrement > maxRobotSpeed ?
            maxRobotSpeed :
            this.robotCommunicationService.robotState.maxSpeed + maxSpeedChangeIncrement;
        this.robotCommunicationService.sendCommand(
          {
            speed: newSpeed
          }
        );
      }
    });
  }
}
