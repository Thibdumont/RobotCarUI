import { distinctUntilChanged } from 'rxjs';

import { Component } from '@angular/core';

import { GamepadService } from './services/gamepad.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private gamepadService: GamepadService
  ) {
    this.gamepadService.initGamepad();

    this.handleControl();
  }

  handleControl() {
    this.gamepadService.viewButtonChange.pipe(distinctUntilChanged()).subscribe(viewButton => {
      if (viewButton) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        else {
          document.body.requestFullscreen();
        }
      }
    });
  }
}
