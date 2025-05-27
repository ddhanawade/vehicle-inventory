import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleDialogComponentComponent } from './edit-vehicle-dialog.component';

describe('EditVehicleDialogComponentComponent', () => {
  let component: EditVehicleDialogComponentComponent;
  let fixture: ComponentFixture<EditVehicleDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVehicleDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVehicleDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
