import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PjTitulosComponent } from './pj-titulos.component';

describe('PjTitulosComponent', () => {
  let component: PjTitulosComponent;
  let fixture: ComponentFixture<PjTitulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PjTitulosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PjTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
