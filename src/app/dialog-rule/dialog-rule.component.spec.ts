import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRuleComponent } from './dialog-rule.component';

describe('DialogRuleComponent', () => {
  let component: DialogRuleComponent;
  let fixture: ComponentFixture<DialogRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
