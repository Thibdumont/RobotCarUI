import { GamepadService } from 'src/app/services/gamepad.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'robotcarui-throttle-widget',
  templateUrl: './throttle-widget.component.html',
  styleUrls: ['./throttle-widget.component.scss']
})
export class ThrottleWidgetComponent {
  @ViewChild('forwardThrottleForce') forwardThrottleForce!: ElementRef;
  @ViewChild('backwardThrottleForce') backwardThrottleForce!: ElementRef;

  constructor(
    private gamepadService: GamepadService
  ) {
    this.gamepadService.getThrottleChange().subscribe(throttle => {
      if (throttle < 0) {
        this.backwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(throttle) * 100))}%`;
        this.forwardThrottleForce.nativeElement.style.height = '0%';
      } else {
        this.backwardThrottleForce.nativeElement.style.height = '0%';
        this.forwardThrottleForce.nativeElement.style.height = `${Math.round((Math.abs(throttle) * 100))}%`;
      }
    });

  }
}
