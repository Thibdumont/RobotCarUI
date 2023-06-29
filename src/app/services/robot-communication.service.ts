import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotCommand } from '../core/robot-command';
import { RobotState } from '../core/robot-state';
import { AppConfigService } from './app-config.service';

const heartbeatMaxInterval = 3000;
const autoReconnectInterval = 3000;

@Injectable({
  providedIn: 'root'
})
export class RobotCommunicationService {

  private socket!: WebSocket;
  private lastHeartbeatTime: Date = new Date();
  private socketOpened: boolean = false;

  public connectionStatusChange: Subject<boolean> = new Subject();
  public robotStateChange: Subject<RobotState> = new Subject();
  public robotState!: RobotState;

  autoConnectLoopSub: any;

  constructor(
    private appConfigService: AppConfigService
  ) {
  }

  private connectToRobot() {
    if (!this.socketOpened && this.socket) {
      this.socket.close();
    }
    this.socket = new WebSocket(`ws://${this.appConfigService.getNextHostIP()}:${this.appConfigService.port}${this.appConfigService.webSocketPath}`);

    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
  }

  private onOpen() {
    console.log('Connected');
    this.socketOpened = true;
    this.connectionStatusChange.next(true);
  };

  private onClose() {
    this.socketOpened = false;
    console.log('Disconnected');
    this.connectionStatusChange.next(false);
  }

  private onMessage(event: any) {
    this.lastHeartbeatTime = new Date();
    let lastJsonObject = event.data.split('}');
    lastJsonObject = lastJsonObject[lastJsonObject.length - 2] + '}';
    if (lastJsonObject.substring(0, 1) === '{') {
      try {
        const json = JSON.parse(lastJsonObject);
        // console.log(json);
        this.robotState = new RobotState(json.maxSpeed, json.distance, json.unoLoopDuration, json.espLoopDuration, json.batteryVoltage, json.wifiStrength);
        this.robotStateChange.next(this.robotState);
      } catch (e) {
        console.log(e);
      }
    };

  }

  public sendCommand(command: RobotCommand) {
    if (this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(command));
    }
  }

  public autoConnectLoop() {
    this.autoConnectLoopSub = interval(autoReconnectInterval)
      .subscribe(() => {
        if (this.socketOpened && new Date().getTime() - this.lastHeartbeatTime.getTime() > heartbeatMaxInterval) {
          this.socketOpened = false;
          this.connectionStatusChange.next(false);
        }
        if (!this.socketOpened) {
          console.log('Connecting to robot...');
          this.connectToRobot();
        }
      });
  }
}
