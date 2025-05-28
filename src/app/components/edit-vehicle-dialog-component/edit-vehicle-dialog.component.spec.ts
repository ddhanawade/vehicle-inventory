import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleDialogComponent } from './edit-vehicle-dialog.component';

describe('EditVehicleDialogComponent', () => {
  let component: EditVehicleDialogComponent;
  let fixture: ComponentFixture<EditVehicleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVehicleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVehicleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
