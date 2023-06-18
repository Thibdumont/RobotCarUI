import { distinctUntilChanged } from 'rxjs';
import { RobotState } from 'src/app/core/robot-state';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

export interface InfoPanelItem {
  label: string;
  value: string | number;
  unit?: string;
}

@Component({
  selector: 'robotcarui-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ transform: 'translateX(-100%)' })),
      state('opened', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('300ms 0ms ease'))
    ])
  ]
})
export class InfoPanelComponent {

  opened: boolean = false;
  robotState!: RobotState;

  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.gamepadService.yButtonChange.pipe(distinctUntilChanged()).subscribe(yButton => {
      if (yButton) {
        this.opened = !this.opened;
      }
    });

    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      this.robotState = robotState;
    });
  }

  getInfoList(): Array<InfoPanelItem> {
    return [
      {
        label: 'Radar',
        value: this.robotState.radarDistance,
        unit: 'cm'
      },
      {
        label: 'Max speed',
        value: this.robotState.maxSpeed,
        unit: 'rpm'
      },
      {
        label: 'Loop time',
        value: this.robotState.loopDuration,
        unit: 'ms'
      },
      {
        label: 'Battery voltage',
        value: this.robotState.batteryVoltage.toPrecision(3),
        unit: 'V'
      }
    ]
  }

}
