import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ApiService, CommonService } from '../../../services';
import * as MasterData from '../../../master_data';

@Component({
	selector: 'assign-priority',
	templateUrl: '../../../templates/emails/activity_groups/assign_priority.component.html'
})

export class AssignPriorityComponent implements OnInit{
	@Input() activity_group: any;
	@Input() email: any;

	public activities: Array<any>;
	public previous_selection: any;
	public unsaved_response: any = undefined;

	constructor(
			private api: ApiService,
			private commonService: CommonService
		){ }

	ngOnInit(){
		this.activities = this.activity_group.simulation_activities;
		this.setDefaultData();
	}

	updateUnsaveResponse(activity) {
		if(this.previous_selection) {
		} else {
			this.unsaved_response = activity;
		}
	}

	setDefaultData() {
		this.previous_selection = undefined;
		this.unsaved_response = undefined;
		var prev_activities = MasterData.EMAIL_ACTIVITIES.filter(ea =>
			(ea.email_id.$oid === this.email._id.$oid && ea.activity_group_id.$oid === this.activity_group._id.$oid));
		if(prev_activities.length > 0) {
			this.previous_selection = prev_activities[prev_activities.length - 1].activity_id.$oid;
		}
	}

	ngOnChanges(){
    this.setDefaultData();
  }

	saveResponse() {
		if (this.unsaved_response) {
			var activity = this.unsaved_response;
			if(this.previous_selection) {
	      this.commonService.alert("This is prohibited.");
	    } else {
				if(this.previous_selection != activity._id.$oid) {
					this.previous_selection = activity._id.$oid;
					var params = {
						email_id: this.email._id.$oid,
						activity_id: activity._id.$oid,
						activity_group_id: this.activity_group._id.$oid
					};
					this.api.create(MasterData.BASE_URL + "/email_activities", params)
				  	.subscribe(response => {
					  		MasterData.addEmailActivity(response.email_activity);
					  		MasterData.addEmailPriority(response.email_activity);
					  		this.commonService.showSnackBar();
				      }, () => {
				      this.previous_selection = undefined;
				      this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
				    });
				}
			}
		}
	}
}
