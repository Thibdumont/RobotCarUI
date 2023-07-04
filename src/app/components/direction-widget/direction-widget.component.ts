import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

const joystickMinChange = 0.01;

@Component({
  selector: 'robotcarui-direction-widget',
  templateUrl: './direction-widget.component.html',
  styleUrls: ['./direction-widget.component.scss']
})
export class DirectionWidgetComponent {
  @ViewChild('leftDirectionForce') leftDirectionForce!: ElementRef;
  @ViewChild('rightDirectionForce') rightDirectionForce!: ElementRef;

  leftStick: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.gamepadService.leftStickXChange.subscribe(leftStick => {
      // Prevent sending the same command every time
      if (Math.abs(this.leftStick - leftStick) > joystickMinChange) {
        this.leftStick = leftStick;

        if (leftStick < 0) {
          this.leftDirectionForce.nativeElement.style.width = `${Math.round((Math.abs(leftStick) * 100))}%`;
          this.rightDirectionForce.nativeElement.style.width = '0%';
        } else {
          this.leftDirectionForce.nativeElement.style.width = '0%';
          this.rightDirectionForce.nativeElement.style.width = `${Math.round((Math.abs(leftStick) * 100))}%`;
        }
        this.robotCommunicationService.sendCommand({ directionX: leftStick });
      }
    });

  }

}
