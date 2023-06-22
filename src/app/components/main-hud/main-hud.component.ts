import { RobotState } from 'src/app/core/robot-state';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-main-hud',
  templateUrl: './main-hud.component.html',
  styleUrls: ['./main-hud.component.scss']
})
export class MainHudComponent {
  robotState: RobotState = new RobotState(0, 0, 0, 0, 0);

  constructor(
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      this.robotState = robotState;
    });
  }


}
