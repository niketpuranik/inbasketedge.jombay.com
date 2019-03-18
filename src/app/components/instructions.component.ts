import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter } from '@angular/core';
import * as MasterData from '../master_data';
import { CommonService } from '../services';

@Component({
  selector: 'instructions',
  templateUrl: '../templates/instructions.component.html'
})

export class InstructionsInfoComponent implements OnInit {
  @Input() show_cta: boolean = false;
  @Output() parentFinishOnboarding = new EventEmitter<string>();

  public instructionsIndex: number = 0;
  public company_name: string = "";
  public number_of_days: number;
  public total_duration: number;
  public min_per_day: number;
  public background_info: string = "";
  public backgroundInstructions: string = "";

  constructor(
    private commonService: CommonService,
   ) { }

  ngOnInit() {
    this.setInstructionsData()
  }

  finishOnboarding() {
    this.parentFinishOnboarding.next();
  }

  setInstructionsData() {
    var user_company_simulation = MasterData.USER_COMPANY_SIMULATION;
    var simulation = user_company_simulation.company_simulation.simulation;

    var endTime = this.commonService.newDate(simulation.end_date).getTime();
    var startTime = this.commonService.newDate(simulation.start_date).getTime();

    var days:number = (endTime - startTime)/(24*3600*1000);

    this.company_name = user_company_simulation.company_simulation.company.company.name;

    this.number_of_days = days;
    this.total_duration = simulation.time;
    this.min_per_day = this.total_duration/days;
    this.background_info = MasterData.SIMULATION.description;
    this.backgroundInstructions = MasterData.SIMULATION.background_instructions;
  }

  previousInstruction() {
    this.instructionsIndex > 0 ? --this.instructionsIndex : this.instructionsIndex = 0;
  }

  nextInstruction() {
    this.instructionsIndex < 5 ? ++this.instructionsIndex : this.instructionsIndex = 5;
  }

  updateImageUrl(event) {
    event.srcElement.src = event.src;
  }
}
