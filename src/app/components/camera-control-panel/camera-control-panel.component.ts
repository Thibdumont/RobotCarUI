import { distinctUntilChanged, Subscription } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

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
        this.uiPanelDirectorService.cameraControlPanelActiveStateChange.next(false);
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(true);
      }
    });
  }

  unhandleNavigation() {
    this.upPadSub.unsubscribe();
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

  changeCameraResolution(event: Event) {
    this.robotCommunicationService.sendCommand({ cameraResolution: +(event.target as HTMLInputElement).value });
  }

  changeCameraQuality(event: Event) {
    this.robotCommunicationService.sendCommand({ cameraQuality: +(event.target as HTMLInputElement).value });
  }
}
