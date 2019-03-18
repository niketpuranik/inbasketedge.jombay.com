import { Component, OnInit } from '@angular/core';
import * as MasterData from '../master_data';

@Component({
  templateUrl: '../templates/background_info.component.html',
})

export class BackgroundInfoComponent implements OnInit{
  public instructions: string;

  constructor(
    ) {
  }

  ngOnInit() {
  }
}
