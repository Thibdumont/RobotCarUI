import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GamepadService {

  pollingLoop: any;
  gamepadPollingRate: number = 30; //Every 30 ms
  gamepadSub: any;
  directionChange: Subject<number> = new Subject();
  throttleChange: Subject<number> = new Subject();
  headPositionChange: Subject<number> = new Subject();

  constructor() {
  }

  public initGamepad() {
    window.addEventListener("gamepadconnected", (event) => {
      console.log("A gamepad connected:", event.gamepad);
      this.gamepadPollingLoop();
    });

    window.addEventListener("gamepaddisconnected", (event) => {
      console.log("A gamepad disconnected:", event.gamepad);
    });
  }

  private gamepadPollingLoop() {
    this.gamepadSub = interval(this.gamepadPollingRate)
      .pipe()
      .subscribe(data => {
        var gamepads = navigator.getGamepads().filter(gamepad => gamepad !== null);

        for (const gamepad of gamepads) {
          this.directionChange.next(this.getDirection(gamepad));
          this.throttleChange.next(this.getThrottle(gamepad));
          this.headPositionChange.next(this.getHeadPosition(gamepad));
        }
      });
  }

  public getThrottle(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad.buttons[6].value > 0 ? -gamepad.buttons[6].value : gamepad.buttons[7].value;
  }

  public getDirection(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.axes[0];
  }

  public getHeadPosition(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.axes[2];
  }

  public getDirectionChange(): Subject<number> {
    return this.directionChange;
  }

  public getThrottleChange(): Subject<number> {
    return this.throttleChange;
  }

  public getHeadPositionChange(): Subject<number> {
    return this.headPositionChange;
  }
}
