import { Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'robotcarui-direction-widget',
  templateUrl: './direction-widget.component.html',
  styleUrls: ['./direction-widget.component.scss'],
})
export class DirectionWidgetComponent implements OnDestroy {
  @ViewChild('leftDirectionForce') leftDirectionForce!: ElementRef;
  @ViewChild('rightDirectionForce') rightDirectionForce!: ElementRef;

  leftStick: number = 0;
  destroy$ = new Subject<void>();

  constructor(
    private gamepadService: GamepadService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
  ) {
    this.gamepadService.leftStickXChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.appConfigService.carControlSendInterval),
      )
      .subscribe((leftStick) => {
        if (this.leftStick !== leftStick) {
          this.leftStick = leftStick;

          if (leftStick < 0) {
            this.leftDirectionForce.nativeElement.style.width = `${Math.round(
              Math.abs(leftStick) * 100,
            )}%`;
            this.rightDirectionForce.nativeElement.style.width = '0%';
          } else {
            this.leftDirectionForce.nativeElement.style.width = '0%';
            this.rightDirectionForce.nativeElement.style.width = `${Math.round(
              Math.abs(leftStick) * 100,
            )}%`;
          }
          this.robotCommunicationService.sendCommand({ directionX: leftStick });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
