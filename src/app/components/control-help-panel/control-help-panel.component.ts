import { distinctUntilChanged, Subscription } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GamepadService } from 'src/app/services/gamepad.service';
import { UiPanelDirectorService } from 'src/app/services/ui-panel-director.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

export interface ControlPanelItem {
  button: string;
  label: string;
}

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
export class ControlHelpPanelComponent {

  opened: boolean = false;
  downPadSub!: Subscription;

  controlList: Array<ControlPanelItem> = [
    {
      button: 'LT',
      label: 'Throttle down'
    },
    {
      button: 'RT',
      label: 'Throttle up'
    },
    {
      button: 'LB',
      label: 'Decrease max speed'
    },
    {
      button: 'RB',
      label: 'Increase max speed'
    },
    {
      button: 'Y',
      label: 'Hold to boost'
    },
    {
      button: 'Left joystick',
      label: 'Turn'
    },
    {
      button: 'Right joystick',
      label: 'Control head position'
    },
    {
      button: 'Right joystick button',
      label: 'Center head position'
    },
    {
      button: 'A',
      label: 'Take photo'
    },
    {
      button: 'B',
      label: 'Delete photo'
    },
    {
      button: 'Left Dpad',
      label: 'Show info panel'
    },
    {
      button: 'Right Dpad',
      label: 'Show photo manager'
    },
    {
      button: 'Up Dpad button',
      label: 'Show control help panel'
    },
    {
      button: 'Down Dpad button',
      label: 'Show camera control panel'
    },
    {
      button: 'View button',
      label: 'Fullscreen'
    }
  ];

  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    private appConfigService: AppConfigService
  ) {
    this.handleActiveState();
  }

  handleNavigation() {
    this.downPadSub = this.gamepadService.downPadChange.pipe(distinctUntilChanged()).subscribe(downPad => {
      if (downPad) {
        this.uiPanelDirectorService.controlHelpPanelActiveStateChange.next(false);
        this.uiPanelDirectorService.streamWindowActiveStateChange.next(true);
      }
    });
  }

  unhandleNavigation() {
    this.downPadSub.unsubscribe();
  }

  handleActiveState() {
    this.uiPanelDirectorService.controlHelpPanelActiveStateChange.subscribe(newState => {
      this.opened = newState;
      if (this.opened) {
        setTimeout(() => this.handleNavigation(), this.appConfigService.uiPanelAnimationLength);
      } else {
        this.unhandleNavigation();
      }
    });
  }
}
