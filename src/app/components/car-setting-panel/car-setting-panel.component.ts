import { distinctUntilChanged, Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { RobotStateService } from 'src/app/services/robot-state.service';
import { UiPanel, UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

export enum CarSettingEnum {
  SAFE_STOP_DISTANCE,
  SERVO_SPEED
}

export interface CarSettingSlider {
  id: CarSettingEnum,
  label: string,
  jsonProp: string,
  min: number,
  max: number,
  value: number,
  increment: number;
}


@Component({
  selector: 'robotcarui-car-setting-panel',
  templateUrl: './car-setting-panel.component.html',
  styleUrls: ['./car-setting-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ top: '0' })),
      state('opened', style({ top: '100%' })),
      transition('* => *', animate('300ms 0ms ease'))
    ])
  ]
})
export class CarSettingPanelComponent {
  opened: boolean = false;

  inactive$ = new Subject<void>();

  carSettingList: Array<CarSettingSlider> = [
    {
      id: CarSettingEnum.SAFE_STOP_DISTANCE,
      label: 'Safe stop distance (cm)',
      jsonProp: 'safeStopDistance',
      min: 0,
      max: 30,
      value: 0,
      increment: 1
    },
    {
      id: CarSettingEnum.SERVO_SPEED,
      label: 'Head speed (deg/sec)',
      jsonProp: 'servoSpeed',
      min: 0,
      max: 250,
      value: 0,
      increment: 10
    }
  ];

  currentCarSetting: number = this.carSettingList.length - 1;

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private robotStateService: RobotStateService
  ) {
    this.handleActiveState();
    this.initSettings();
  }

  initSettings() {
    this.robotStateService.robotStateHandshakeChange.subscribe(robotState => {
      this.carSettingList[0].value = robotState.safeStopDistance;
      this.carSettingList[1].value = robotState.servoSpeed;
    });
  }

  handleNavigation() {
    this.gamepadService.upPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(upPad => {
      if (upPad) {
        this.currentCarSetting = Math.max(this.currentCarSetting - 1, 0);
      }
    });
    this.gamepadService.downPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(downPad => {
      if (downPad) {
        if (this.currentCarSetting < this.carSettingList.length - 1) {
          this.currentCarSetting = Math.min(this.currentCarSetting + 1, this.carSettingList.length - 1);
        } else {
          this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
        }
      }
    });
    this.gamepadService.leftPadChange.pipe(takeUntil(this.inactive$), throttleTime(100)).subscribe(leftPad => {
      if (leftPad) {
        this.carSettingList[this.currentCarSetting].value =
          Math.max(this.carSettingList[this.currentCarSetting].value - this.carSettingList[this.currentCarSetting].increment,
            this.carSettingList[this.currentCarSetting].min);
        this.changeCarSetting(this.carSettingList[this.currentCarSetting].value);
      }
    });
    this.gamepadService.rightPadChange.pipe(takeUntil(this.inactive$), throttleTime(100)).subscribe(rightPad => {
      if (rightPad) {
        this.carSettingList[this.currentCarSetting].value =
          Math.min(this.carSettingList[this.currentCarSetting].value + this.carSettingList[this.currentCarSetting].increment,
            this.carSettingList[this.currentCarSetting].max);
        this.changeCarSetting(this.carSettingList[this.currentCarSetting].value);
      }
    });
    this.gamepadService.bButtonChange.pipe(takeUntil(this.inactive$)).subscribe(bButton => {
      if (bButton) {
        this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
      }
    });
  }

  handleActiveState() {
    this.uiPanelDirectorService.getUiPanelSubject(UiPanel.CAR_SETTING).subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.inactive$.next();
      }
    });
  }

  isActive(carSettingIndex: number) {
    return this.currentCarSetting === carSettingIndex;
  }

  changeCarSetting(value: number) {
    this.carSettingList[this.currentCarSetting].value = value;
    this.robotCommunicationService.sendCommand(
      JSON.parse(`{ "${this.carSettingList[this.currentCarSetting].jsonProp}": ${value} }`)
    );
  }
}
