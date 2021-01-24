import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.less']
})
export class DialogMessageComponent {
  description: string;

  constructor(
      @Inject(MAT_DIALOG_DATA) private data: any,
      private dialogRef: MatDialogRef<DialogMessageComponent>) {
    if (data) {
      this.description = data.description || this.description;
    }
    this.dialogRef.updateSize('300vw', '300vw');
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
