import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GamepadService {

  gamepadPollingRate: number = 30; //Every 30 ms
  gamepadSub: any;

  public leftStickXChange: Subject<number> = new Subject();
  public rightStickXChange: Subject<number> = new Subject();
  public rightTriggerChange: Subject<number> = new Subject();
  public leftTriggerChange: Subject<number> = new Subject();
  public leftShoulderChange: Subject<number> = new Subject();
  public rightShoulderChange: Subject<number> = new Subject();

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
      .subscribe(() => {
        var gamepads = navigator.getGamepads().filter(gamepad => gamepad !== null);

        for (const gamepad of gamepads) {
          this.leftTriggerChange.next(this.getLeftTrigger(gamepad));
          this.rightTriggerChange.next(this.getRightTrigger(gamepad));
          this.leftStickXChange.next(this.getLeftStickX(gamepad));
          this.rightStickXChange.next(this.getRightStickX(gamepad));
          this.leftShoulderChange.next(this.getLeftShoulder(gamepad));
          this.rightShoulderChange.next(this.getRightShoulder(gamepad));
        }
      });
  }

  private getLeftTrigger(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad.buttons[6].value;
  }

  private getRightTrigger(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad.buttons[7].value;
  }

  private getLeftStickX(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.axes[0];
  }

  private getRightStickX(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.axes[2];
  }

  private getLeftShoulder(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.buttons[4].value;
  }

  private getRightShoulder(gamepad: Gamepad | null): number {
    return gamepad === null ?
      0 :
      gamepad?.buttons[5].value;
  }

}
