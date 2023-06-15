import { GamepadService } from 'src/app/services/gamepad.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

const headDiameter = 10;
const headChangeBaseIncrement = 0.05;
const deadZone = 0.1;
@Component({
  selector: 'robotcarui-head-position-widget',
  templateUrl: './head-position-widget.component.html',
  styleUrls: ['./head-position-widget.component.scss']
})
export class HeadPositionWidgetComponent {
  @ViewChild('head') head!: ElementRef;

  headPosition: number = 0;

  constructor(
    private gamepadService: GamepadService
  ) {
    this.gamepadService.rightStickXChange.subscribe(rightStickX => {
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
      const calc = `calc(${this.headPosition * 50}% + (50% - ${headDiameter / 2}px))`;
      this.head.nativeElement.style.setProperty('left', calc);
    });

  }
}
