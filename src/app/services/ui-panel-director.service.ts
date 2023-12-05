import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export enum UiPanel {
  PHOTO = 'PHOTO',
  CAMERA_CONTROL = 'CAMERA_CONTROL',
  STREAM_WINDOW = 'STREAM_WINDOW',
  INFO = 'INFO',
  CAR_SETTING = 'CAR_SETTING',
}

export interface UiPanelSubjectState {
  subject: Subject<boolean>;
  state: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UiPanelDirectorService {
  private uiPanelSubjectMap: Map<UiPanel, Subject<boolean>> = new Map([
    [UiPanel.PHOTO, new Subject<boolean>()],
    [UiPanel.CAMERA_CONTROL, new Subject<boolean>()],
    [UiPanel.STREAM_WINDOW, new Subject<boolean>()],
    [UiPanel.INFO, new Subject<boolean>()],
    [UiPanel.CAR_SETTING, new Subject<boolean>()],
  ]);

  activePanel: UiPanel = UiPanel.STREAM_WINDOW;

  uiPanelChange = new Subject<UiPanel>();

  constructor() {}

  init() {
    this.setActive(UiPanel.STREAM_WINDOW);
  }

  setActive(uiPanel: UiPanel) {
    this.activePanel = uiPanel;
    this.disableAllUi();
    this.uiPanelSubjectMap.get(uiPanel as UiPanel)?.next(true);
    this.uiPanelChange.next(uiPanel);
  }

  private disableAllUi() {
    Object.keys(UiPanel).forEach((uiPanel) => {
      this.uiPanelSubjectMap.get(uiPanel as UiPanel)?.next(false);
    });
  }

  getUiPanelSubject(uiPanel: UiPanel): Subject<boolean> {
    return this.uiPanelSubjectMap.get(uiPanel) as Subject<boolean>;
  }

  getActivePanel(): UiPanel {
    return this.activePanel;
  }
}
