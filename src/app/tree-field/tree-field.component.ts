import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { ENTER, COMMA } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-tree-field',
  templateUrl: './tree-field.component.html',
  styleUrls: ['./tree-field.component.scss']
})
export class TreeFieldComponent {
  @Input() treeData: LocationNode[] = []
  fieldName: FormControl = new FormControl([])
  @Input() transSiteHierarchySelected: LocationFlatNode[] = []
  @Output() sendTransSiteHierarchySelected = new EventEmitter<LocationFlatNode[]>()

  @ViewChild("auto") autocomplete!: MatAutocomplete;
  @ViewChild("autoTreeInput") autoInput!: ElementRef;
  getLevel = (node: LocationFlatNode) => node.level;
  isExpandable = (node: LocationFlatNode) => node.expandable;
  getChildren = (node: LocationNode): LocationNode[] => node.children ?? [];
  hasChild = (_: number, _nodeData: LocationFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: LocationFlatNode) => _nodeData.item === "";
  expandAll = () => console.log("expandAll");
  initialTreeData:LocationNode[] = []
  checklistSelection = new SelectionModel<LocationFlatNode>(true);
  dataChange = new BehaviorSubject<LocationNode[]>([]);
  flatNodeMap = new Map<LocationFlatNode, LocationNode>();
  nestedNodeMap = new Map<LocationNode, LocationFlatNode>();
  treeControl!: FlatTreeControl<LocationFlatNode>;
  treeFlattener!: MatTreeFlattener<LocationNode, LocationFlatNode>;
  dataSource!: MatTreeFlatDataSource<LocationNode, LocationFlatNode>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchString: string ='';

  ngOnInit(): void {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<LocationFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataChange.subscribe((data: any) => {
      this.dataSource.data = data;
    });
    if (this.transSiteHierarchySelected?.length) {
      this.initialSelectedSiteLocation();
    } else {
      this.checklistSelection.clear()
      this.fieldName.setValue(null);
    }

  }

  ngOnChanges(): void {
    this.initialize()
    if (!this.transSiteHierarchySelected?.length) {
      this.checklistSelection.clear()
      this.fieldName.setValue(null);
    }
  }

  initialSelectedSiteLocation() {
    this.transSiteHierarchySelected.forEach((node) => {
      let index = this.treeControl?.dataNodes?.findIndex((item: any) => item.item === node.item);
      this.checklistSelection.toggle(this.treeControl.dataNodes[index])
    })
  }

  initialize() {
    this.initialTreeData =this.treeData
    const data = this.treeData;
    this.dataChange.next(data);
  }

  transformer = (node: LocationNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new LocationFlatNode(node.item, level, !!node.children);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  opened() {
    this.treeControl.collapseAll()
  }

  descendantsAllSelected(node: LocationFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every((child: any) =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  descendantsPartiallySelected(node: LocationFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child: any) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: LocationFlatNode): void {
    if(this.searchString){
      this.fieldName.setValue(null);
      this.autoInput.nativeElement.value = '';
      this.dataChange.next(this.initialTreeData)
    }
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.every((child: any) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  todoLeafItemSelectionToggle(node: LocationFlatNode): void {
    if(this.searchString){
      this.fieldName.setValue(null);
      this.autoInput.nativeElement.value = '';
      this.dataChange.next(this.initialTreeData)
    }
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: LocationFlatNode): void {
    let parent: LocationFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    this.sendSelectedItems();
  }

  checkRootNodeSelection(node: LocationFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every((child: any) =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: LocationFlatNode): LocationFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  sendSelectedItems() {
    if (this.checklistSelection.selected.length) {
      let data = this.checklistSelection.selected;
      this.sendTransSiteHierarchySelected.emit(data)
    }else{
      this.sendTransSiteHierarchySelected.emit([]);
    }
  }

  removeSelected(node: LocationFlatNode) {
    const index = this.checklistSelection.selected.indexOf(node);
    if (index >= 0) {
      this.todoItemSelectionToggle(node);
    }
  }

  applyFilter(filterValue: any) {
    this.searchString = filterValue.value.trim().toLowerCase();
    this.filter(this.searchString)
    if (this.searchString) {
        this.treeControl.expandAll();
      } else {
        this.treeControl.collapseAll();
      }
    }

    filter(filterText: string) {
      let filteredTreeData;
      if (filterText) {

        function filter(array: any, text: any) {
          const getChildren = (result: any, object: any) => {
            if (object.item.toLowerCase().includes(text.toLowerCase())) {
              result.push(object);
              return result;
            }
            if (Array.isArray(object.children)) {
              const children = object.children.reduce(getChildren, []);
              if (children.length) result.push({ ...object, children });
            }
            return result;
          };
          return array.reduce(getChildren, []);
        }
        filteredTreeData = filter(this.treeData, filterText);
      } else {
        filteredTreeData = this.treeData;
      }
      const data = filteredTreeData;
      this.dataChange.next(data);
    }

    removeAll(){
      this.checklistSelection.clear()
      this.sendTransSiteHierarchySelected.emit([]);
    }

}


export interface LocationNode {
  children?: LocationNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class LocationFlatNode {
  item: string;
  level: number;
  expandable: boolean;

  constructor(item:string, level:number,expandable:boolean) {
    this.item = item;
    this.level = level;
    this.expandable = expandable;
  }
}
