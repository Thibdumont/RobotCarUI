import { distinctUntilChanged, Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { PhotoItem, PhotoService } from 'src/app/services/photo.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { UiPanel, UiPanelDirectorService } from '../../services/ui-panel-director.service';

@Component({
  selector: 'robotcarui-stream-window',
  templateUrl: './stream-window.component.html',
  styleUrls: ['./stream-window.component.scss'],
  animations: [
    trigger('enterLeave', [
      transition(':enter', animate(500, style({ transform: 'translateX(0) translateY(0)' }))),
      state('opened', style({ transform: 'translateX(0) translateY(0)' })),
      transition(':leave', animate(500, style({ transform: 'translateX(100%) translateY(0)' })))
    ])
  ]
})
export class StreamWindowComponent {
  @ViewChild('stream') stream!: ElementRef;

  isStreaming: boolean = false;
  isActive: boolean = true;

  inactive$ = new Subject<void>();

  photo!: PhotoItem | null;

  constructor(
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private photoService: PhotoService
  ) {
    this.autoReconnectStream();
    this.handleActiveState();
    this.handleNavigation();
    this.handlePhotoCapture();
  }

  getStreamUrl(): string {
    return `http://${this.appConfigService.getCurrentHostIP()}/stream`;
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
    this.gamepadService.leftPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        this.uiPanelDirectorService.setActive(UiPanel.INFO);
      }
    });
    this.gamepadService.rightPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad) {
        this.uiPanelDirectorService.setActive(UiPanel.PHOTO);
      }
    });
    this.gamepadService.downPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(downPad => {
      if (downPad) {
        this.uiPanelDirectorService.setActive(UiPanel.CAMERA_CONTROL);
      }
    });
    this.gamepadService.upPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(upPad => {
      if (upPad) {
        this.uiPanelDirectorService.setActive(UiPanel.CAR_SETTING);
      }
    });
  }

  handleActiveState() {
    this.uiPanelDirectorService.getUiPanelSubject(UiPanel.STREAM_WINDOW).subscribe(newState => {
      this.isActive = newState;
      if (this.isActive) {
        this.handlePhotoCapture();
        setTimeout(() => {
          this.handleNavigation();
        }, this.appConfigService.uiPanelAnimationLength);
      } else {
        this.inactive$.next();;
      }
    });
  }

  handlePhotoCapture() {
    this.gamepadService.xButtonChange.pipe(takeUntil(this.inactive$), distinctUntilChanged(), throttleTime(this.appConfigService.delayBetweenPhoto, undefined, { leading: true })).subscribe(xButton => {
      if (xButton) {
        this.photo = this.photoService.takePhoto();
        setTimeout(() => {
          this.photo = null;
        }, this.appConfigService.delayBetweenPhoto);
      }
    });
  }

}
