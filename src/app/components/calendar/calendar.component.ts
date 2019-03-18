import { Component, OnInit } from '@angular/core';
import * as MasterData from '../../master_data';
import { ApiService, CommonService } from '../../services';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { SetCalendarEventDialogComponent } from './set_event_modal.component';

@Component({
  selector: 'calendar',
  templateUrl: '../../templates/calendar/calendar.component.html'
})

export class CalendarComponent implements OnInit{

  public createEventDialogue: any;
  public persons: any[];
  public events: any =  {};

  public days: any[] = [];
  public dates: any[] = [];
  public times: any[] = [];
  public pre_lunch_times: any[] = [];
  public post_lunch_times: any[] = [];

  public selected_person_id: any;
  public selected_person: any;
  public current_simulation_user: any;
  public you: any;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private commonService: CommonService) { }

  ngOnInit(){
    this.current_simulation_user = MasterData.CURRENT_SIMULATION_USER;
    var start_date = this.commonService.newDate(MasterData.SIMULATION.calendar_start_date);
    var end_date = this.commonService.newDate(MasterData.SIMULATION.calendar_end_date);

    var temp_date = start_date;
    while(temp_date <= end_date) {
      this.days.push(temp_date);
      this.dates.push(temp_date.getDate()+ 1);
      var temp_date = new Date(temp_date.setDate(temp_date.getDate() + 1));
    }

    var start_time = start_date.getHours();
    var end_time = end_date.getHours();
    var t = start_time;
    while(t <= end_time) {
      this.times.push(t);
      if(t < 13) {
        this.pre_lunch_times.push(t);
      } else if(t > 13) {
        this.post_lunch_times.push(t);
      }
      t++;
    }

    this.setCalendarData(this.current_simulation_user);
  }

  selectPerson(selected_person) {
    this.selected_person_id = selected_person._id.$oid;
    this.selected_person = selected_person;
  }

  setCalendarData(selected_person) {
    this.events = {};
    this.selected_person_id = selected_person._id.$oid;
    this.selected_person = selected_person;
    if(selected_person.events) {
      for(let person_event of selected_person.events) {
        var event_date = this.commonService.newDate(person_event.from_time);
        this.events[event_date.getDate()+"_"+event_date.getHours()] = person_event.subject;
      }
    }

    this.persons = MasterData.PERSONS.filter(p => (p.status === "employee" && !p.is_player));
    this.you = MasterData.PERSONS.find(p => (p.status === "employee" && p.is_player));

    if(this.current_simulation_user._id.$oid == selected_person._id.$oid) {
      for(let user_event of MasterData.USER_EVENTS) {
        var event_date = this.commonService.newDate(user_event.from_time);
        this.events[event_date.getDate()+"_"+event_date.getHours()] = user_event.subject;
      }
    } else {
      for(let user_event of MasterData.USER_EVENTS.filter(ue => ue.person_id.$oid === selected_person._id.$oid)) {
        var event_date = this.commonService.newDate(user_event.from_time);
        this.events[event_date.getDate()+"_"+event_date.getHours()] = "Meeting with " + this.current_simulation_user.name;
      }
    }
  }

  saveResponse(date,hour,person) {
    var params = {
      person_id: person._id.$oid,
      subject: "Meeting with " + person.name,
      from_time: this.commonService.removeOffsetDiff(date.setHours(hour)),
      to_time: this.commonService.removeOffsetDiff(date.setHours(hour + 1))
    };

    if(this.selected_person_id == this.current_simulation_user._id.$oid) {
      this.events[date.getDate()+"_"+hour] = "Meeting with " + person.name;
    } else {
      this.events[date.getDate()+"_"+hour] = "Meeting with " + this.current_simulation_user.name;
    }

    this.api.create(MasterData.BASE_URL + "/user_events", params)
      .subscribe(response => {
        MasterData.addUserEvent(response.user_event);
        this.commonService.showSnackBar();
      }, () => {
        this.events[date.getDate()+"_"+hour] = null;
        this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
    });
  }

  openDialog(date, hour) {
    if(this.events[date+'_'+hour]) {
      return
    }
    this.createEventDialogue = this.dialog.open(SetCalendarEventDialogComponent, {
      disableClose: true
    });
    let instance = this.createEventDialogue.componentInstance;
    instance.date = this.days[this.dates.indexOf(date)];
    instance.hour = hour;
    instance.days = this.days;
    instance.times = this.times;
    if(this.current_simulation_user._id.$oid != this.selected_person_id) {
      instance.pre_selected_person = this.selected_person
    }

    this.createEventDialogue.afterClosed().subscribe(result => {
      if(result && result.person) {
        this.saveResponse(result.date, result.hour, result.person);
      }
    });
  }

  scheduleMeeting(date, hour) {
    if(this.events[date+'_'+hour]) {
      if(date < 24) {
        date++;
      } else {
        hour++;
      }
      this.scheduleMeeting(date, hour);
    } else {
      this.openDialog(date,hour);
    }
  }
}
