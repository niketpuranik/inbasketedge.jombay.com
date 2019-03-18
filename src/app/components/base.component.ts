import { Component, OnInit } from '@angular/core';
import * as MasterData from '../master_data';
import { CommonService } from '../services';

@Component({
  templateUrl: '../templates/base.component.html',
})

export class BaseComponent implements OnInit{
  public instructions: string;
  public unread_emails_count: number;
  public selected_tab_index: number = 0;
  public description: string;
  public s3_asset_folder: string;

  constructor(
    private commonService: CommonService
    ) {
    commonService.readEmailUpdated.subscribe(
        day_count => this.onReadEmailUpdate()
      );
  }
  onReadEmailUpdate() {
    var total_email = MasterData.EMAILS.filter(e => e.sent_at <= MasterData.DAY_COUNT).length;
    var read_emails = MasterData.READ_EMAIL_IDS.length;

    this.unread_emails_count = total_email - read_emails;
  }
  ngOnInit() {
    this.s3_asset_folder = MasterData.S3_ASSET_FOLDER;
    this.onReadEmailUpdate();
    this.description = MasterData.SIMULATION.description;
  }
}
