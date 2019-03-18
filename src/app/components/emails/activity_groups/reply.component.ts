import { Component, OnInit, Input } from '@angular/core';
import * as MasterData from '../../../master_data';
import { ApiService, CommonService } from '../../../services';

@Component({
  selector: 'reply',
  templateUrl: '../../../templates/emails/activity_groups/reply.component.html'
})

export class ReplyComponent implements OnInit{
  @Input() question: any;
  @Input() email: any;

  public options: Array<any>;
  public previous_selection: any;
  public unsaved_response: any = undefined;

  constructor(
    private api: ApiService,
    private commonService: CommonService
    ){ }

  ngOnInit(){
    this.setPreviousData();
  }

  ngOnChanges(){
    this.setPreviousData();
  }

  updateUnsaveResponse(option) {
    if(this.previous_selection) {
    } else {
      this.unsaved_response = option;
    }
  }

  setPreviousData() {
    this.unsaved_response = undefined;
    this.options = this.question.options.filter(a => a.identifier != MasterData.EMAIL_OPTION_IDENTIFIERS["clear_selection"]);
    this.setPreviousSelection();
  }

  setPreviousSelection() {
    this.previous_selection = undefined;
    var prev_responses = MasterData.EMAIL_QUESTION_RESPONSES.filter(eqr =>
      eqr.email_id.$oid === this.email._id.$oid && eqr.question_id.$oid == this.question._id.$oid);
    if(prev_responses.length > 0) {
      this.previous_selection = prev_responses[prev_responses.length - 1].option_id.$oid;
    }
  }

  saveResponse() {
    if (this.unsaved_response) {
      var option = this.unsaved_response;
      if(this.previous_selection) {
        this.commonService.alert("This is prohibited.");
      } else {
        if(this.previous_selection != option._id.$oid) {
          this.previous_selection = option._id.$oid;
          var params = {
            email_id: this.email._id.$oid,
            question_id: this.question._id.$oid,
            option_id: option._id.$oid
          };
          this.api.create(MasterData.BASE_URL + "/email_question_responses", params)
            .subscribe(response => {
                MasterData.addEmailQuestionResponses(response.email_question_response);
                this.commonService.showSnackBar();
                this.unsaved_response = undefined;
              }, () => {
              this.previous_selection = undefined;
              this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
            });
        }
      }
    }
  }
}
