import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { IFCNode } from '../../models/ifc-node';
import { IfcContextMenuService } from '../../services/ifc-context-menu.service';
import { IFCService } from '../../services/ifc.service';

@Component({
  selector: 'app-element-context-menu',
  templateUrl: './element-context-menu.component.html',
  styleUrls: ['./element-context-menu.component.less'],
})
export class ElementContextMenuComponent implements OnInit {
  @Input() ifcNode: IFCNode;
  @Input() positionX: number;
  @Input() positionY: number;

  constructor(
    private eRef: ElementRef,
    private ctxMenuService: IfcContextMenuService,
    private ifcService: IFCService
  ) {}

  ngOnInit(): void {}

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.ctxMenuService.destroyContextMenu();
    }
  }

  select() {
    if (this.ifcNode.children && this.ifcNode.children.length > 0) {
      //collect and select all _leaf_ nodes
      const ids: number[] = this.getAllIds();
      this.ifcService.highlightById(ids);
      this.ctxMenuService.destroyContextMenu();
    } else {
      //this is a leaf node, so we can hide it
      this.ifcService.highlightById([this.ifcNode.expressID]);
      this.ctxMenuService.destroyContextMenu();
    }
  }

  iterateChildren(node: IFCNode, callback: Function) {
    callback(node);
    if (node.children) {
      node.children.forEach((child) => {
        this.iterateChildren(child, callback);
      });
    }
  }

  getAllIds(): number[] {
    const ids: number[] = [];
    this.iterateChildren(this.ifcNode, (node: IFCNode) => {
      if (node.expressID) {
        ids.push(node.expressID);
      }
    });
    return ids;
  }

  getAllLeafElements(): number[] {
    const ids: number[] = [];
    this.iterateChildren(this.ifcNode, (node: IFCNode) => {
      if (!node.children || node.children.length === 0) {
        ids.push(node.expressID);
      }
    });
    return ids;
  }

  hide() {
    const ids: number[] = this.getAllIds();
    this.ifcService.hideElementsById(ids);
    this.ctxMenuService.destroyContextMenu();
  }

  show() {
    const ids: number[] = this.getAllIds();
    this.ifcService.showElementsById(ids);
    this.ctxMenuService.destroyContextMenu();
  }

  hideOthers() {
    const ids: number[] = this.getAllIds();
    this.ifcService.hideOthers(ids);
    this.ctxMenuService.destroyContextMenu();
  }
}
