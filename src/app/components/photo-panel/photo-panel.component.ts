import { distinctUntilChanged, Subject, takeUntil, throttleTime } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { UiPanel, UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

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

  inactive$ = new Subject<void>();

  constructor(
    private gamepadService: GamepadService,
    private appConfigService: AppConfigService,
    private uiPanelDirectorService: UiPanelDirectorService
  ) {
    this.handleActiveState();
    this.handlePhotoCapture();
  }

  handleNavigation() {
    this.gamepadService.leftPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(leftPad => {
      if (leftPad) {
        if (this.activePhotoIndex <= 0) {
          this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
        } else {
          this.activePhotoIndex--;
        }
      }
    });

    this.gamepadService.rightPadChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(rightPad => {
      if (rightPad && this.activePhotoIndex + 1 < this.photoList.length) {
        this.activePhotoIndex++;
      }
    });

    this.gamepadService.bButtonChange.pipe(takeUntil(this.inactive$), distinctUntilChanged()).subscribe(bButton => {
      if (bButton && this.photoList.length >= 0) {
        const removedPhotoIndex = this.activePhotoIndex;
        this.photoList.splice(removedPhotoIndex, 1);
        if (this.activePhotoIndex >= this.photoList.length) {
          this.activePhotoIndex--;
        }
      }
    });
  }

  handleActiveState() {
    this.uiPanelDirectorService.getUiPanelSubject(UiPanel.PHOTO).subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.inactive$.next();
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
    this.gamepadService.xButtonChange.pipe(distinctUntilChanged(), throttleTime(500)).subscribe(xButton => {
      if (xButton) {
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