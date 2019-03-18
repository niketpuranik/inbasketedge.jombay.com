import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { PERSONS } from "../../master_data";

@Component({
  templateUrl: '../../templates/calendar/set_calendar_event.component.html',
})
export class SetCalendarEventDialogComponent implements OnInit{
  public persons: any[];
  public selectedPerson: any;
  public selectedPersonId: string;
  public date: number = 0;
  public hour: number = 0;
  public days: any[] = [];
  public times: any[] = [];
  public selectedPersonError: boolean = false;
  public selectPersonPlaceholder: string = "Please Select Person";
  public enable_selction_of_person: boolean = true;
  public pre_selected_person: any;

  constructor(
    public dialogRef: MatDialogRef<SetCalendarEventDialogComponent>
    ) {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.persons = PERSONS.filter(p => (p.status === "employee" && !p.is_player));

    if(this.pre_selected_person) {
      this.setPerson(this.pre_selected_person);
      this.enable_selction_of_person = false;
    }
  }

  setPerson(person) {
    this.selectedPerson = person;
    this.selectedPersonId = this.selectedPerson._id.$oid;
    this.selectedPersonError = false;
    this.selectPersonPlaceholder = "Selected Person";
  }

  saveEvent() {
  }

  closeDialog() {
    if(this.selectedPerson) {
      this.dialogRef.close({
        person: this.selectedPerson,
        date:  this.date,
        hour: this.hour
      });
    } else {
      this.selectedPersonError = true;
    }
  }
}
