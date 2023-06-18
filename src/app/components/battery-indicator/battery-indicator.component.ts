import { Component } from '@angular/core';

import { RobotCommunicationService } from '../../services/robot-communication.service';

const batteryEmptyThreshold = 7;
const batteryMaxVoltage = 8.4;
const batteryVoltageRange = batteryMaxVoltage - batteryEmptyThreshold;
const maxRealisticMinCountForBatteryDuration = 60000;
const maxVoltageFifoLength = 1000;

@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss']
})
export class BatteryIndicatorComponent {
  batteryLifeMeasureDelay = 5000;
  voltageOneCycleAgo = 0;
  voltage = 0;
  voltageFifo = new Array();
  batteryPercent: number = 0;
  batteryDuration: string = '';

  constructor(
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.robotCommunicationService.robotStateChange.subscribe(robotState => {
      let voltage = this.getMaxVoltageFromFifo(robotState.batteryVoltage);
      this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((voltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
      this.updateBatteryDuration();
    });
  }

  getMaxVoltageFromFifo(voltage: number): number {
    this.voltageFifo.push(voltage);
    if (this.voltageFifo.length > maxVoltageFifoLength) {
      this.voltageFifo.shift();
    }
    return Math.max(...this.voltageFifo);
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
    const voltage = this.average(this.voltageFifo);
    if (voltage > 0 && this.voltageOneCycleAgo > voltage) {
      let voltageConsumedInOneCycle = (this.voltageOneCycleAgo - voltage) / this.batteryLifeMeasureDelay;
      let minCountBeforeBatteryEmpty = (batteryVoltageRange / (voltageConsumedInOneCycle * 1000 * 60));
      this.batteryDuration = '';

      if (minCountBeforeBatteryEmpty < maxRealisticMinCountForBatteryDuration) {
        if (minCountBeforeBatteryEmpty > 60) {
          this.batteryDuration += `${Math.round(minCountBeforeBatteryEmpty / 60)}h${Math.round(minCountBeforeBatteryEmpty % 60)}m`;
        } else {
          this.batteryDuration += `${Math.round(minCountBeforeBatteryEmpty)}m`;
        }
      }
    }
    this.voltageOneCycleAgo = voltage;
    // On augmente d'une seconde à chaque mesure, jusqu'à un max de 60sec
    if (this.batteryLifeMeasureDelay < 60000) {
      this.batteryLifeMeasureDelay += 1000;
    }
  }

  average(array: Array<number>): number {
    return array.length > 1 ? array.reduce((a, b) => a + b) / array.length : 0;
  }
}
