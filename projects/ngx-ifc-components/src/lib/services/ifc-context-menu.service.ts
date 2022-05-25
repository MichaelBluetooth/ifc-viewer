import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
} from '@angular/core';
import { ElementContextMenuComponent } from '../components/element-context-menu/element-context-menu.component';
import { IFCNode } from '../models/ifc-node';

@Injectable()
export class IfcContextMenuService {
  private ctxMenu: ComponentRef<ElementContextMenuComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  openContextMenu(ifcNode: IFCNode, x: number, y: number) {
    //destroy the old context menu, if one is open
    this.destroyContextMenu();

    this.ctxMenu = this.componentFactoryResolver
      .resolveComponentFactory(ElementContextMenuComponent)
      .create(this.injector);

    this.ctxMenu.instance.ifcNode = ifcNode;
    this.ctxMenu.instance.positionX = x;
    this.ctxMenu.instance.positionY = y;

    const appRef = this.injector.get(ApplicationRef);
    appRef.attachView(this.ctxMenu.hostView);

    const domElem = (this.ctxMenu.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
  }

  destroyContextMenu(): void {
    if (this.ctxMenu) {
      this.injector.get(ApplicationRef).detachView(this.ctxMenu.hostView);
      this.ctxMenu.destroy();
    }
  }
}
