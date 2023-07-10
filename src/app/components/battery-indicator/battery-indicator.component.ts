import { interval } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component } from '@angular/core';



const batteryEmptyThreshold = 7.4;
const batteryFullThreshold = 8.4;
const batteryVoltageRange = batteryFullThreshold - batteryEmptyThreshold;
const batteryLifeMeasureDelay = 3000;
const voltageInfoIntervalReception = 100; //We receive data from esp once every 100ms (must be aligned with the ESP sending interval to be accurate)
const voltageFifoMaxLength = 60000 / voltageInfoIntervalReception; //We want approx a one minute buffer to be accurate and have a realistic estimation
const voltagePerCycleFifoMaxLength = 60000 / voltageInfoIntervalReception;


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
    private robotStateService: RobotStateService,
    private appConfigService: AppConfigService
  ) {
    this.robotStateService.robotStateChange.subscribe(robotState => {
      this.addToVoltageFifo(robotState.batteryVoltage);
      this.updateAverageVoltage();

      if (this.averageVoltageOneCycleAgo === 0) {
        this.averageVoltageOneCycleAgo = this.averageVoltage;
      }
      this.addToVoltagePerCycleFifo(this.averageVoltageOneCycleAgo - this.averageVoltage);
      this.averageVoltageOneCycleAgo = this.averageVoltage;
    });

    this.batteryDurationUpdateSub = interval(batteryLifeMeasureDelay).subscribe(() => {
      this.updateBatteryPercentage();
      this.updateBatteryDuration();
    });
  }

  addToVoltageFifo(voltage: number) {
    if (voltage > 0) {
      this.voltageFifo.push(voltage);
      if (this.voltageFifo.length > voltageFifoMaxLength) {
        this.voltageFifo.shift();
      }
    }
  }

  updateAverageVoltage() {
    this.averageVoltage = this.average(this.voltageFifo);
  }

  average(array: Array<number>): number {
    return array.length >= 1 ? array.reduce((a, b) => a + b) / array.length : 0;
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
    let voltageConsumedInOneMillis = this.average(this.voltagePerCycleFifo) / batteryLifeMeasureDelay;
    if (voltageConsumedInOneMillis > 0) {
      let minuteCountBeforeBatteryEmpty = (this.averageVoltage - batteryEmptyThreshold) / (voltageConsumedInOneMillis * 1000 * 60);
      console.log('voltageConsumedInOneMillis', voltageConsumedInOneMillis, 'minuteCountBeforeBatteryEmpty', minuteCountBeforeBatteryEmpty, 'averageVoltage', this.averageVoltage, "voltageConsumedPerMin", (voltageConsumedInOneMillis * 1000 * 60));
      this.batteryDuration = '';

      if (minuteCountBeforeBatteryEmpty > 60) {
        this.batteryDuration += `${Math.round(minuteCountBeforeBatteryEmpty / 60)}h${Math.round(minuteCountBeforeBatteryEmpty % 60)}m`;
      } else {
        this.batteryDuration += `${Math.round(minuteCountBeforeBatteryEmpty)}m`;
      }
    }
  }

  addToVoltagePerCycleFifo(voltage: number) {
    this.voltagePerCycleFifo.push(voltage);
    if (this.voltagePerCycleFifo.length > voltagePerCycleFifoMaxLength) {
      this.voltagePerCycleFifo.shift();
    }
  }

  updateBatteryPercentage() {
    this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((this.averageVoltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
  }

}
