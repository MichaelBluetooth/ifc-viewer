import { Component, OnInit } from '@angular/core';
import { WorldService } from 'ngx-ifc-components';

@Component({
  selector: 'app-camera-controls-button-bar',
  templateUrl: './camera-controls-button-bar.component.html',
  styleUrls: ['./camera-controls-button-bar.component.less'],
})
export class CameraControlsButtonBarComponent implements OnInit {
  panOnlyEnabled: boolean = false;
  rotateOnlyMode: boolean = false;

  constructor(private world: WorldService) {}

  ngOnInit(): void {}

  togglePanOnlyMode() {
    this.panOnlyEnabled = !this.panOnlyEnabled;
    this.rotateOnlyMode = false;
    this.world.setPanOnlyMode(this.panOnlyEnabled);
  }

  toggleRotateOnlyMode(){
    this.panOnlyEnabled = false;
    this.rotateOnlyMode = !this.rotateOnlyMode;
    this.world.setRotateOnlyMode(this.rotateOnlyMode);
  }

  zoomIn(){
    this.world.zoomIn();
  }

  zoomOut(){
    this.world.zoomOut();
  }
}
