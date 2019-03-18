import { Component, OnInit } from '@angular/core';
import * as MasterData from '../../master_data';
import { ApiService, CommonService, SimulationService } from '../../services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'inbox',
  templateUrl: '../../templates/emails/inbox.component.html'
})

export class InboxComponent implements OnInit{
  public emails: any = [];
  public selected_email: any;

  activity_groups: Array<any>;

  public assign_email: any;
  public assign_priority: any;
  public reply: any;
  public long_reply: any;
  public mark_for_future: any;
  public read_email: any;
  public email_index: string;
  public sub: any;
  public mark_for_future_email_ids: any = [];
  public read_email_ids: any = [];
  public current_day: number;
  public show_animation: boolean = false;

  constructor (
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private simulationService: SimulationService
   ) {

      commonService.dayUpdated.subscribe(
        day_count => this.ondayUpdated(day_count)
      );

      simulationService.simulationFetched.subscribe(
        user_company_simulation => this.onSimulationFetched(user_company_simulation)
      );
  }

  sent_at(sent_at) {
    var start_date = this.commonService.newDate(MasterData.SIMULATION.start_date);
    var ref_date = new Date(start_date.setDate(start_date.getDate() - 1 + sent_at));
    return ref_date
  }

  ondayUpdated(day_count) {
    this.current_day = MasterData.DAY_COUNT;
    this.emails = MasterData.EMAILS.filter(e => e.sent_at <= this.current_day).reverse();
    this.updateReadEmail();
    this.commonService.readEmailUpdated.emit();
    this.show_animation = true;
    setTimeout(() => this.disableAnimation(), 3000);
  }

  disableAnimation() {
    this.show_animation = false;
  }

  onSimulationFetched(user_company_simulation) {
    this.setDefaultData();
    this.updateMarkForFuture();
    this.updateReadEmail();
  }

  ngOnInit() {
    this.activity_groups = MasterData.ACTIVITY_GROUPS;

    this.sub = this.activatedRoute.params
      .subscribe(params => {
        if(parseInt(params['index'])) {
          this.email_index = params['index'];
        }
        this.setDefaultData();
        this.updateMarkForFuture();
        this.updateReadEmail();
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnChanges(){
    this.setDefaultData();
    this.updateMarkForFuture();
    this.updateReadEmail();
  }

  updateReadEmail() {
    this.read_email_ids = MasterData.READ_EMAIL_IDS;
  }

  updateMarkForFuture() {
    this.mark_for_future_email_ids = MasterData.MARK_FOR_FUTURE_EMAIL_IDS;
  }

  setDefaultData() {
    this.activity_groups = MasterData.ACTIVITY_GROUPS;
    this.current_day = MasterData.DAY_COUNT;
    this.emails = MasterData.EMAILS.filter(e => e.sent_at <= this.current_day).reverse();
    this.selected_email = this.emails[0]
    if(this.email_index) {
      this.selected_email = this.emails.find(e => e._id.$oid == this.email_index);
    }
    this.setEmailSpecificData();
  }

  setEmailSpecificData() {
    if(this.selected_email.questions) {
      this.long_reply = this.selected_email.questions.find(q => q.position == MasterData.EMAIL_POSITIONS["bottom"]);
      this.reply = this.selected_email.questions.find(q => q.position === MasterData.EMAIL_POSITIONS["right_panel"]);
    }

    this.assign_email = this.activity_groups.find(activity_group => activity_group.identifier === "assign_email");
    this.assign_priority = this.activity_groups.find(activity_group => activity_group.identifier === "assign_priority");
    this.mark_for_future = this.activity_groups.find(activity_group => activity_group.identifier === "mark_for_future");
    this.read_email = this.activity_groups.find(activity_group => activity_group.identifier === "read_email");

    this.setAsRead();
  }

  setAsRead() {
    if(!MasterData.READ_EMAIL_IDS.some(id => id === this.selected_email._id.$oid)) {
      var params = {
        email_id: this.selected_email._id.$oid,
        activity_id: this.read_email.simulation_activities[0]._id.$oid,
        activity_group_id: this.read_email._id.$oid
      };
      this.apiService.create(MasterData.BASE_URL + "/email_activities", params)
        .subscribe(response => {
          MasterData.addReadEmailId(response.email_activity.email_id.$oid);
          this.updateReadEmail();
          this.commonService.readEmailUpdated.emit();
        });
    }
  }
}
