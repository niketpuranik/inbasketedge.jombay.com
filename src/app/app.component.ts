import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { SimulationService, CommonService, ApiService } from './services';
import { SIMULATION_STATUSES, USER_COMPANY_SIMULATION, NOTIFICATIONS } from './master_data';
import { BackgroundInfoComponent } from './components';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as MasterData from './master_data';
import { Router } from '@angular/router';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./templates/app.component.html"
})

export class AppComponent implements OnInit {
  public showError: boolean = false;
  public errorText: string = "Error";
  public isCompleted: boolean = true;
  public timerObserver: any;
  public selectedEmail: boolean= false;
  public selectedEmailId: any;
  public thank_you_message: string = "Thank you for attempting Jombay's Inbasket Simulation. <br/> Your responses have been recorded successfully.";
  public day_count: number = 1;
  public day_change_msg: any = {
    1: "Welcome! Your first day has begun. You will receive 2 emails today.",
    2: "Day 2 has begun.  You will receive 3 emails today.",
    3: "Day 3 has begun. Many of your team members have applied for personal leave. Please take decisions effectively.",
    4: "Day 4 has begun. You will receive 3 emails today.",
    5: "This is the last day of the simulation. You have 4 minutes to complete all the pending tasks."
  }
  constructor(
      private simulationService: SimulationService,
      private commonService: CommonService,
      private apiService: ApiService,
      public dialog: MatDialog,
      public router: Router
    ) {
    simulationService.simulationFetched.subscribe(
      user_company_simulation => this.onSimulationFetched(user_company_simulation)
    );
    this.commonService.showErrorCalled$.subscribe(
      (text) => {
        this.showError = true;
        this.errorText = text;
        setTimeout(() => this.hideError(), 10000);
      }
    );
  }

  private diff:number;
  private secondsPerDay:number;
  private minutesPerDay:number;
  public secondsPassed:number = 0;
  public secondsRemainingInDay:number = 0;
  public timer:string;
  public day_timer:string;
  public today:Date;
  public todayString:string;
  public total_time:number;
  private simulation;
  public candidate_name:string;
  public candidate_name_initials:string;

  private showNotification: boolean = false;
  private notifications: any= [];
  private show_timer: boolean = false;
  private completed_percentage: number = 0;
  private company_name: string;
  private total_days: any = [];
  private days: any = [];

  dhms(t){
    var hours, minutes, seconds;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    t = t % 60;
    seconds = (t<10) ? '0'+t : t;

    return [
      minutes + ':',
      seconds + ''
    ].join(' ');
  }

  setTimer(){
    var time = this.simulation.time;
    this.total_time = time;
    this.completed_percentage = Math.round((this.secondsPassed * 100) / (this.total_time*60));
    this.timerObserver = Observable.interval(1000).map((x) => {
      this.diff = (this.total_time*60) - this.secondsPassed;
    }).subscribe((x) => {
      this.secondsPassed++;
      this.secondsRemainingInDay--;
      if(this.diff == 0) {
        this.router.navigate(['','thank_you'], { skipLocationChange: true, preserveQueryParams: true });
      } else if(this.diff >= 0) {
        if(this.secondsPassed == (this.simulation.time - 5)*60) {
          // this.timerAlert();
        } else if((this.secondsPassed % this.secondsPerDay == 0) && this.diff > 5) {
          this.nextDay();
        }
        if(this.secondsPassed % 10 == 0 ) {
          this.setTimeElapsed();
        }
        this.completed_percentage = (this.secondsPassed * 100) / (this.total_time*60);
        this.timer = this.dhms(this.diff);
        this.day_timer = this.dhms(this.secondsRemainingInDay);
        this.apiService.setSecondsPassed(this.secondsPassed);
      }
    });
  }

  exitSimulation() {
    this.commonService.confirm("Are you sure you want to exit the simulation? <br><br>Plesse note: You will not be able to attempt the simulation again.").then(response =>{
      if(response) {
        this.router.navigate(['','thank_you'], { skipLocationChange: true, preserveQueryParams: true });
      }
    });
  }

  setTimeElapsed() {
    this.apiService.updateTimeElapsed(this.secondsPassed);
  }

  timerAlert() {
    var minutesLeft = Math.floor(this.diff/60);
    this.commonService.alert(minutesLeft+" minutes left before the simulation ends. Hurry!");
  }

