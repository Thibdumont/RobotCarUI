import { GamepadService } from 'src/app/services/gamepad.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'robotcarui-direction-widget',
  templateUrl: './direction-widget.component.html',
  styleUrls: ['./direction-widget.component.scss']
})
export class DirectionWidgetComponent {
  @ViewChild('leftDirectionForce') leftDirectionForce!: ElementRef;
  @ViewChild('rightDirectionForce') rightDirectionForce!: ElementRef;

  constructor(
    private gamepadService: GamepadService
  ) {
    this.gamepadService.getDirectionChange().subscribe(direction => {
      if (direction < 0) {
        this.leftDirectionForce.nativeElement.style.width = `${Math.round((Math.abs(direction) * 100))}%`;
        this.rightDirectionForce.nativeElement.style.width = '0%';
      } else {
        this.leftDirectionForce.nativeElement.style.width = '0%';
        this.rightDirectionForce.nativeElement.style.width = `${Math.round((Math.abs(direction) * 100))}%`;
      }
    });

  }

}
