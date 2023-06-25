import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  public hostname: string = "192.168.1.32";
  public port: string = "80";
  public webSocketPath = "/ws";

  public gamepadPollingInterval = 30;
  public uiPanelAnimationLength = 300;

  public maxRobotSpeed = 200;
  public minRobotSpeed = 50;
  public maxSpeedChangeIncrement = 10;

  public streamWindowDelayBeforeShowingNewPhoto = 1000;
  public photoPanelDelayBeforeShowingNewPhoto = 500;

  constructor() { }
}
