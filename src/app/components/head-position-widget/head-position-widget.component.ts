import { distinctUntilChanged } from 'rxjs';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

const headDiameter = 10;
const headChangeBaseIncrement = 0.05;
const deadZone = 0.01;
@Component({
  selector: 'robotcarui-head-position-widget',
  templateUrl: './head-position-widget.component.html',
  styleUrls: ['./head-position-widget.component.scss']
})
export class HeadPositionWidgetComponent {
  @ViewChild('head') head!: ElementRef;

  headPosition: number = 0;
  previousHeadPosition: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.gamepadService.rightStickXChange.subscribe(rightStickX => {
      this.previousHeadPosition = this.headPosition;
      let headChangeIncrement = Math.abs(rightStickX * headChangeBaseIncrement);
      if (rightStickX < -deadZone) {
        if (this.headPosition - headChangeIncrement > -1) {
          this.headPosition -= headChangeIncrement;
        } else {
          this.headPosition = -1;
        }
      } else if (rightStickX > deadZone) {
        if (this.headPosition + headChangeIncrement < 1) {
          this.headPosition += headChangeIncrement;
        } else {
          this.headPosition = 1;
        }
      }
      this.updateHeadPosition();
    });

    this.gamepadService.rightStickButtonChange.pipe(distinctUntilChanged()).subscribe(rightStickButton => {
      if (rightStickButton) {
        this.headPosition = 0;
        this.updateHeadPosition();
      }
    });

  }

  updateHeadPosition() {
    const calc = `calc(${this.headPosition * 50}% + (50% - ${headDiameter / 2}px))`;
    this.head.nativeElement.style.setProperty('left', calc);

    if (this.headPosition !== this.previousHeadPosition) {
      const headAngle = (-this.headPosition + 1) * 90;
      this.robotCommunicationService.sendCommand({ headPosition: headAngle });
    }
  }

}
