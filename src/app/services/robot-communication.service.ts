import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotCommand } from '../core/robot-command';
import { RobotState } from '../core/robot-state';
import { AppConfigService } from './app-config.service';

const heartbeatMaxInterval = 3000;

@Injectable({
  providedIn: 'root'
})
export class RobotCommunicationService {

  private socket!: WebSocket;
  private lastHeartbeatTime: Date = new Date();
  private socketOpened: boolean = false;
  public robotStateChange: Subject<RobotState> = new Subject();
  public robotState!: RobotState;

  autoConnectLoopSub: any;

  constructor(
    private appConfigService: AppConfigService
  ) {
  }

  private connectToRobot() {
    this.socket = new WebSocket(`ws://${this.appConfigService.hostname}:${this.appConfigService.port}${this.appConfigService.webSocketPath}`);

    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  private onOpen() {
    this.socketOpened = true;
  };

  private onClose() {
    this.socketOpened = false;
  }

  private onError() {
    this.socketOpened = false;
  }

  private onMessage(event: any) {
    this.lastHeartbeatTime = new Date();
    let lastJsonObject = event.data.split('}');
    lastJsonObject = lastJsonObject[lastJsonObject.length - 2] + '}';
    if (lastJsonObject.substring(0, 1) === '{') {
      try {
        const json = JSON.parse(lastJsonObject);
        console.log(json);
        this.robotState = new RobotState(json.speed, json.distance, json.loopDuration);
        this.robotStateChange.next(this.robotState);
      } catch (e) {
        console.log(e);
      }
    };

  }

  public sendCommand(command: RobotCommand) {
    this.socket.send(JSON.stringify(command));
  }

  public autoConnectLoop() {
    this.autoConnectLoopSub = interval(1000)
      .subscribe(() => {
        if (new Date().getTime() - this.lastHeartbeatTime.getTime() > heartbeatMaxInterval) {
          this.socketOpened = false;
          console.log('Socket opened : ', this.socketOpened);
        }
        if (!this.socketOpened) {
          console.log('Connecting to robot...');
          this.connectToRobot();
        }
      });
  }
}
