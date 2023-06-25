import { distinctUntilChanged, Subscription } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

import { UiPanelDirectorService } from '../../services/ui-panel-director.service';

@Component({
  selector: 'robotcarui-stream-window',
  templateUrl: './stream-window.component.html',
  styleUrls: ['./stream-window.component.scss']
})
export class StreamWindowComponent {
  @ViewChild('stream') stream!: ElementRef;

  isStreaming: boolean = false;
  isActive: boolean = true;

  leftPadSub!: Subscription;
  rightPadSub!: Subscription;
  upPadSub!: Subscription;

  constructor(
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService
  ) {
    this.autoReconnectStream();
    this.handleNavigation();
    this.handleActiveState();
  }

  getStreamUrl(): string {
    return `http://${this.appConfigService.hostname}/stream`;
  }

  autoReconnectStream() {
    this.robotCommunicationService.connectionStatusChange.subscribe(connectionOpened => {
      if (!connectionOpened) {
        this.stream.nativeElement.src = '';
        this.isStreaming = false;
      } else {
        this.stream.nativeElement.src = this.getStreamUrl();
        this.isStreaming = true;
      }
    });
  }

  handleNavigation() {
    this.leftPadSub = this.gamepadService.leftPadChange.pipe(distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(false);
        this.uiPanelDirectorService.infoPanelActiveStateChange.next(true);
      }
    });
    this.rightPadSub = this.gamepadService.rightPadChange.pipe(distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad) {
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(false);
        this.uiPanelDirectorService.photoPanelActiveStateChange.next(true);
      }
    });
    this.upPadSub = this.gamepadService.upPadChange.pipe(distinctUntilChanged()).subscribe(upPad => {
      if (upPad) {
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(false);
        this.uiPanelDirectorService.controlHelpPanelActiveStateChange.next(true);
      }
    });
  }

  unhandleNavigation() {
    this.leftPadSub.unsubscribe();
    this.rightPadSub.unsubscribe();
    this.upPadSub.unsubscribe();
  }

  handleActiveState() {
    this.uiPanelDirectorService.streamWindowActiveStateChange.subscribe(newState => {
      this.isActive = newState;
      if (this.isActive) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.unhandleNavigation();
      }
    });
  }
}
