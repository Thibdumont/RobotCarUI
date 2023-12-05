import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { HudInfoServiceService } from 'src/app/services/hud-info-service.service';
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

@Component({
  selector: 'robotcarui-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ left: '0' })),
      state('opened', style({ left: '100%' })),
      transition('* => *', animate('300ms 0ms ease')),
    ]),
  ],
})
export class InfoPanelComponent implements OnDestroy {
  opened: boolean = false;

  inactive$ = new Subject<void>();
  destroy$ = new Subject<void>();
  currentInfo: number = 0;

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService,
    public hudInfoService: HudInfoServiceService,
  ) {
    this.handleActiveState();
  }

  handleSubscribe() {
    this.handleNavigation();
  }

  handleNavigation() {
    this.gamepadService.rightPadChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((rightPad) => {
        if (rightPad) {
          this.uiPanelDirectorService.setActive(UiPanel.STREAM_WINDOW);
        }
      });
    this.gamepadService.upPadChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((upPad) => {
        if (upPad) {
          this.currentInfo = Math.max(this.currentInfo - 1, 0);
        }
      });
    this.gamepadService.downPadChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((downPad) => {
        if (downPad) {
          this.currentInfo = Math.min(
            this.currentInfo + 1,
            this.hudInfoService.infoList.length - 1,
          );
        }
      });
    this.gamepadService.aButtonChange
      .pipe(takeUntil(this.inactive$), distinctUntilChanged())
      .subscribe((aButton) => {
        if (aButton) {
          this.toggleHudVisibilityOfCurrentInfo();
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
      .getUiPanelSubject(UiPanel.INFO)
      .pipe(takeUntil(this.destroy$))
      .subscribe((newState) => {
        this.opened = newState;
        if (this.opened) {
          setTimeout(
            () => this.handleSubscribe(),
            this.appConfigService.uiPanelAnimationLength,
          );
        } else {
          this.inactive$.next();
        }
      });
  }

  toggleHudVisibilityOfCurrentInfo() {
    this.hudInfoService.toggleHudVisibility(this.currentInfo);
  }

  isActive(infoIndex: number) {
    return this.currentInfo === infoIndex;
  }

  ngOnDestroy(): void {
    this.inactive$.next();
    this.destroy$.next();
  }
}
