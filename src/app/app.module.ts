import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StreamWindowComponent } from './components/stream-window/stream-window.component';
import { DirectionWidgetComponent } from './components/direction-widget/direction-widget.component';
import { ThrottleWidgetComponent } from './components/throttle-widget/throttle-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    StreamWindowComponent,
    DirectionWidgetComponent,
    ThrottleWidgetComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
