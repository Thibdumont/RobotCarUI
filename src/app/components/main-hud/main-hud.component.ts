import { RobotState } from 'src/app/core/robot-state';
import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-main-hud',
  templateUrl: './main-hud.component.html',
  styleUrls: ['./main-hud.component.scss']
})
export class MainHudComponent {
  robotState: RobotState = new RobotState();

  constructor(
    private robotStateService: RobotStateService
  ) {
    this.robotStateService.robotStateChange.subscribe(robotState => {
      this.robotState = robotState;
    });
  }


}
