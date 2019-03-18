import { Component } from '@angular/core';
import { CommonService } from '../../services';
import { MatDialogRef } from '@angular/material';

@Component({
  templateUrl: '../../templates/dialogs/confirm.html',
})
export class ConfirmDialogComponent {

	public content:string;

  constructor(
    public commonService: CommonService,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  confirm() {
    this.commonService.confirmAccept();
  }
  reject() {
    this.cancel();
    this.commonService.confirmRejection();
  }
}

