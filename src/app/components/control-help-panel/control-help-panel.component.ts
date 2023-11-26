import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ControlHelpService, ControlPanelItem } from 'src/app/services/control-help.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'robotcarui-control-help-panel',
  templateUrl: './control-help-panel.component.html',
  styleUrls: ['./control-help-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state('closed', style({ top: '0' })),
      state('opened', style({ top: '100%' })),
      transition('* => *', animate('300ms 0ms ease'))
    ])
  ]
})
export class ControlHelpPanelComponent implements OnDestroy {

  opened: boolean = false;

  destroy$ = new Subject<void>();

  controlList!: Array<ControlPanelItem>;
  commonControlList!: Array<ControlPanelItem>;

  constructor(
    private controlHelpService: ControlHelpService,
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService
  ) {
    this.handleActivation();
    this.commonControlList = this.controlHelpService.commonControlHelpList;
  }

  handleActivation() {
    this.gamepadService.menuButtonChange.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe(menuButton => {
      if (menuButton) {
        this.controlList = this.controlHelpService.getUiPanelControlList(this.uiPanelDirectorService.getActivePanel());
        this.opened = !this.opened;
      }
    });

    this.uiPanelDirectorService.uiPanelChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.opened = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
