import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { AppConfigService } from './app-config.service';

export interface PhotoItem {
  date: Date;
  src: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {


  photoList: Array<PhotoItem> = new Array();
  photoListChanged$: Subject<void> = new Subject();

  constructor(
    private appConfigService: AppConfigService
  ) { }

  takePhoto(): PhotoItem {
    const photo = {
      date: new Date(),
      src: this.getCaptureUrl()
    };
    this.photoList.unshift(photo);
    this.photoListChanged$.next();
    return photo;
  }

  removePhoto(photoIndex: number) {
    this.photoList.splice(photoIndex, 1);
    this.photoListChanged$.next();
  }

  getCaptureUrl(): string {
    return `http://${this.appConfigService.getCurrentHostIP()}/capture?t=${Date.now()}`;
  }

  getPhotoList(): Array<PhotoItem> {
    return this.photoList;
  }
}
