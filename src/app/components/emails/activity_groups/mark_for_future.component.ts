import { Component, OnInit, Input } from '@angular/core';
import * as MasterData from '../../../master_data';
import { ApiService, CommonService } from '../../../services';
import { InboxComponent } from "../inbox.component";
@Component({
	selector: 'mark-for-future',
	templateUrl: '../../../templates/emails/activity_groups/mark_for_future.component.html'
})

export class MarkForFutureComponent implements OnInit{
	@Input() activity_group: any;
  @Input() email: any;

  public activities: Array<any>;
  public previous_selection: any;

	constructor(
			private api: ApiService,
			private commonService: CommonService,
			private inboxComponent: InboxComponent
		){ }

	ngOnInit(){
		this.activities = this.activity_group.simulation_activities;
		this.setPreviousData();
	}

	setPreviousData() {
		this.previous_selection = undefined;
		var prev_activities = MasterData.EMAIL_ACTIVITIES.filter(ea => (ea.email_id.$oid === this.email._id.$oid && ea.activity_group_id.$oid === this.activity_group._id.$oid));
		if(prev_activities.length > 0 && prev_activities.length%2 == 1) {
			this.previous_selection = prev_activities[prev_activities.length - 1].activity_id.$oid;
		}
	}

	ngOnChanges(){
    this.setPreviousData();
  }

	saveResponse() {
		var params = {
			email_id: this.email._id.$oid,
			activity_id: this.activities[0]._id.$oid,
			activity_group_id: this.activity_group._id.$oid
		};

		this.api.create(MasterData.BASE_URL + "/email_activities", params)
	  	.subscribe(response => {
	  		MasterData.addEmailActivity(response.email_activity);
	  		MasterData.addMarkForFutureEmailId(this.email._id.$oid);
	  		this.setPreviousData();
	  		this.commonService.showSnackBar();
	  		this.inboxComponent.updateMarkForFuture();
      }, () => {
      this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
    });
	}
}
