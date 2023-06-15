import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-main-hud',
  templateUrl: './main-hud.component.html',
  styleUrls: ['./main-hud.component.scss']
})
export class MainHudComponent {
  radarDistance: number = 0;
  maxSpeed: number = 0;

  constructor(
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      this.radarDistance = robotState.radarDistance;
      this.maxSpeed = robotState.maxSpeed;
    });
  }


}
