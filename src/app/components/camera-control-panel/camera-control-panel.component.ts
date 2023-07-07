import { distinctUntilChanged, Subscription } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

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
export class CameraControlPanelComponent {

  opened: boolean = false;
  upPadSub!: Subscription;
  downPadSub!: Subscription;
  leftPadSub!: Subscription;
  rightPadSub!: Subscription;

  cameraResolution: number = 8;
  cameraQuality: number = 10;

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
    },
  ];

  currentCameraControl: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.handleActiveState();
  }

  handleNavigation() {
    this.upPadSub = this.gamepadService.upPadChange.pipe(distinctUntilChanged()).subscribe(upPad => {
      if (upPad) {
        if (this.currentCameraControl > 0) {
          this.currentCameraControl = Math.max(this.currentCameraControl - 1, 0);
        } else {
          this.uiPanelDirectorService.cameraControlPanelActiveStateChange.next(false);
          this.uiPanelDirectorService.streamWindowActiveStateChange.next(true);
        }
      }
    });
    this.downPadSub = this.gamepadService.downPadChange.pipe(distinctUntilChanged()).subscribe(downPad => {
      if (downPad) {
        this.currentCameraControl = Math.min(this.currentCameraControl + 1, this.cameraControlList.length - 1);
      }
    });
    this.leftPadSub = this.gamepadService.leftPadChange.pipe(distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        this.cameraControlList[this.currentCameraControl].value =
          Math.max(this.cameraControlList[this.currentCameraControl].value - 1,
            this.cameraControlList[this.currentCameraControl].min);
        this.changeCameraControl(this.cameraControlList[this.currentCameraControl].value);
      }
    });
    this.rightPadSub = this.gamepadService.rightPadChange.pipe(distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad) {
        this.cameraControlList[this.currentCameraControl].value =
          Math.min(this.cameraControlList[this.currentCameraControl].value + 1,
            this.cameraControlList[this.currentCameraControl].max);
        this.changeCameraControl(this.cameraControlList[this.currentCameraControl].value);
      }
    });
  }

  unhandleNavigation() {
    this.upPadSub.unsubscribe();
    this.downPadSub.unsubscribe();
    this.leftPadSub.unsubscribe();
    this.rightPadSub.unsubscribe();
  }

  handleActiveState() {
    this.uiPanelDirectorService.cameraControlPanelActiveStateChange.subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.unhandleNavigation();
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
}
