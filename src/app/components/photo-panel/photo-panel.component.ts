import { distinctUntilChanged, Subscription, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

export interface PhotoItem {
  date: Date;
  src: string;
}

@Component({
  selector: 'robotcarui-photo-panel',
  templateUrl: './photo-panel.component.html',
  styleUrls: ['./photo-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ left: '0' })),
      state('opened', style({ left: '-100%' })),
      transition('* => *', animate('300ms 0ms ease'))
    ]),
    trigger('slide', [
      state('active', style({ transform: 'translateX(0)' })),
      state('slideLeft', style({ transform: 'translateX(-100%)' })),
      state('slideRight', style({ transform: 'translateX(100%)' })),
      transition('* => *', animate('300ms 0ms ease')),
      transition(':enter', animate(1000, style({ transform: 'translateY(0)' })))

    ])
  ]
})
export class PhotoPanelComponent {
  opened: boolean = false;
  photoList: Array<PhotoItem> = new Array();
  activePhotoIndex: number = 0;

  leftPadSub!: Subscription;
  rightPadSub!: Subscription;
  bButtonSub!: Subscription;

  constructor(
    private gamepadService: GamepadService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService,
    private uiPanelDirectorService: UiPanelDirectorService
  ) {
    this.handleActiveState();
    this.handlePhotoCapture();
    // this.robotCommunicationService.connectionStatusChange.subscribe(connectionOpened => {
    //   if (connectionOpened) {
    //     this.photoList.push(
    //       {
    //         date: new Date(),
    //         src: this.getCaptureUrl()
    //       }
    //     );
    //     this.opened = true;
    //   }
    // });
  }

  handleNavigation() {
    this.leftPadSub = this.gamepadService.leftPadChange.pipe(distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        if (this.activePhotoIndex <= 0) {
          this.uiPanelDirectorService.photoPanelActiveStateChange.next(false);
          this.uiPanelDirectorService.streamWindowActiveStateChange.next(true);
        } else {
          this.activePhotoIndex--;
        }
      }
    });

    this.rightPadSub = this.gamepadService.rightPadChange.pipe(distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad && this.activePhotoIndex + 1 < this.photoList.length) {
        this.activePhotoIndex++;
      }
    });

    this.bButtonSub = this.gamepadService.bButtonChange.pipe(distinctUntilChanged()).subscribe(bButton => {
      if (bButton && this.photoList.length >= 0) {
        const removedPhotoIndex = this.activePhotoIndex;
        this.photoList.splice(removedPhotoIndex, 1);
        if (this.activePhotoIndex >= this.photoList.length) {
          this.activePhotoIndex--;
        }
      }
    });
  }

  unhandleNavigation() {
    this.leftPadSub.unsubscribe();
    this.rightPadSub.unsubscribe();
    this.bButtonSub.unsubscribe();
  }

  handleActiveState() {
    this.uiPanelDirectorService.photoPanelActiveStateChange.subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.unhandleNavigation();
      }
    });
  }

  getPhotoState(index: number): string {
    if (index < this.activePhotoIndex) {
      return 'slideLeft';
    } else if (index > this.activePhotoIndex) {
      return 'slideRight';
    }
    return 'active';
  }

  getZIndex(index: number): number {
    return Math.abs(index - this.photoList.length);
  }

  getCaptureUrl(): string {
    return `http://${this.appConfigService.getCurrentHostIP()}/capture?t=${Date.now()}`;
  }

  handlePhotoCapture() {
    this.gamepadService.aButtonChange.pipe(distinctUntilChanged(), throttleTime(500)).subscribe(aButton => {
      if (aButton) {
        this.activePhotoIndex++;
        this.photoList.unshift(
          {
            date: new Date(),
            src: this.getCaptureUrl()
          }
        );
        setTimeout(() => {
          this.activePhotoIndex = 0;
        }, this.opened ? this.appConfigService.photoPanelDelayBeforeShowingNewPhoto : this.appConfigService.streamWindowDelayBeforeShowingNewPhoto);
      }
    });
  }

}