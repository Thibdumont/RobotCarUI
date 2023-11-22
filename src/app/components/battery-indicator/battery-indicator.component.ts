import { Subject, takeUntil } from 'rxjs';
import { GamepadService } from 'src/app/services/gamepad.service';
import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component, OnDestroy } from '@angular/core';

const lowBatteryLevelThreshold = 20;
const batteryEmptyThreshold = 7.0;
const batteryFullThreshold = 8.4;
const batteryVoltageRange = batteryFullThreshold - batteryEmptyThreshold;
const voltageInfoIntervalReception = 100; //We receive data from esp once every 100ms (must be aligned with the ESP sending interval to be accurate)

const voltageFifoMaxLength = 30000 / voltageInfoIntervalReception; //We want approx a one minute buffer to be accurate and have a realistic estimation

@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss']
})
export class BatteryIndicatorComponent implements OnDestroy {
  batteryPercent!: number;
  voltageFifo!: Array<number>;
  averageVoltageFifo!: Array<number>;

  maxVoltage!: number;
  lowThreshold!: number;

  rightTriggerActive: boolean = false;
  leftTriggerActive: boolean = false;
  rightStickActive: boolean = false;
  leftStickActive: boolean = false;

  destroy$ = new Subject<void>();

  constructor(
    private robotStateService: RobotStateService,
    private gamepadService: GamepadService
  ) {
    this.init();

    this.robotStateService.robotStateChange.pipe(takeUntil(this.destroy$)).subscribe(robotState => {
      this.processNewMeasure(robotState.batteryVoltage);
    });

    this.robotStateService.robotStateFirstSync$.pipe(takeUntil(this.destroy$)).subscribe(robotState => {
      this.init();
      this.maxVoltage = robotState.batteryVoltage;
    });
  }

  init() {
    this.voltageFifo = new Array();
    this.averageVoltageFifo = new Array();
    this.maxVoltage = batteryFullThreshold;
    this.lowThreshold = lowBatteryLevelThreshold;
    this.batteryPercent = 0;
  }

  processNewMeasure(batteryVoltage: number): void {
    this.addToFifo(this.voltageFifo, batteryVoltage);
    this.maxVoltage = this.average(this.voltageFifo);
    this.updateBatteryPercentage();
  }

  addToFifo(fifo: Array<number>, voltage: number): void {
    if (voltage > 0) {
      fifo.push(voltage);
      if (fifo.length > voltageFifoMaxLength) {
        fifo.shift();
      }
    }
  }

  average(array: Array<number>): number {
    return array.length >= 1 ? array.reduce((a, b) => a + b) / array.length : 0;
  }

  updateBatteryPercentage(): void {
    this.batteryPercent = Math.round(Math.min(100, Math.max(0, ((this.maxVoltage - batteryEmptyThreshold) / batteryVoltageRange) * 100)));
  }

  getBatteryStep(): string {
    if (this.batteryPercent < lowBatteryLevelThreshold) {
      return 'low';
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
