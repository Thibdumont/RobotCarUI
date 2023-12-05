import { Subject, takeUntil } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component, OnDestroy } from '@angular/core';

const voltageFifoMaxLength = 100; // We keep the last 100 measures to make an average and have the most accurate estimation of the battery life
const minMeasureCount = 50; // Measures required to display the battery level (we don't want to have a bad first estimation)

@Component({
  selector: 'robotcarui-battery-indicator',
  templateUrl: './battery-indicator.component.html',
  styleUrls: ['./battery-indicator.component.scss'],
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
    private appConfigService: AppConfigService,
  ) {
    this.init();

    this.robotStateService.robotStateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((robotState) => {
        this.processNewMeasure(robotState.batteryVoltage);
      });

    this.robotStateService.robotStateFirstSync$
      .pipe(takeUntil(this.destroy$))
      .subscribe((robotState) => {
        this.init();
        this.maxVoltage = robotState.batteryVoltage;
      });
  }

  init() {
    this.voltageFifo = new Array();
    this.averageVoltageFifo = new Array();
    this.maxVoltage = this.appConfigService.batteryFullThreshold;
    this.lowThreshold = this.appConfigService.lowBatteryLevelThreshold;
    this.batteryPercent = 0;
  }

  processNewMeasure(batteryVoltage: number): void {
    this.addToFifo(this.voltageFifo, batteryVoltage);
    this.maxVoltage = Math.min(this.maxVoltage, this.average(this.voltageFifo));
    if (this.canDisplayBatteryLevel()) {
      this.updateBatteryPercentage();
    }
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
    const batteryVoltageRange =
      this.appConfigService.batteryFullThreshold -
      this.appConfigService.batteryEmptyThreshold;
    this.batteryPercent = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          ((this.maxVoltage - this.appConfigService.batteryEmptyThreshold) /
            batteryVoltageRange) *
            100,
        ),
      ),
    );
  }

  getBatteryStep(): string {
    if (
      this.batteryPercent < this.appConfigService.lowBatteryLevelThreshold &&
      this.canDisplayBatteryLevel()
    ) {
      return 'low';
    }
    return '';
  }

  canDisplayBatteryLevel(): boolean {
    return this.voltageFifo.length >= minMeasureCount;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
