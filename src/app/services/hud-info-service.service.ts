import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotStateService } from './robot-state.service';

export interface HudInfoItem {
  label: string;
  value?: string | number;
  unit?: string;
  hudVisible?: boolean
}


@Injectable({
  providedIn: 'root'
})
export class HudInfoServiceService {

  hudInfoList$: Subject<Array<HudInfoItem>> = new Subject();
  infoList: Array<HudInfoItem> = [
    {
      label: 'Forward distance',
      unit: 'cm',
      hudVisible: true
    },
    {
      label: 'Battery voltage',
      unit: 'V',
      hudVisible: true
    },
    {
      label: 'Uno loop time',
      unit: 'ms'
    },
    {
      label: 'ESP loop time',
      unit: 'ms'
    }
  ];

  constructor(
    private robotStateService: RobotStateService
  ) {
    this.handleDataCollection();
  }

  handleDataCollection() {
    this.robotStateService.robotStateChange.subscribe(robotState => {
      this.infoList[0].value = robotState.radarDistance;
      this.infoList[1].value = robotState.batteryVoltage?.toPrecision(3);
      this.infoList[2].value = robotState.unoLoopDuration;
      this.infoList[3].value = robotState.espLoopDuration;
      this.hudInfoList$.next(this.infoList);
    });
  }

  toggleHudVisibility(index: number) {
    this.infoList[index].hudVisible = !this.infoList[index].hudVisible;
    this.hudInfoList$.next(this.infoList);
  }
}
