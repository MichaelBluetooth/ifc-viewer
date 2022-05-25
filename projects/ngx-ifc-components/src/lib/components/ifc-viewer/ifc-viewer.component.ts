import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { IfcKeyboardControlsService } from '../../services/ifc-keyboard-controls.service';
import { IFCService } from '../../services/ifc.service';
import { WorldService } from '../../utils/world';

@Component({
  selector: 'lib-ifc-viewer',
  templateUrl: './ifc-viewer.component.html',
  styleUrls: ['./ifc-viewer.component.css']
})
export class IfcViewerComponent implements OnInit {

  isMulti: boolean;
  @ViewChild('threeCanvas', { static: true }) canvas: ElementRef;

  constructor(
    private worldService: WorldService,
    private ifc: IFCService,    
    private ifcKeyboardControls: IfcKeyboardControlsService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.ifc.reset(false);
  }

  ngAfterViewInit() {
    this.worldService.init(this.canvas.nativeElement);
    this.worldService.animate();

    // this.http.get(`resources/download/${this.route.snapshot.params['id']}`, {responseType: 'blob'}).subscribe(blob => {
    //   const ifcUrl = window.URL.createObjectURL(blob)
    //   this.ifc.loadUrl(ifcUrl);
    // });
    
    //for debug!
    // this.ifc.loadUrl('static/ifc/Test Building 1.ifc');
    this.ifc.loadUrl('assets/ifc/Test Building 1.ifc');
  }

  pick(event: any) {
    this.ifc.highlight(event.clientX, event.clientY, this.isMulti);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any) {
    this.ifc.preselect(event.clientX, event.clientY);
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(evt: KeyboardEvent) {
    if (evt.key === 'Shift') {
      this.isMulti = true;
    }

    this.ifcKeyboardControls.keyPress(evt);
  }

  @HostListener('document:keyup', ['$event'])
  keyUp(evt: any) {
    if (evt.key === 'Shift') {
      this.isMulti = false;
    }
  }

}
