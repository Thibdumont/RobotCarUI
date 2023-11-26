import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import {
  BatteryIndicatorComponent
} from './components/battery-indicator/battery-indicator.component';
import {
  CameraControlPanelComponent
} from './components/camera-control-panel/camera-control-panel.component';
import {
  CarSettingPanelComponent
} from './components/car-setting-panel/car-setting-panel.component';
import {
  ControlHelpPanelComponent
} from './components/control-help-panel/control-help-panel.component';
import { DirectionWidgetComponent } from './components/direction-widget/direction-widget.component';
import {
  HeadPositionWidgetComponent
} from './components/head-position-widget/head-position-widget.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { MainHudComponent } from './components/main-hud/main-hud.component';
import { PhotoPanelComponent } from './components/photo-panel/photo-panel.component';
import { StreamWindowComponent } from './components/stream-window/stream-window.component';
import { ThrottleWidgetComponent } from './components/throttle-widget/throttle-widget.component';
import { WifiSignalComponent } from './components/wifi-signal/wifi-signal.component';
import { ConnectionPanelComponent } from './components/connection-panel/connection-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    StreamWindowComponent,
    DirectionWidgetComponent,
    ThrottleWidgetComponent,
    HeadPositionWidgetComponent,
    MainHudComponent,
    InfoPanelComponent,
    PhotoPanelComponent,
    ControlHelpPanelComponent,
    BatteryIndicatorComponent,
    WifiSignalComponent,
    CameraControlPanelComponent,
    CarSettingPanelComponent,
    ConnectionPanelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
