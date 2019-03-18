import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter } from '@angular/core';
import * as MasterData from '../master_data';

@Component({
  selector: 'background-information',
  templateUrl: '../templates/background_info.component.html'
})

export class BackgroundInfoComponent implements OnInit{

  @Input() show_cta: boolean = false;
  @Output() parentNext = new EventEmitter<string>();

  public instructions: string;
  public backgroundInstructions: any = [];
  public backgroundInstructionsIndex: number = 0;

  constructor( ) { }

  ngOnInit() {
    if(MasterData.SIMULATION) {
      this.backgroundInstructions = MasterData.SIMULATION.background_instructions;
    }
  }

  previousBackgroundInstruction() {
    this.backgroundInstructionsIndex > 0 ? --this.backgroundInstructionsIndex : this.backgroundInstructionsIndex = 0;
  }

  nextBackgroundInstruction() {
    this.backgroundInstructionsIndex < (this.backgroundInstructions.length - 1) ? ++this.backgroundInstructionsIndex : this.backgroundInstructionsIndex = (this.backgroundInstructions.length - 1);
  }

  updateImageUrl(event) {
    event.srcElement.src = event.src;
  }

  next() {
    this.parentNext.next();
  }

}
