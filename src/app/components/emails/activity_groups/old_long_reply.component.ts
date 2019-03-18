import { Component, OnInit, Input } from '@angular/core';
import * as MasterData from '../../../master_data';
import { ApiService, CommonService } from '../../../services';

@Component({
  selector: 'long-reply',
  templateUrl: '../../../templates/emails/activity_groups/old_long_reply.component.html'
})

export class OldLongReplyComponent implements OnInit{
  @Input() question: any;
  @Input() email: any;

  public options: Array<any>;
  public previous_selection: any;
  public show_responses:boolean = false;
  public action_flag:boolean = false;
  public selected_question: any;
  public selected_option: any;
  public previous_selection_text: string;

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

  setPreviousData() {
    this.options = this.question.options.filter(a => a.identifier != MasterData.EMAIL_OPTION_IDENTIFIERS["clear_selection"]);
    this.setPreviousSelection();
  }

  setPreviousSelection() {
    this.previous_selection = undefined;
    this.previous_selection_text = undefined;
    var prev_responses = MasterData.EMAIL_QUESTION_RESPONSES.filter(eqr =>
      eqr.email_id.$oid === this.email._id.$oid && eqr.question_id.$oid == this.question._id.$oid);
    if(prev_responses.length > 0) {
      this.previous_selection = prev_responses[prev_responses.length - 1].option_id.$oid;
      this.action_flag = false;
      var option = this.question.options.find(o => o._id.$oid == this.previous_selection);
      this.previous_selection_text = option.body
    }
  }

  clear_responses() {
    this.selected_question = undefined;
    this.selected_option = undefined;
    this.previous_selection = undefined;
    this.action_flag = false;
  }

  selectTempData(question, option) {
    if(this.previous_selection) {
    } else {
      this.selected_question= question;
      this.selected_option = option;
      this.action_flag = true;
    }
  }

  back() {
    this.show_responses = false;
    this.selected_question = undefined;
    this.selected_option = undefined;
    this.action_flag = false;
  }

  save() {
    this.saveResponse(this.selected_question, this.selected_option);
    this.back();
  }

  saveResponse(question, option) {
    if(this.previous_selection) {
      this.commonService.alert("You can not update reply.");
    } else {
      this.previous_selection = option._id.$oid;
      var params = {
        email_id: this.email._id.$oid,
        question_id: question._id.$oid,
        option_id: option._id.$oid
      };
      this.previous_selection_text = option.body
      this.api.create(MasterData.BASE_URL + "/email_question_responses", params)
        .subscribe(response => {
            MasterData.addEmailQuestionResponses(response.email_question_response);
            this.commonService.showSnackBar();
          }, () => {
          this.commonService.showError("Something went wrong. Your action is not saved. <br> Please try again.");
          this.previous_selection = undefined;
          this.previous_selection_text = undefined;
        });
    }
  }
}

