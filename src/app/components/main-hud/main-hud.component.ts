import { HudInfoServiceService } from 'src/app/services/hud-info-service.service';

import { Component } from '@angular/core';

@Component({
  selector: 'robotcarui-main-hud',
  templateUrl: './main-hud.component.html',
  styleUrls: ['./main-hud.component.scss'],
})
export class MainHudComponent {
  constructor(public hudInfoService: HudInfoServiceService) {}
}
