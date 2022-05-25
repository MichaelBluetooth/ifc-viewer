import { Component, HostListener, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { SpatialTreeNode } from '../../models/spatial-tree-node';
import { IfcContextMenuService } from '../../services/ifc-context-menu.service';
import { IFCService } from '../../services/ifc.service';
import { buildTreeNode, findAllNodesInPath, groupStoreyElements } from '../../utils/spatial-utils';

@Component({
  selector: 'lib-ifc-structure',
  templateUrl: './ifc-structure.component.html',
  styleUrls: ['./ifc-structure.component.less']
})
export class IfcStructureComponent implements OnInit {

  isMulti = false;
  selectedIds: Set<number> = new Set<number>();
  hiddenIds: Set<number> = new Set<number>();
  tree: SpatialTreeNode;
  highlightedElementIds: Set<any> = new Set<any>();
  skip: boolean = false;

  constructor(
    private ctxMenu: IfcContextMenuService,
    private ifc: IFCService
  ) {}

  ngOnInit(): void {
    this.ifc.selectedIds$.subscribe((ids) => {

      if (ids.length > 0 && !this.selectedIds.has(ids[0])) {        
        const firstSelectedId = ids[0];
        const path: any[] = [];
        findAllNodesInPath(this.tree, (node: any) => node.data.expressID === firstSelectedId, path);
        path.forEach(node => {
          node.collapsed = false;
        });

        setTimeout(() => {
          document.getElementById(firstSelectedId.toString())?.scrollIntoView();
        }, 50);
      }

      this.selectedIds = new Set(ids);

      if (!this.skip) {
        this.highlightedElementIds = new Set(ids);
      }
      this.skip = false;
    });

    this.ifc.hiddenIds$.subscribe((ids: number[]) => {
      this.hiddenIds = new Set(ids);
    });

    this.ifc.spatialStructure$
      .pipe(
        map((tree: any) => {
          groupStoreyElements(tree);
          return tree;
        })
      )
      .pipe(map((tree: any) => buildTreeNode(tree)))
      .subscribe((tree: any) => {
        this.tree = tree;
      });
  }

  isSelected(node: SpatialTreeNode) {
    return this.highlightedElementIds.has(node.nodeId);
  }

  isHidden(node: SpatialTreeNode) {
    return false; //TODO: make this work...
    // return this.hiddenIds.has(node.data.expressID);
  }

  select(node: SpatialTreeNode) {
    this.skip = true;
    this.highlightedElementIds = new Set([node.nodeId]);

    const newSelectedIds = this.getAllChildren(node);
    if (this.isMulti) {
      this.selectedIds = new Set<number>([
        ...this.selectedIds,
        ...newSelectedIds,
      ]);
      this.ifc.highlightById(Array.from(this.selectedIds));
    } else {
      this.selectedIds = new Set(newSelectedIds);
      this.ifc.highlightById(newSelectedIds);
    }
  }

  getAllChildren(node: SpatialTreeNode, ids: number[] = []): number[] {
    if (node.data.expressID) {
      ids.push(node.data.expressID);
    }

    if (node.children) {
      node.children.forEach((child: SpatialTreeNode) => {
        this.getAllChildren(child, ids);
      });
    }

    return ids;
  }

  forAllNodesInPath(
    currentNode: SpatialTreeNode,
    nodeId: string,
    callBack: Function,
    path: SpatialTreeNode[]
  ) {
    path.push(currentNode);
    if (currentNode.nodeId === nodeId) {
      path.forEach((item) => {
        callBack(item);
      });
    }
  }

  openContextMenu(node: SpatialTreeNode, e: MouseEvent) {
    this.ctxMenu.openContextMenu(node.data, e.pageX, e.pageY);
    return false; //prevent the browser from opening the default context menu
  }

  @HostListener('document:keydown', ['$event'])
  shiftdown(evt: KeyboardEvent) {
    if (evt.key === 'Shift') {
      this.isMulti = true;
    }
  }

  @HostListener('document:keyup', ['$event'])
  shiftup(evt: KeyboardEvent) {
    if (evt.key === 'Shift') {
      this.isMulti = false;
    }
  }

}
