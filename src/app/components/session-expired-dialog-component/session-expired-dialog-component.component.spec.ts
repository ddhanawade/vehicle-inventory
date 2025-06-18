import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionExpiredDialogComponentComponent } from './session-expired-dialog-component.component';

describe('SessionExpiredDialogComponentComponent', () => {
  let component: SessionExpiredDialogComponentComponent;
  let fixture: ComponentFixture<SessionExpiredDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionExpiredDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionExpiredDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
