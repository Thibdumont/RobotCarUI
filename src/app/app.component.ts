import { Component } from '@angular/core';

import { GamepadService } from './services/gamepad.service';
import { RobotCommunicationService } from './services/robot-communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private gamepadService: GamepadService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.gamepadService.initGamepad();
    this.robotCommunicationService.autoConnectLoop();
  }
}
