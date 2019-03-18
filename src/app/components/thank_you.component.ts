import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import * as MasterData from '../master_data';

@Component({
  templateUrl: '../templates/thank_you.component.html',
})

export class ThankYouComponent implements OnInit{

  public show_loader:boolean = true
  public thank_you_message: string;
  public redirect_flag:boolean = false;

  constructor(
      private appComponent: AppComponent
    ) {
  }

  ngOnInit() {
    var redirect_url = MasterData.USER_COMPANY_SIMULATION.redirect_url || "";
    if(redirect_url.length > 0) {
      this.redirect_flag = true
      this.thank_you_message = "Redirecting you to the next part of the assessment";
    } else {
      this.thank_you_message = MasterData.SIMULATION.thank_you_message;
    }
    this.appComponent.simulationOver();
  }
}
