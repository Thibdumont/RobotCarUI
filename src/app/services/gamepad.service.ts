import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class GamepadService {
  public gamepadConnectedChange = new Subject<boolean>();

  public leftStickXChange: Subject<number> = new Subject();
  public leftStickYChange: Subject<number> = new Subject();
  public rightStickXChange: Subject<number> = new Subject();
  public rightStickYChange: Subject<number> = new Subject();
  public leftStickButtonChange: Subject<number> = new Subject();
  public rightStickButtonChange: Subject<number> = new Subject();
  public rightTriggerChange: Subject<number> = new Subject();
  public leftTriggerChange: Subject<number> = new Subject();
  public leftShoulderChange: Subject<number> = new Subject();
  public rightShoulderChange: Subject<number> = new Subject();
  public aButtonChange: Subject<number> = new Subject();
  public bButtonChange: Subject<number> = new Subject();
  public xButtonChange: Subject<number> = new Subject();
  public yButtonChange: Subject<number> = new Subject();
  public leftPadChange: Subject<number> = new Subject();
  public rightPadChange: Subject<number> = new Subject();
  public upPadChange: Subject<number> = new Subject();
  public downPadChange: Subject<number> = new Subject();
  public viewButtonChange: Subject<number> = new Subject();
  public menuButtonChange: Subject<number> = new Subject();

  constructor(private appConfigService: AppConfigService) {}

  public initGamepad() {
    window.addEventListener('gamepadconnected', (event) => {
      console.log('A gamepad connected:', event.gamepad);
      this.gamepadConnectedChange.next(true);
      this.gamepadPollingLoop();
    });

    window.addEventListener('gamepaddisconnected', (event) => {
      console.log('A gamepad disconnected:', event.gamepad);
      this.gamepadConnectedChange.next(false);
    });
  }

  private gamepadPollingLoop() {
    interval(this.appConfigService.gamepadPollingInterval)
      .pipe()
      .subscribe(() => {
        var gamepads = navigator
          .getGamepads()
          .filter((gamepad) => gamepad !== null);

        for (const gamepad of gamepads) {
          this.leftStickXChange.next(this.getAxisValue(gamepad, 0));
          this.leftStickYChange.next(this.getAxisValue(gamepad, 1));
          this.rightStickXChange.next(this.getAxisValue(gamepad, 2));
          this.rightStickYChange.next(this.getAxisValue(gamepad, 3));
          this.leftStickButtonChange.next(this.getButtonValue(gamepad, 10));
          this.rightStickButtonChange.next(this.getButtonValue(gamepad, 11));
          this.leftTriggerChange.next(this.getButtonValue(gamepad, 6));
          this.rightTriggerChange.next(this.getButtonValue(gamepad, 7));
          this.leftShoulderChange.next(this.getButtonValue(gamepad, 4));
          this.rightShoulderChange.next(this.getButtonValue(gamepad, 5));
          this.aButtonChange.next(this.getButtonValue(gamepad, 0));
          this.bButtonChange.next(this.getButtonValue(gamepad, 1));
          this.xButtonChange.next(this.getButtonValue(gamepad, 2));
          this.yButtonChange.next(this.getButtonValue(gamepad, 3));
          this.leftPadChange.next(this.getButtonValue(gamepad, 14));
          this.rightPadChange.next(this.getButtonValue(gamepad, 15));
          this.upPadChange.next(this.getButtonValue(gamepad, 12));
          this.downPadChange.next(this.getButtonValue(gamepad, 13));
          this.viewButtonChange.next(this.getButtonValue(gamepad, 8));
          this.menuButtonChange.next(this.getButtonValue(gamepad, 9));
        }
      });
  }

  private getButtonValue(
    gamepad: Gamepad | null,
    buttonNumber: number,
  ): number {
    return gamepad === null ? 0 : gamepad.buttons[buttonNumber].value;
  }

  private getAxisValue(gamepad: Gamepad | null, axisNumber: number): number {
    return gamepad === null ? 0 : gamepad.axes[axisNumber];
  }
}
