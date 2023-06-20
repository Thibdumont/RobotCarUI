import { interval } from 'rxjs';

import { Component } from '@angular/core';

import { RobotCommunicationService } from '../../services/robot-communication.service';

const batteryEmptyThreshold = 7;
const batteryMaxVoltage = 8.4;
const batteryVoltageRange = batteryMaxVoltage - batteryEmptyThreshold;
const maxVoltageFifoLength = 1000;
const batteryLifeMeasureDelay = 5000;


@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss']
})
export class BatteryIndicatorComponent {
  batteryDurationUpdateSub: any;

  voltageOneCycleAgo = 0;
  voltageFifo = new Array();

  batteryPercent: number = 0;
  batteryDuration: string = '';

  averageVoltage: number = 0;

  constructor(
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      this.addToVoltageFifo(robotState.batteryVoltage);
      this.updateAverageVoltage();
    });

    this.batteryDurationUpdateSub = interval(batteryLifeMeasureDelay).subscribe(() => {
      this.updateBatteryPercentage();
      this.updateBatteryDuration();
    });
  }

  addToVoltageFifo(voltage: number) {
    this.voltageFifo.push(voltage);
    if (this.voltageFifo.length > maxVoltageFifoLength) {
      this.voltageFifo.shift();
    }
  }

  updateAverageVoltage() {
    this.averageVoltage = this.average(this.voltageFifo);
  }

  average(array: Array<number>): number {
    return array.length > 1 ? array.reduce((a, b) => a + b) / array.length : 0;
  }

  getBatteryStep(): string {
    if (this.batteryPercent < 20) {
      return 'low';
    } else if (this.batteryPercent < 60) {
      return 'mid';
    }
    return '';
  }

  updateBatteryDuration() {
    if (this.averageVoltage > 0 && this.voltageOneCycleAgo > this.averageVoltage) {
      let voltageConsumedInOneCycle = (this.voltageOneCycleAgo - this.averageVoltage) / batteryLifeMeasureDelay;
      let minCountBeforeBatteryEmpty = (batteryVoltageRange / (voltageConsumedInOneCycle * 1000 * 60));
      this.batteryDuration = '';

      if (minCountBeforeBatteryEmpty > 60) {
        this.batteryDuration += `${Math.round(minCountBeforeBatteryEmpty / 60)}h${Math.round(minCountBeforeBatteryEmpty % 60)}m`;
      } else {
        this.batteryDuration += `${Math.round(minCountBeforeBatteryEmpty)}m`;
      }
    }
    this.voltageOneCycleAgo = this.averageVoltage;
  }

  updateBatteryPercentage() {
    this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((this.averageVoltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
  }

}
