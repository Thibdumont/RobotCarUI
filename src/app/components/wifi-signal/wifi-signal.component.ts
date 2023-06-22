import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-wifi-signal',
  templateUrl: './wifi-signal.component.html',
  styleUrls: ['./wifi-signal.component.scss']
})
export class WifiSignalComponent {
  wifiStrength: number = -1;

  constructor(
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      this.wifiStrength = robotState.wifiStrength;
    });
  }

  isBarActive(barNum: number) {
    return this.wifiStrength >= barNum;
  }
}
