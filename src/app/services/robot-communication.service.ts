import { interval, Subject, timer } from 'rxjs';

import { Injectable } from '@angular/core';

import { RobotCommand } from '../core/robot-command';
import { AppConfigService } from './app-config.service';
import { RobotStateService } from './robot-state.service';

const heartbeatMaxInterval = 3000;
const autoReconnectInterval = 3000;
const sendDataInterval = 100;

@Injectable({
  providedIn: 'root'
})
export class RobotCommunicationService {

  private socket!: WebSocket;
  private lastHeartbeatTime: Date = new Date();
  private socketOpened: boolean = false;

  public connectionStatusChange$: Subject<boolean> = new Subject();

  constructor(
    private appConfigService: AppConfigService,
    private robotStateService: RobotStateService
  ) {
    this.autoConnectLoop();
    this.sendDataLoop();
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
    this.connectionStatusChange$.next(true);
  };

  private onClose() {
    this.socketOpened = false;
    console.log('Disconnected');
    this.connectionStatusChange$.next(false);
  }

  private onMessage(event: any) {
    this.lastHeartbeatTime = new Date();
    this.processMessage(event);
  }

  processMessage(event: any) {
    let lastJsonObject = event.data.split('}');
    lastJsonObject = lastJsonObject[lastJsonObject.length - 2] + '}';
    if (lastJsonObject.substring(0, 1) === '{') {
      try {
        const json = JSON.parse(lastJsonObject);
        this.robotStateService.processEspMessage(json);
      } catch (e) {
        console.log(e);
      }
    };
  }

  public sendCommand(command: RobotCommand) {
    if (this.socket?.readyState === 1) {
      this.socket.send(JSON.stringify(command));
    }
  }

  public autoConnectLoop() {
    timer(0, autoReconnectInterval)
      .subscribe(() => {
        if (this.socketOpened && new Date().getTime() - this.lastHeartbeatTime.getTime() > heartbeatMaxInterval) {
          console.log('No heartbeat received for the last %d ms', heartbeatMaxInterval);
          this.socketOpened = false;
          this.connectionStatusChange$.next(false);
        }
        if (!this.socketOpened) {
          console.log('Connecting to robot...');
          this.connectToRobot();
        }
      });
  }

  public sendDataLoop() {
    interval(sendDataInterval)
      .subscribe(() => {
        if (this.socketOpened) {
          this.socket.send(JSON.stringify({ alive: true }));
        }
      });
  }
}
