import { distinctUntilChanged } from 'rxjs';
import { GamepadService } from 'src/app/services/gamepad.service';

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

  constructor(
    private gamepadService: GamepadService,
  ) {
    this.gamepadService.menuButtonChange.pipe(distinctUntilChanged()).subscribe(yButton => {
      if (yButton) {
        this.opened = !this.opened;
      }
    });
  }

  getControlList(): Array<ControlPanelItem> {
    return [
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
        button: 'A',
        label: 'Take photo'
      },
      {
        button: 'Y',
        label: 'Show info panel'
      },
      {
        button: 'Right Dpad',
        label: 'Show photo manager'
      },
      {
        button: 'Menu button',
        label: 'Show control help panel'
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
        button: 'View button',
        label: 'Fullscreen'
      }
    ]
  }

}
