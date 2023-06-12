import { AppConfigService } from 'src/app/services/app-config.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-stream-window',
  templateUrl: './stream-window.component.html',
  styleUrls: ['./stream-window.component.scss']
})
export class StreamWindowComponent {
  constructor(
    private appConfigService: AppConfigService
  ) {

  }

  getStreamUrl(): string {
    return `http://${this.appConfigService.hostname}/stream`;
  }

}
