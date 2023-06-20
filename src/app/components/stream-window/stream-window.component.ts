import { AppConfigService } from 'src/app/services/app-config.service';
import { RobotCommunicationService } from 'src/app/services/robot-communication.service';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'robotcarui-stream-window',
  templateUrl: './stream-window.component.html',
  styleUrls: ['./stream-window.component.scss']
})
export class StreamWindowComponent {
  @ViewChild('stream') stream!: ElementRef;

  isStreaming: boolean = false;

  constructor(
    private appConfigService: AppConfigService,
    private robotCommunicationService: RobotCommunicationService
  ) {
    this.autoReconnectStream();
  }

  getStreamUrl(): string {
    return `http://${this.appConfigService.hostname}/stream`;
  }

  autoReconnectStream() {
    this.robotCommunicationService.connectionStatusChange.subscribe(connectionOpened => {
      if (!connectionOpened) {
        this.stream.nativeElement.src = '';
        this.isStreaming = false;
      } else {
        this.stream.nativeElement.src = this.getStreamUrl();
        this.isStreaming = true;
      }
    });
  }


}
