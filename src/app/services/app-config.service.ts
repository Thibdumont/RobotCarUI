import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private possibleHostIP: Array<string> = [
    "192.168.1.1",//softAP IP
    "192.168.1.32"//local network
  ];
  private currentIPIndex: number = 0;

  public port: string = "80";
  public webSocketPath = "/ws";

  public gamepadPollingInterval = 30;
  public uiPanelAnimationLength = 300;

  public carControlSendInterval = 80;
  public maxRobotSpeed = 250;
  public minRobotSpeed = 50;
  public maxSpeedChangeIncrement = 10;

  public delayBetweenPhoto = 1000;

  constructor() { }

  getNextHostIP(): string {
    if (++this.currentIPIndex >= this.possibleHostIP.length) {
      this.currentIPIndex = 0;
    }
    return this.getCurrentHostIP();
  }

  getCurrentHostIP(): string {
    return this.possibleHostIP[this.currentIPIndex];
  }
}
