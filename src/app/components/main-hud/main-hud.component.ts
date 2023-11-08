import { Subject, takeUntil } from 'rxjs';
import { RobotState } from 'src/app/core/robot-state';
import { RobotStateService } from 'src/app/services/robot-state.service';

import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'robotcarui-main-hud',
  templateUrl: './main-hud.component.html',
  styleUrls: ['./main-hud.component.scss']
})
export class MainHudComponent implements OnDestroy {
  robotState: RobotState = new RobotState();
  destroy$ = new Subject<void>();

  constructor(
    private robotStateService: RobotStateService
  ) {
    this.robotStateService.robotStateChange.pipe(takeUntil(this.destroy$)).subscribe(robotState => {
      this.robotState = robotState;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
