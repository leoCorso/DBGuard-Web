import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-consent-dialog',
  imports: [Button, ButtonGroup],
  templateUrl: './consent-dialog.html',
  styleUrl: './consent-dialog.scss',
})
export class ConsentDialog {
  public dialogRef = inject(DynamicDialogRef);
}