  simulationOver() {
    this.isCompleted = true;
    window.onbeforeunload = null;
    if(USER_COMPANY_SIMULATION.status == SIMULATION_STATUSES['started']) {
      USER_COMPANY_SIMULATION.status = SIMULATION_STATUSES['ready_for_scoring'];
      this.timerObserver.unsubscribe();
      this.apiService.endSimulation();
    }
    this.secondsPassed == this.simulation.time * 60;
    this.redirect();
  }

  redirect() {
    var redirect_url = USER_COMPANY_SIMULATION.redirect_url || "";
    if(redirect_url.length > 0) {
      setTimeout(() =>
        window.location.href = USER_COMPANY_SIMULATION.redirect_url,
        3000
      );
    }
  }

  nextDay() {
    var yesterdayString = this.todayString;
    var yesterday = this.today;
    this.today = new Date(this.today.getTime()+24*3600*1000);
    this.todayString = this.commonService.formatDate(this.today);
    setTimeout(() => eodAlert.close(), 5000);
    this.secondsRemainingInDay = this.secondsPerDay;
    this.day_count += 1;
    MasterData.setDayCount(this.day_count);
    var eodAlert = this.commonService.alert(this.day_change_msg[this.day_count]);
    eodAlert.afterClosed().subscribe(result => {
      this.commonService.dayUpdated.emit(this.day_count);
    });
  }

  checkNotishications(yesterday, today) {
    var notifications = NOTIFICATIONS.filter(n =>
        this.commonService.newDate(n.scheduled_on) <= today &&
        this.commonService.newDate(n.scheduled_on) > yesterday);

    if(notifications.length > 0) {
      this.notifications = notifications;
      this.showNotification = true;
    }
  }

  closeNotifications() {
    this.showNotification = false;
  }

  openInfoDialog() {
    // this.dialog.open(BackgroundInfoComponent, {
    //   disableClose: true
    // });
  }

  onSimulationFetched(user_company_simulation) {
    this.simulation = user_company_simulation.company_simulation.simulation;
    if(MasterData.USER_COMPANY_SIMULATION.status == SIMULATION_STATUSES['sent']) {
      this.setHeaderData(user_company_simulation);
      return
    }

    this.thank_you_message = this.simulation.thank_you_message;
    if([SIMULATION_STATUSES['sent'], SIMULATION_STATUSES['started']].indexOf(user_company_simulation.status) == -1) {
      this.router.navigate(['','thank_you'], { skipLocationChange: true, preserveQueryParams: true });
      return;
    }
    this.isCompleted = false;

    var start_date = this.commonService.newDate(this.simulation.start_date);
    var end_date = this.commonService.newDate(this.simulation.end_date);

    var days:number = (end_date.getTime() - start_date.getTime())/(24*3600*1000);

    this.total_days = new Array(days+1).fill(0);

    var temp_date = start_date;
    var temp_date = new Date(temp_date.setDate(temp_date.getDate() - 1));
    while(temp_date < end_date) {
      this.days.push(temp_date);
      var temp_date = new Date(temp_date.setDate(temp_date.getDate() + 1));
    }

    this.minutesPerDay = this.simulation.time/days;
    this.secondsPerDay = this.minutesPerDay * 60;

    this.secondsPassed = user_company_simulation.time_elapsed || 0;
    this.secondsRemainingInDay = this.secondsPerDay - (this.secondsPassed % this.secondsPerDay)

    this.day_count = Math.floor(this.secondsPassed / this.secondsPerDay) + 1;
    MasterData.setDayCount(this.day_count);

    this.today = new Date(start_date.getTime() + Math.floor(this.secondsPassed/this.secondsPerDay)*(24*3600*1000));
    this.todayString = this.commonService.formatDate(this.today);

    if(this.secondsPassed == 0) {
      this.commonService.alert(this.day_change_msg[1]);
    }
    this.router.navigate(['/base/0'], { skipLocationChange: true, preserveQueryParams: true });
    this.show_timer = true;
    this.setTimer();
  }

  setHeaderData(user_company_simulation) {
    var user_name = user_company_simulation.user.user.name || "-";
    var initials = "";
    if(user_name.split(" ").length > 1) {
      initials = (user_name.split(" ")[0].charAt(0)+user_name.split(" ")[1].charAt(0)).toUpperCase();
    } else {
      initials = (user_name.split(" ")[0].charAt(0)).toUpperCase();
    }
    this.candidate_name = user_name;
    this.candidate_name_initials = initials;
    this.company_name = user_company_simulation.company_simulation.company.company.name;
  }

  ngOnInit() {
    this.timer = "00:00";
    this.candidate_name_initials = "-";
  }

  hideError() {
    this.showError = false;
  }
}
