import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeFieldComponent } from './tree-field.component';

describe('TreeFieldComponent', () => {
  let component: TreeFieldComponent;
  let fixture: ComponentFixture<TreeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
