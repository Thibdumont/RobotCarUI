import { distinctUntilChanged, Subscription } from 'rxjs';
import { RobotState } from 'src/app/core/robot-state';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotStateService } from 'src/app/services/robot-state.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

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
      state('closed', style({ left: '0' })),
      state('opened', style({ left: '100%' })),
      transition('* => *', animate('300ms 0ms ease'))
    ])
  ]
})
export class InfoPanelComponent {

  opened: boolean = false;
  robotState!: RobotState;

  rightPadSub!: Subscription;
  robotStateSub!: Subscription;

  constructor(
    private gamepadService: GamepadService,
    private robotStateService: RobotStateService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService
  ) {
    this.handleActiveState();
  }

  handleSubscribe() {
    this.handleNavigation();
    this.handleDataCollection();
  }

  handleNavigation() {
    this.rightPadSub = this.gamepadService.rightPadChange.pipe(distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad) {
        this.uiPanelDirectorService.infoPanelActiveStateChange.next(false);
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(true);
      }
    });
  }

  handleUnsubscribe() {
    this.rightPadSub.unsubscribe();
    this.robotStateSub.unsubscribe();
  }


  handleActiveState() {
    this.uiPanelDirectorService.infoPanelActiveStateChange.subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleSubscribe(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.handleUnsubscribe();
      }
    });
  }

  handleDataCollection() {
    this.robotStateSub = this.robotStateService.robotStateChange.subscribe(robotState => {
      this.robotState = robotState;
    });
  }

  getInfoList(): Array<InfoPanelItem> {
    if (this.robotState) {
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
          label: 'Uno loop time',
          value: this.robotState.unoLoopDuration,
          unit: 'ms'
        },
        {
          label: 'ESP loop time',
          value: this.robotState.espLoopDuration,
          unit: 'ms'
        },
        {
          label: 'Battery voltage',
          value: this.robotState.batteryVoltage.toPrecision(3),
          unit: 'V'
        }
      ]
    }
    return [];
  }

}
