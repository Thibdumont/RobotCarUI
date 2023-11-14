# RobotCarUI

I was gifted an Elegoo Smart robot car v4 and started to experiment by writing some new software to provide a better experience than the one provided out of the box.
This app is the client part of this project. 
It works with these 2 other projects that have to be installed on the Uno and ESP32 : 

1. For arduino Uno : [https://github.com/Thibdumont/RobotCar2](https://github.com/Thibdumont/RobotCar2)
2. For ESP32 : [https://github.com/Thibdumont/espCam2](https://github.com/Thibdumont/espCam2)

- [RobotCarUI](#robotcarui)
  - [Requirements](#requirements)
  - [Key features](#key-features)
  - [Installation instructions](#installation-instructions)
    - [Configuration](#configuration)
    - [Building the app](#building-the-app)
  - [Detailed features](#detailed-features)
    - [Gamepad](#gamepad)
    - [Screens](#screens)
      - [Live stream/control car](#live-streamcontrol-car)
      - [Car settings](#car-settings)
      - [HUD info](#hud-info)
      - [Photo library](#photo-library)
      - [Camera settings](#camera-settings)
    - [Connection](#connection)
    - [Settings persistence](#settings-persistence)
    - [Battery percentage](#battery-percentage)
  - [Work in progress](#work-in-progress)
  - [Coming soon](#coming-soon)


## Requirements

- You need to have a `Elegoo Smart robot car v4` kit or build some equivalent.
- A gamepad (tested with Xbox controller, might work with others..)

## Key features

- Web UI, working on chrome, on mobile/desktop. Mostly responsive.
- Gamepad support (tested with Xbox controller) to control the car
- Automatically connect/reconnect to ESP32 server
- Change some car settings (max speed, head speed, safe stop distance ..)
- Live video stream from ESP camera
- Change camera settings (resolution, quality, contrast, saturation, brightness)
- Take photos
- Display some data on HUD (battery, voltage, forward distance..)
- Two modes : LAN or Soft AP

## Installation instructions

### Configuration

First, you should edit the config of the app to match your network.
To do so, open the `src/app/services/app.config.service.ts` file and update the IP address commented with `local network` with the one you assigned to your ESP32 (you should affect your ESP a static IP address in your router config) :

```typescript
 private possibleHostIP: Array<string> = [
    "192.168.1.1",//softAP IP
    "192.168.1.32"//local network
  ];
```

You should keep the rest as is, unless you want to tweak the app..

### Building the app

The app is built using Angular framework. I tried to the final bundle size as low as possible, so no assets/images/icons/fancy libraries.
Some basic knowledge of Angular/Web is required.

1. Install `VSCode`
2. Have latest version of nodeJS/npm installed
3. Clone this repository and go to the `RobotCarUI` folder
4. Run `npm install` to install Angular and project dependencies
5. Run the app
    - Run `npm start` to locally run the app (it will open a browser tab with the app and connect to the car)
    - Run `npm run prod` to build a bundle, so you can upload it to the ESP32 storage and access it directly by typing the ESP IP address in your browser 

## Detailed features

### Gamepad

The app should be used with a gamepad. Connect a gamepad on your computer/smartphone and it should work (test with Xbox controller only).
Press the `start button` anywhere and you will have the key mapping for each screen.

### Screens

#### Live stream/control car

The app is composed of a central video stream UI that is used to drive the car.
There, you can drive the car using the gamepad. You can take some photos, adjust the speed, and see some informations on the HUD.
![stream](https://github.com/Thibdumont/RobotCarUI/assets/33493112/916c291a-be4a-4376-82d8-9b7ec364c0b1)

#### Car settings

Opened with the up Dpad.
This panel is for adjusting the car settings : servo speed, safe stop distance ..
![car settings](https://github.com/Thibdumont/RobotCarUI/assets/33493112/c5247d1b-2bcf-47b2-a0b9-bf14b2c9455d)

#### HUD info

Opened with the left Dpad.
This panel is for displaying some live data (radar distance, voltage, debug info etc). There you can toggle on/off the HUD display of this data.
![hud settings](https://github.com/Thibdumont/RobotCarUI/assets/33493112/87010f05-957a-4543-a7dd-12602ec09646)

#### Photo library

Opened with the right Dpad.
There you can see photos taken. You can navigate left/right and delete photos. Photos are not stored anywhere, they are lost if you refresh the page.
![photo](https://github.com/Thibdumont/RobotCarUI/assets/33493112/fd542a1b-d5ac-4a65-9e62-42f6e4612860)

#### Camera settings

Opened with the down Dpad.
It is used to change the camera settings
![camera settings](https://github.com/Thibdumont/RobotCarUI/assets/33493112/c49a93ad-a579-4b72-92ef-46018419decc)

### Connection

The app automatically reconnect to the ESP, it cycles between every IP address filled in the config (see Configuration section) so you don't have to worry when changing network mode (LAN/SoftAP).

### Settings persistence

Any settings you change (HUD settings apart) will be saved on ESP32 storage. So when you restart the car or refresh the page, it will keep the settings you chose.

### Battery percentage

The battery percentage estimation is innacurate (to say the least..). But well, it gives you a rough idea of the battery level, better than nothing for now.
I couldn't figure out how to get a proper estimation.. if anybody have an idea on how I could do it, do not hesitate.

## Work in progress

This project is still work in progress.
Any suggestion or advice is welcome.

## Coming soon

1. Angular 17 upgrade
2. Battery level estimation improvement
3. More car settings to change
