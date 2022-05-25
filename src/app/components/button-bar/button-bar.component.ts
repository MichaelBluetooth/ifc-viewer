import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IFCService, WorldService } from 'ngx-ifc-components';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html',
  styleUrls: ['./button-bar.component.less'],
})
export class ButtonBarComponent implements OnInit {

  showStructure: boolean = false;

  @ViewChild('fileUpload', { static: true }) uploadField: ElementRef;

  constructor(private ifc: IFCService, private world: WorldService) {}

  ngOnInit(): void {}

  upload() {
    if (
      this.uploadField.nativeElement.files &&
      this.uploadField.nativeElement.files.length > 0
    ) {
      this.ifc.loadFile(this.uploadField.nativeElement.files[0]);
    }
  }

  reset() {
    this.world.reset();
  }

  toggleStructure(){
    this.showStructure = !this.showStructure;
  }
}
