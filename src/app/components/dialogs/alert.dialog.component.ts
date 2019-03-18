import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  templateUrl: '../../templates/dialogs/alert.html',
})
export class AlertDialogComponent {
	public alert_content:string;

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>
    ) {
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
