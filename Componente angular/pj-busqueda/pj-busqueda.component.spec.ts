import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PjBusquedaComponent } from './pj-busqueda.component';

describe('PjBusquedaComponent', () => {
  let component: PjBusquedaComponent;
  let fixture: ComponentFixture<PjBusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PjBusquedaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PjBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
