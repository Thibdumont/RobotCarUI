import { distinctUntilChanged, Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { RobotStateService } from 'src/app/services/robot-state.service';
import { UiPanel, UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';

// Camera needs 300ms between each setting update, to prevent crashing
const cameraSettingUpdateDelay = 300;

export enum CameraControlEnum {
  CAMERA_RESOLUTION,
  CAMERA_QUALITY,
  CAMERA_CONTRAST,
  CAMERA_BRIGHTNESS,
  CAMERA_SATURATION
}

export interface CameraControlSlider {
  id: CameraControlEnum,
  label: string,
  jsonProp: string,
  min: number,
  max: number,
  value: number
}

@Component({
  selector: 'robotcarui-camera-control-panel',
  templateUrl: './camera-control-panel.component.html',
  styleUrls: ['./camera-control-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ top: '0' })),
      state('opened', style({ top: '-100%' })),
      transition('* => *', animate('300ms 0ms ease'))
    ])
  ]
})
export class CameraControlPanelComponent implements OnDestroy {

  opened: boolean = false;

  inactive$ = new Subject<void>();
  destroy$ = new Subject<void>();
  currentCameraControl: number = 0;

  cameraControlList: Array<CameraControlSlider> = [
    {
      id: CameraControlEnum.CAMERA_RESOLUTION,
      label: 'Resolution',
      jsonProp: 'cameraResolution',
      min: 0,
      max: 13,
      value: 8
    },
    {
      id: CameraControlEnum.CAMERA_QUALITY,
      label: 'Quality',
      jsonProp: 'cameraQuality',
      min: 0,
      max: 10,
      value: 10
    },
    {
      id: CameraControlEnum.CAMERA_CONTRAST,
      label: 'Contrast',
      jsonProp: 'cameraContrast',
      min: -2,
      max: 2,
      value: 0
    },
    {
      id: CameraControlEnum.CAMERA_BRIGHTNESS,
      label: 'Brightness',
      jsonProp: 'cameraBrightness',
      min: -2,
      max: 2,
      value: 0
    },
    {
      id: CameraControlEnum.CAMERA_SATURATION,
      label: 'Saturation',
      jsonProp: 'cameraSaturation',
      min: -2,
      max: 2,
      value: 0
    }
  ];

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private robotStateService: RobotStateService
  ) {
    this.handleActiveState();
    this.initControls();
  }

  initControls() {
    this.robotStateService.robotStateFirstSync$.pipe(takeUntil(this.destroy$)).subscribe(robotState => {
      this.cameraControlList[0].value = robotState.cameraResolution;
      this.cameraControlList[1].value = robotState.cameraQuality;
      this.cameraControlList[2].value = robotState.cameraContrast;
      this.cameraControlList[3].value = robotState.cameraBrightness;
      this.cameraControlList[4].value = robotState.cameraSaturation;
    });
  }

  handleNavigation() {
    this.gamepadService.upPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(upPad => {
      if (upPad) {
        if (this.currentCameraControl > 0) {
          this.currentCameraControl = Math.max(this.currentCameraControl - 1, 0);
        } else {
          this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
        }
      }
    });
    this.gamepadService.downPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(downPad => {
      if (downPad) {
        this.currentCameraControl = Math.min(this.currentCameraControl + 1, this.cameraControlList.length - 1);
      }
    });
    this.gamepadService.leftPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged(), throttleTime(cameraSettingUpdateDelay)).subscribe(leftPad => {
      if (leftPad) {
        this.cameraControlList[this.currentCameraControl].value =
          Math.max(this.cameraControlList[this.currentCameraControl].value - 1,
            this.cameraControlList[this.currentCameraControl].min);
        this.changeCameraControl(this.cameraControlList[this.currentCameraControl].value);
      }
    });
    this.gamepadService.rightPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged(), throttleTime(cameraSettingUpdateDelay)).subscribe(rightPad => {
      if (rightPad) {
        this.cameraControlList[this.currentCameraControl].value =
          Math.min(this.cameraControlList[this.currentCameraControl].value + 1,
            this.cameraControlList[this.currentCameraControl].max);
        this.changeCameraControl(this.cameraControlList[this.currentCameraControl].value);
      }
    });
    this.gamepadService.bButtonChange.pipe(takeUntil(this.inactive$)).subscribe(bButton => {
      if (bButton) {
        this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
      }
    });
  }



  handleActiveState() {
    this.uiPanelDirectorService.getUiPanelSubject(UiPanel.CAMERA_CONTROL).pipe(takeUntil(this.destroy$)).subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.inactive$.next();
      }
    });
  }

  isActive(cameraControlIndex: number) {
    return this.currentCameraControl === cameraControlIndex;
  }

  changeCameraControl(value: number) {
    this.cameraControlList[this.currentCameraControl].value = value;
    this.robotCommunicationService.sendCommand(
      JSON.parse(`{ "${this.cameraControlList[this.currentCameraControl].jsonProp}": ${value} }`)
    );
  }

  ngOnDestroy(): void {
    this.inactive$.next();
    this.destroy$.next();
  }
}
