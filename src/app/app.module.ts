import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DirectionWidgetComponent } from './components/direction-widget/direction-widget.component';
import {
  HeadPositionWidgetComponent
} from './components/head-position-widget/head-position-widget.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { MainHudComponent } from './components/main-hud/main-hud.component';
import { PhotoPanelComponent } from './components/photo-panel/photo-panel.component';
import { StreamWindowComponent } from './components/stream-window/stream-window.component';
import { ThrottleWidgetComponent } from './components/throttle-widget/throttle-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    StreamWindowComponent,
    DirectionWidgetComponent,
    ThrottleWidgetComponent,
    HeadPositionWidgetComponent,
    MainHudComponent,
    InfoPanelComponent,
    PhotoPanelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
