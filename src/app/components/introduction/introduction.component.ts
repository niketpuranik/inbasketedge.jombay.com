import { Component, OnInit } from '@angular/core';
import * as MasterData from '../../master_data';

@Component({
  selector: 'introduction',
  templateUrl: '../../templates/introduction/introduction.component.html'
})

export class IntroductionComponent implements OnInit{

  public simulation: any;
  constructor() { }

  ngOnInit() {
    this.simulation = MasterData.SIMULATION;
  }
}
