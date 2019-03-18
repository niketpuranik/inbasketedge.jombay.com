import { Component, OnInit } from '@angular/core';
import * as MasterData from '../../master_data';
import { ApiService, CommonService } from '../../services';

@Component({
  selector: 'team',
  templateUrl: '../../templates/team/team.component.html'
})

export class TeamComponent implements OnInit{
  public persons: any;
  public teamMembers: any = [];
  public activity_group: any;
  public activities: any;
  public previous_selection: any;
  public selected_person: any;
  public selected_person_index: number = 0;
  public action_texts: any = {};

  constructor(
    private apiService: ApiService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.activity_group = MasterData.ACTIVITY_GROUPS.find(ag => ag.identifier === MasterData.PERSON_ACTIVITY_GROUP_IDENTIFIERS[0]);
    this.activities = this.activity_group.simulation_activities;
    this.setPersonData();
    this.setActionText();
    this.setPreviousSelection();
  }

  setActionText() {
    for(let person of this.teamMembers) {
      var action_text = "No Action Taken"
      var prev_activities = MasterData.PERSON_ACTIVITIES.filter( pa =>
        (pa.person_id.$oid === person._id.$oid &&
          pa.activity_group_id.$oid === this.activity_group._id.$oid));
      if(prev_activities.length > 0) {
        this.previous_selection = prev_activities[prev_activities.length - 1].activity_id.$oid;
        var activity_group = MasterData.ACTIVITY_GROUPS.find(a =>
          a._id.$oid == prev_activities[prev_activities.length - 1].activity_group_id.$oid);
        var activity = activity_group.simulation_activities.find(a =>
          a._id.$oid == prev_activities[prev_activities.length - 1].activity_id.$oid)
        action_text = activity.name
      }
      this.action_texts[person._id.$oid] = action_text;
    }
  }

  setPersonData() {
    this.persons = MasterData.PERSONS;
    this.teamMembers = this.persons.filter(p => p.manager_ids.some( m_id => m_id.$oid ===  MasterData.CURRENT_SIMULATION_USER._id.$oid));
    this.selected_person = this.teamMembers[this.selected_person_index];
  }

  changePerson(index) {
    this.selected_person_index = index;
    this.selected_person = this.teamMembers[this.selected_person_index];
    this.setPreviousSelection();
  }

  setPreviousSelection() {
    this.previous_selection = undefined;
    var action_text = "No Action Taken"
    var prev_activities = MasterData.PERSON_ACTIVITIES.filter( pa =>
      (pa.person_id.$oid === this.selected_person._id.$oid &&
        pa.activity_group_id.$oid === this.activity_group._id.$oid));
    if(prev_activities.length > 0) {
      this.previous_selection = prev_activities[prev_activities.length - 1].activity_id.$oid;
    }
  }

  saveResponse(activity) {
    if(this.previous_selection != activity._id.$oid) {
      this.previous_selection = activity._id.$oid;
      var params = {
        person_id: this.selected_person._id.$oid,
        activity_id: activity._id.$oid,
        activity_group_id: this.activity_group._id.$oid
      };
      this.apiService.create(MasterData.BASE_URL + "/person_activities", params)
        .subscribe(response => {
          MasterData.addPersonActivity(response.person_activity);
          this.action_texts[this.selected_person._id.$oid] = activity.name;
          this.commonService.showSnackBar();
        }, () => {
          this.previous_selection = undefined;
          this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
      });
    }
  }
}
