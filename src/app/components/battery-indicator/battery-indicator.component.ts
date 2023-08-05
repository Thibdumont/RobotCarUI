import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component } from '@angular/core';

const lowBatteryLevelThreshold = 20;
const batteryEmptyThreshold = 7.8;
const batteryFullThreshold = 8.4;
const batteryVoltageRange = batteryFullThreshold - batteryEmptyThreshold;
const voltageInfoIntervalReception = 100; //We receive data from esp once every 100ms (must be aligned with the ESP sending interval to be accurate)

const voltageFifoMaxLength = 30000 / voltageInfoIntervalReception; //We want approx a one minute buffer to be accurate and have a realistic estimation




@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss']
})
export class BatteryIndicatorComponent {
  batteryPercent: number = 0;
  voltageFifo = new Array();
  averageVoltageFifo = new Array();

  maxVoltage: number = batteryFullThreshold;

  constructor(
    private robotStateService: RobotStateService
  ) {
    this.robotStateService.robotStateChange.subscribe(robotState => {
      this.addToFifo(this.voltageFifo, robotState.batteryVoltage);
      this.addToFifo(this.averageVoltageFifo, this.average(this.voltageFifo));
      this.maxVoltage = Math.min(...this.averageVoltageFifo);

      this.updateBatteryPercentage();
    });
  }

  addToFifo(fifo: Array<number>, voltage: number) {
    if (voltage > 0) {
      fifo.push(voltage);
      if (fifo.length > voltageFifoMaxLength) {
        fifo.shift();
      }
    }
  }
  getBatteryStep(): string {
    if (this.batteryPercent < lowBatteryLevelThreshold) {
      return 'low';
    }
    return '';
  }

  average(array: Array<number>): number {
    return array.length >= 1 ? array.reduce((a, b) => a + b) / array.length : 0;
  }

  updateBatteryPercentage() {
    this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((this.maxVoltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
  }

}
