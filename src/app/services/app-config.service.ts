import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  public hostname: string = "192.168.1.32";
  public port: string = "80";
  public webSocketPath = "/ws";

  constructor() { }
}
