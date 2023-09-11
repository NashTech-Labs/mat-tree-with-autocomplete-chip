import { Component } from '@angular/core';
import { LocationFlatNode, LocationNode } from './tree-field/tree-field.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Material-fields';
  treeData!:LocationNode[];
  transSiteHierarchySelected:LocationFlatNode[]=[];


ngOnInit(): void {
this.treeData = [
  {
      "item": "Europe",
      "children": [
          {
              "item": "Portugal",
              "children": [
                  {
                      "item": "Porto",
                  },
                  {
                      "item": "Aveiro",
                  },
                  {
                      "item": "Lisbon",
                  },
                  {
                      "item": "Braga",
                  }
              ],
          },
          {
              "item": "Spain",
              "children": [
                  {
                      "item": "Madrid",
                  },
                  {
                      "item": "Barcelona",
                  }
              ],
          },
          {
              "item": "England",
              "children": [
                  {
                      "item": "London",
                  }
              ],
          }
      ],
  },
  {
      "item": "America",
      "children": [
          {
              "item": "USA",
              "children": [
                  {
                      "item": "Arkansas",
                  }
              ],
          }
      ],
  }
]
}
getData(event:LocationFlatNode[]){
console.log(event)
this.transSiteHierarchySelected = event
}
}
