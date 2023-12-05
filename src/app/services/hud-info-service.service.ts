import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotCommunicationService } from './robot-communication.service';
import { RobotStateService } from './robot-state.service';

export interface HudInfoItem {
  label: string;
  jsonProp: string;
  value?: string | number;
  unit?: string;
  hudVisible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HudInfoServiceService {
  hudInfoList$: Subject<Array<HudInfoItem>> = new Subject();
  infoList: Array<HudInfoItem> = [
    {
      label: 'Forward distance',
      jsonProp: 'hudRadarDistance',
      unit: 'cm',
      hudVisible: true,
    },
    {
      label: 'Battery voltage',
      jsonProp: 'hudBatteryVoltage',
      unit: 'V',
      hudVisible: true,
    },
    {
      label: 'On ground',
      jsonProp: 'hudOnGround',
      unit: '',
    },
    {
      label: 'Uno loop time',
      jsonProp: 'hudUnoLoopTime',
      unit: 'ms',
    },
    {
      label: 'ESP loop time',
      jsonProp: 'hudEspLoopTime',
      unit: 'ms',
    },
  ];

  constructor(
    private robotStateService: RobotStateService,
    private robotCommunicationService: RobotCommunicationService,
  ) {
    this.handleDataCollection();
    this.initHudInfoState();
  }

  initHudInfoState() {
    this.robotStateService.robotStateFirstSync$.subscribe((robotState) => {
      this.infoList[0].hudVisible = robotState.hudRadarDistance === 1;
      this.infoList[1].hudVisible = robotState.hudBatteryVoltage === 1;
      this.infoList[2].hudVisible = robotState.hudOnGround === 1;
      this.infoList[3].hudVisible = robotState.hudUnoLoopTime === 1;
      this.infoList[4].hudVisible = robotState.hudEspLoopTime === 1;
    });
  }

  handleDataCollection() {
    this.robotStateService.robotStateChange.subscribe((robotState) => {
      this.infoList[0].value = robotState.radarDistance;
      this.infoList[1].value = robotState.batteryVoltage?.toPrecision(3);
      this.infoList[2].value = robotState.onGround === 1 ? 'true' : 'false';
      this.infoList[3].value = robotState.unoLoopDuration;
      this.infoList[4].value = robotState.espLoopDuration;
      this.hudInfoList$.next(this.infoList);
    });
  }

  toggleHudVisibility(index: number) {
    this.infoList[index].hudVisible = !this.infoList[index].hudVisible;
    this.hudInfoList$.next(this.infoList);
    this.robotCommunicationService.sendCommand(
      JSON.parse(
        `{ "${this.infoList[index].jsonProp}": ${
          this.infoList[index].hudVisible ? 1 : 0
        } }`,
      ),
    );
  }
}
