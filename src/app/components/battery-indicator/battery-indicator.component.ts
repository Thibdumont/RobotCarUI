import { interval } from 'rxjs';

import { Component } from '@angular/core';

import { RobotCommunicationService } from '../../services/robot-communication.service';

const batteryEmptyThreshold = 7.5;
const batteryFullThreshold = 8.3;
const batteryVoltageRange = batteryFullThreshold - batteryEmptyThreshold;
const voltageFifoMaxLength = 1000;
const voltagePerCycleFifoMaxLength = 10;
const batteryLifeMeasureDelay = 5000;


@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss']
})
export class BatteryIndicatorComponent {
  batteryDurationUpdateSub: any;

  batteryPercent: number = 0;
  batteryDuration: string = '';

  voltageFifo = new Array();
  voltagePerCycleFifo = new Array();
  averageVoltageOneCycleAgo = 0;
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
    if (this.voltageFifo.length > voltageFifoMaxLength) {
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
    if (this.averageVoltage > 0 && this.averageVoltageOneCycleAgo > this.averageVoltage) {
      this.addToVoltagePerCycleFifo((this.averageVoltageOneCycleAgo - this.averageVoltage) / batteryLifeMeasureDelay);
      let voltageConsumedInOneCycle = this.average(this.voltagePerCycleFifo);

      let minuteCountBeforeBatteryEmpty = (batteryVoltageRange / (voltageConsumedInOneCycle * 1000 * 60));
      this.batteryDuration = '';

      if (minuteCountBeforeBatteryEmpty > 60) {
        this.batteryDuration += `${Math.round(minuteCountBeforeBatteryEmpty / 60)}h${Math.round(minuteCountBeforeBatteryEmpty % 60)}m`;
      } else {
        this.batteryDuration += `${Math.round(minuteCountBeforeBatteryEmpty)}m`;
      }
    }
    this.averageVoltageOneCycleAgo = this.averageVoltage;
  }

  addToVoltagePerCycleFifo(voltage: number) {
    this.voltagePerCycleFifo.push(voltage);
    if (this.voltagePerCycleFifo.length > voltagePerCycleFifoMaxLength) {
      this.voltagePerCycleFifo.shift();
    }
  }

  updateBatteryPercentage() {
    if (this.averageVoltageOneCycleAgo > this.averageVoltage) {
      this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((this.averageVoltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
    }
  }

}
