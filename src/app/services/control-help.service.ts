
import { Injectable } from '@angular/core';

import { UiPanel } from './ui-panel-director.service';

export interface ControlPanelItem {
  button: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class ControlHelpService {

  commonControlHelpList: Array<ControlPanelItem> = [
    { button: 'Start button', label: 'Open/close help' },
    { button: 'View button', label: 'Enter/exit fullscreen' }
  ];

  uiPanelControlHelpMap: Map<UiPanel, Array<ControlPanelItem>> =
    new Map([
      [UiPanel.PHOTO, [
        { button: 'Left Dpad', label: 'Show previous photo / Return to main view' },
        { button: 'Right Dpad', label: 'Show next photo' },
        { button: 'B', label: 'Delete photo' }
      ]],
      [UiPanel.CAMERA_CONTROL, [
        { button: 'Up Dpad', label: 'Go to previous parameter / Return to main view' },
        { button: 'Down Dpad', label: 'Go to next parameter' },
        { button: 'Left Dpad', label: 'Decrease current value' },
        { button: 'Right Dpad', label: 'Increase current value' },
        { button: 'B', label: 'Return to main view' }
      ]],
      [UiPanel.CAR_SETTING, [
        { button: 'Down Dpad', label: 'Go to next parameter / Return to main view' },
        { button: 'Up Dpad', label: 'Go to previous parameter' },
        { button: 'Left Dpad', label: 'Decrease current value' },
        { button: 'Right Dpad', label: 'Increase current value' },
        { button: 'B', label: 'Return to main view' }
      ]],
      [UiPanel.STREAM_WINDOW, [
        { button: 'LT', label: 'Throttle down' },
        { button: 'RT', label: 'Throttle up' },
        { button: 'LB', label: 'Decrease max speed' },
        { button: 'RB', label: 'Increase max speed' },
        { button: 'Y', label: 'Hold to boost' },
        { button: 'Left joystick', label: 'Turn' },
        { button: 'Right joystick', label: 'Control head position' },
        { button: 'Right joystick button', label: 'Center head position' },
        { button: 'X', label: 'Take photo' },
        { button: 'Left Dpad', label: 'Show info HUD visibility panel' },
        { button: 'Right Dpad', label: 'Show photo manager' },
        { button: 'Down Dpad', label: 'Show camera control panel' }
      ]],
      [UiPanel.INFO, [
        { button: 'Right Dpad', label: 'Return to main view' },
        { button: 'Up Dpad', label: 'Go to previous info' },
        { button: 'Down Dpad', label: 'Go to next info' },
        { button: 'A', label: 'Toggle info HUD visibility' },
        { button: 'B', label: 'Return to main view' }
      ]]
    ]);

  constructor() { }

  getUiPanelControlList(uiPanel: UiPanel): Array<ControlPanelItem> {
    return this.uiPanelControlHelpMap.get(uiPanel) as Array<ControlPanelItem>;
  }

}
