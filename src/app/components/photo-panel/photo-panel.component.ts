import { distinctUntilChanged } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

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
      state('closed', style({ transform: 'translateX(100%)' })),
      state('opened', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('300ms 0ms ease'))
    ]),
    trigger('slide', [
      state('active', style({ transform: 'translateX(0)' })),
      state('slideLeft', style({ transform: 'translateX(-100%)' })),
      state('slideRight', style({ transform: 'translateX(100%)' })),
      transition('* => *', animate('500ms 0ms ease')),
      transition(':enter', animate(1000, style({ transform: 'translateY(0)' })))

    ])
  ]
})
export class PhotoPanelComponent {
  opened: boolean = false;
  photoList: Array<PhotoItem> = new Array();
  activePhotoIndex: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.gamepadService.leftPadChange.pipe(distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        if (this.activePhotoIndex === 0) {
          this.opened = false;
        } else {
          this.activePhotoIndex--;
        }
      }
    });
    this.gamepadService.rightPadChange.pipe(distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad) {
        if (!this.opened && this.photoList.length > 0) {
          this.opened = true;
          this.activePhotoIndex = 0;
        } else if (this.activePhotoIndex + 1 < this.photoList.length) {
          this.activePhotoIndex++;
        }
      }
    });

    this.gamepadService.bButtonChange.pipe(distinctUntilChanged()).subscribe(bButton => {
      if (bButton && this.photoList.length >= 0) {
        const removedPhotoIndex = this.activePhotoIndex;
        if (this.activePhotoIndex > 0) {
          this.activePhotoIndex--;
        } else {
          this.opened = false;
        }
        this.photoList.splice(removedPhotoIndex, 1);
      }
    });

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
    return `http://${this.appConfigService.hostname}/capture?t=${Date.now()}`;
  }

  handlePhotoCapture() {
    this.gamepadService.aButtonChange.pipe(distinctUntilChanged()).subscribe(aButton => {
      if (aButton) {
        this.photoList.unshift(
          {
            date: new Date(),
            src: this.getCaptureUrl()
          }
        );
        this.activePhotoIndex = 0;
        this.opened = true;
      }
    });
  }

}