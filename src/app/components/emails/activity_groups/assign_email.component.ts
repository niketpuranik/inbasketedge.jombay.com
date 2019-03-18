import { Component, OnInit, Input } from '@angular/core';
import  * as MasterData from '../../../master_data';
import { ApiService, CommonService } from '../../../services';

@Component({
	selector: 'assign-email',
	templateUrl: '../../../templates/emails/activity_groups/assign_email.component.html'
})

export class AssignEmailComponent implements OnInit{
	@Input() activity_group: any;
	@Input() email: any;
	public assignEmailDialogue: any;
	public assigedPerson: any;
	public selectedActivity: any = {};
	public after_action_text: string = "To";

	public activities:Array<any>;
	public previous_selection: any = null;
	public temp_previous_selection: any = null;
	public selected_person: any = null;

	public show_org_chart: boolean = false;
	public persons: any = [];
	public team_members: any = [];
	public ceo: any = [];
	public levels: any = [];

	constructor(
		private api: ApiService,
		private commonService: CommonService
	){ }

	ngOnInit(){
		this.activities = this.activity_group.simulation_activities;
	}

	setDefaultData() {
		this.selected_person = undefined;
		this.previous_selection = undefined;
		var prev_activities = MasterData.EMAIL_ACTIVITIES.filter(ea => (ea.email_id.$oid === this.email._id.$oid && ea.activity_group_id.$oid === this.activity_group._id.$oid));
		if(prev_activities.length > 0) {
			this.previous_selection = prev_activities[prev_activities.length - 1].activity_id.$oid;
			this.selectedActivity = MasterData.ACTIVITIES.find(a => a._id.$oid === prev_activities[prev_activities.length - 1].activity_id.$oid);
			this.after_action_text =  this.selectedActivity.after_action_text;
			if(prev_activities[prev_activities.length - 1].selected_person_id) {
				this.selected_person = MasterData.PERSONS.find(p => p._id.$oid === prev_activities[prev_activities.length - 1].selected_person_id.$oid);
			}
		}
	}

	setOrgChartData() {
		this.levels = [];
		this.persons = MasterData.PERSONS.filter(p => p.status === "employee");

		this.ceo = this.persons.find(p => p.manager_ids.lenght == null);
		this.levels.push([this.ceo]);

		var level_one = this.persons.filter(p => p.manager_ids.some( m_id => m_id.$oid ===  this.ceo._id.$oid));
		this.levels.push(level_one);

		this.levels.push([MasterData.CURRENT_SIMULATION_USER]);

		this.team_members = this.persons.filter(p => p.manager_ids.some( m_id => m_id.$oid ===  MasterData.CURRENT_SIMULATION_USER._id.$oid));
		this.levels.push(this.team_members);
	}

	assignPerson(activity) {
		this.selectedActivity = activity;
		this.after_action_text = activity.after_action_text;

		if(this.previous_selection && this.previous_selection != activity._id.$oid) {
			this.selected_person = undefined;
		}
		if(activity.identifier != MasterData.EMAIL_ACTIVITY_IDENTIFIERS["seek_help_from"]) {
			this.openOrgChart();
		} else {
			this.selected_person = MasterData.CURRENT_SIMULATION_USER;
    	this.saveResponse();
		}
	}

	selectPerson(person) {
    if(!person.is_player) {
	    if(this.selected_person && this.selected_person._id.$oid == person._id.$oid) {
	      this.selected_person = undefined;
	    } else {
	      this.selected_person = person;
	    }
	  }
  }

	openOrgChart() {
		this.show_org_chart = true;
	}

	saveAndCloseResponse() {
		if(this.selected_person) {
			this.saveResponse();
			this.closeOrgChart();
		} else {
			this.commonService.alert("Please select a member.");
		}
	}

	cancel() {
		this.setDefaultData();
		this.closeOrgChart();
	}

	closeOrgChart() {
		this.show_org_chart = false;
	}

	saveResponse() {
		var params = {
			email_id: this.email._id.$oid,
			activity_id: this.selectedActivity._id.$oid,
			activity_group_id: this.activity_group._id.$oid
		};
		if(this.selected_person) {
			params["selected_person_id"] = this.selected_person._id.$oid;
		}

		this.api.create(MasterData.BASE_URL + "/email_activities", params)
	  	.subscribe(response => {
	  			this.previous_selection = response.email_activity.activity_id.$oid;
	  			MasterData.addEmailActivity(response.email_activity);
	  			this.commonService.showSnackBar();
	      }, () => {
	      	this.previous_selection = undefined;
	      	this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
	    });
	}

	ngOnChanges(){
    this.setDefaultData();
		this.setOrgChartData();
  }
}
