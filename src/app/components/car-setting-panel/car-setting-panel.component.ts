import { distinctUntilChanged, Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { RobotStateService } from 'src/app/services/robot-state.service';
import {
  UiPanel,
  UiPanelDirectorService,
} from 'src/app/services/ui-panel-director.service';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';

export enum CarSettingEnum {
  SAFE_STOP_DISTANCE,
  SERVO_SPEED,
  TURN_FACTOR,
  AUTO_SPEED_MODE,
  AUTO_SPEED_FACTOR,
}

enum CarSettingType {
  SLIDER,
  TOGGLE,
}

export interface CarSettingItem {
  id: CarSettingEnum;
  label: string;
  jsonProp: string;
  min?: number;
  max?: number;
  increment?: number;
  value: number;
  itemType: CarSettingType;
}

@Component({
  selector: 'robotcarui-car-setting-panel',
  templateUrl: './car-setting-panel.component.html',
  styleUrls: ['./car-setting-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ top: '0' })),
      state('opened', style({ top: '100%' })),
      transition('* => *', animate('300ms 0ms ease')),
    ]),
  ],
})
export class CarSettingPanelComponent implements OnDestroy {
  opened: boolean = false;

  inactive$ = new Subject<void>();
  destroy$ = new Subject<void>();

  carSettingList: Array<CarSettingItem> = [
    {
      id: CarSettingEnum.SAFE_STOP_DISTANCE,
      label: 'Safe stop distance (cm)',
      jsonProp: 'safeStopDistance',
      min: 0,
      max: 30,
      value: 0,
      increment: 1,
      itemType: CarSettingType.SLIDER,
    },
    {
      id: CarSettingEnum.SERVO_SPEED,
      label: 'Head speed (deg/sec)',
      jsonProp: 'servoSpeed',
      min: 0,
      max: 250,
      value: 0,
      increment: 10,
      itemType: CarSettingType.SLIDER,
    },
    {
      id: CarSettingEnum.TURN_FACTOR,
      label: 'Turn factor (force of the turn)',
      jsonProp: 'turnFactor',
      min: 1,
      max: 5,
      value: 1,
      increment: 0.1,
      itemType: CarSettingType.SLIDER,
    },
    {
      id: CarSettingEnum.AUTO_SPEED_MODE,
      label: 'Auto speed mode (adjust max speed to the front clearance)',
      jsonProp: 'autoSpeedMode',
      value: 0,
      itemType: CarSettingType.TOGGLE,
    },
    {
      id: CarSettingEnum.AUTO_SPEED_FACTOR,
      label: 'Auto speed factor (speed level of the auto speed mode)',
      jsonProp: 'autoSpeedFactor',
      min: 1,
      max: 3,
      value: 1,
      increment: 0.1,
      itemType: CarSettingType.SLIDER,
    },
  ];

  currentCarSetting: number = this.carSettingList.length - 1;

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private robotStateService: RobotStateService,
  ) {
    this.handleActiveState();
    this.initSettings();
  }

  initSettings() {
    this.robotStateService.robotStateFirstSync$
      .pipe(takeUntil(this.destroy$))
      .subscribe((robotState) => {
        this.carSettingList[0].value = robotState.safeStopDistance;
        this.carSettingList[1].value = robotState.servoSpeed;
        this.carSettingList[2].value = this.trimFloat(robotState.turnFactor);
        this.carSettingList[3].value = robotState.autoSpeedMode;
        this.carSettingList[4].value = this.trimFloat(
          robotState.autoSpeedFactor,
        );
      });
  }

  handleNavigation() {
    this.gamepadService.upPadChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((upPad) => {
        if (upPad) {
          this.currentCarSetting = Math.max(this.currentCarSetting - 1, 0);
        }
      });
    this.gamepadService.downPadChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((downPad) => {
        if (downPad) {
          if (this.currentCarSetting < this.carSettingList.length - 1) {
            this.currentCarSetting = Math.min(
              this.currentCarSetting + 1,
              this.carSettingList.length - 1,
            );
          } else {
            this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
          }
        }
      });
    this.gamepadService.leftPadChange
      .pipe(takeUntil(this.inactive$), throttleTime(100))
      .subscribe((leftPad) => {
        if (leftPad && this.isSettingSlider(this.getSelectedSetting())) {
          this.getSelectedSetting().value = Math.max(
            this.getSelectedSetting().value -
              this.getSelectedSetting().increment!,
            this.getSelectedSetting().min!,
          );
          this.getSelectedSetting().value = this.trimFloat(
            this.getSelectedSetting().value,
          );
          this.changeCarSetting(this.getSelectedSetting().value);
        }
      });
    this.gamepadService.rightPadChange
      .pipe(takeUntil(this.inactive$), throttleTime(100))
      .subscribe((rightPad) => {
        if (rightPad && this.isSettingSlider(this.getSelectedSetting())) {
          this.getSelectedSetting().value = Math.min(
            this.getSelectedSetting().value +
              this.getSelectedSetting().increment!,
            this.getSelectedSetting().max!,
          );
          this.getSelectedSetting().value = this.trimFloat(
            this.getSelectedSetting().value,
          );
          this.changeCarSetting(this.getSelectedSetting().value);
        }
      });
    this.gamepadService.aButtonChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((aButton) => {
        if (aButton && !this.isSettingSlider(this.getSelectedSetting())) {
          this.getSelectedSetting().value =
            this.getSelectedSetting().value === 1 ? 0 : 1;
          this.changeCarSetting(this.getSelectedSetting().value);
        }
      });
    this.gamepadService.bButtonChange
      .pipe(takeUntil(this.inactive$))
      .subscribe((bButton) => {
        if (bButton) {
          this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
        }
      });
  }

  handleActiveState() {
    this.uiPanelDirectorService
      .getUiPanelSubject(UiPanel.CAR_SETTING)
      .pipe(takeUntil(this.destroy$))
      .subscribe((newState) => {
        this.opened = newState;
        if (this.opened) {
          setTimeout(
            () => this.handleNavigation(),
            this.appConfigService.uiPanelAnimationLength,
          );
        } else {
          this.inactive$.next();
        }
      });
  }

  isActive(carSettingIndex: number) {
    return this.currentCarSetting === carSettingIndex;
  }

  changeCarSetting(value: number) {
    this.getSelectedSetting().value = value;
    this.robotStateService.updateValue(
      this.getSelectedSetting().jsonProp,
      value,
    );
    this.robotCommunicationService.sendCommand(
      JSON.parse(`{ "${this.getSelectedSetting().jsonProp}": ${value} }`),
    );
  }

  isSettingSlider(carSetting: CarSettingItem): boolean {
    return carSetting.itemType === CarSettingType.SLIDER;
  }

  getSelectedSetting(): CarSettingItem {
    return this.carSettingList[this.currentCarSetting];
  }

  trimFloat(value: number): number {
    return Number(value.toPrecision(2));
  }

  ngOnDestroy(): void {
    this.inactive$.next();
    this.destroy$.next();
  }
}
