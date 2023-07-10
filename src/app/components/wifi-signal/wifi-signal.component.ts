

import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component } from '@angular/core';

import { RobotStateService } from '../../services/robot-state.service';

@Component({
  selector: 'robotcarui-wifi-signal',
  templateUrl: './wifi-signal.component.html',
  styleUrls: ['./wifi-signal.component.scss']
})
export class WifiSignalComponent {
  wifiLevel: number = -1;

  constructor(
    private robotCommunicationService: RobotCommunicationService,
    private robotStateService: RobotStateService
  ) {
    this.robotStateService.robotStateChange.subscribe(robotState => {
      this.wifiLevel = this.getWifiLevel(robotState.wifiStrength);
    });

    this.robotCommunicationService.connectionStatusChange.subscribe(connectionStatus => {
      this.wifiLevel = connectionStatus ? 1 : -1;
    });
  }

  isBarActive(barNum: number) {
    return this.wifiLevel >= barNum;
  }

  getWifiLevel(wifiStrength: number): number {
    if (wifiStrength > -50) {
      return 3;
    }
    if (wifiStrength > -60) {
      return 2;
    }
    if (wifiStrength > -70) {
      return 1;
    }
    return 0;
  }
}
