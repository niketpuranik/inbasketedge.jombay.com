import{ Injectable, EventEmitter } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AlertDialogComponent, ConfirmDialogComponent } from '../components';

@Injectable()
export class CommonService {
  public confirmAccept: () => void;
  public confirmRejection: () => void;

  private snackBarRef: any;

  public alertDialogue: any;
  public confirmDialogue: any;

  public dayUpdated: EventEmitter<Object>;
  public readEmailUpdated: EventEmitter<Object>;


  constructor(
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    ) {
    this.dayUpdated = new EventEmitter();
    this.readEmailUpdated = new EventEmitter();
  }

  showSnackBar() {
    if(this.snackBarRef) {
    } else {
      this.snackBarRef = this.snackBar.open("Action saved", "", {
        duration: 2000
      });
      this.snackBarRef.afterDismissed().subscribe(() => {
        this.snackBarRef = null;
      });
    }
  }

	private showErrorSource = new Subject<any>();
	public showErrorCalled$ = this.showErrorSource.asObservable();

	showError(text: string) {
    this.showErrorSource.next(text);
  }

  confirm(content: string) {
    return new Promise<boolean>((resolve, reject) =>{
      this.confirmAccept = () => resolve(true);
      this.confirmRejection = () => resolve(false);

      this.confirmDialogue = this.dialog.open(ConfirmDialogComponent, {
        width: "350px",
        disableClose: true
      });
      let instance = this.confirmDialogue.componentInstance;
      instance.content = content;
    });
  };

  alert(content): any {
    this.alertDialogue = this.dialog.open(AlertDialogComponent,{
      width: "350px",
      disableClose: true
    });
    let instance = this.alertDialogue.componentInstance;
    instance.alert_content = content;
    return this.alertDialogue;
    // alert(content);
  }

	formatDate(date) {
    var options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    };
    return date.toLocaleDateString("en-US", options);
  }

  newDate(dateString): Date {
    var date = new Date(dateString);
    var offSet = date.getTimezoneOffset();
    var secDiffernce = offSet - (-330);
    date.setSeconds(date.getSeconds() + (secDiffernce*60));
    return date;
  }
  removeOffsetDiff(dateString): Date {
    var date = new Date(dateString);
    var offSet = date.getTimezoneOffset();
    var secDiffernce = offSet - (-330);
    date.setSeconds(date.getSeconds() - (secDiffernce*60));
    return date;
  }
}
