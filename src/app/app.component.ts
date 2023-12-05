import { distinctUntilChanged } from 'rxjs';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component } from '@angular/core';

import { GamepadService } from './services/gamepad.service';
import { UiPanelDirectorService } from './services/ui-panel-director.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private gamepadService: GamepadService,
    private uiPanelDirectorService: UiPanelDirectorService,
    public robotCommunicationService: RobotCommunicationService,
  ) {
    this.gamepadService.initGamepad();
    this.uiPanelDirectorService.init();

    this.handleControl();
  }

  handleControl() {
    this.gamepadService.viewButtonChange
      .pipe(distinctUntilChanged())
      .subscribe((viewButton) => {
        if (viewButton) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.body.requestFullscreen();
          }
        }
      });
  }
}
