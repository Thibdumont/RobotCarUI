import { AppConfigService } from 'src/app/services/app-config.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-connection-panel',
  templateUrl: './connection-panel.component.html',
  styleUrls: ['./connection-panel.component.scss'],
})
export class ConnectionPanelComponent {
  constructor(public appConfigService: AppConfigService) {}
}
