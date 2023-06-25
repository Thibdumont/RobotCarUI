import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiPanelDirectorService {

  public photoPanelActiveStateChange: Subject<boolean> = new Subject();
  public infoPanelActiveStateChange: Subject<boolean> = new Subject();
  public controlHelpPanelActiveStateChange: Subject<boolean> = new Subject();
  public streamWindowActiveStateChange: Subject<boolean> = new Subject();

  constructor() {
  }

}
