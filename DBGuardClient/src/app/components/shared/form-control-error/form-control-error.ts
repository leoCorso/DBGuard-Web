import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-form-control-error',
  imports: [Message],
  templateUrl: './form-control-error.html',
  styleUrl: './form-control-error.scss',
})
export class FormControlError {
 // Inputs
  public formControlInput = input.required<AbstractControl<any> | null>();
  public customMessage = input<{key: string, message: string}[]>();

  public getControlErrors(): string[] {
    if(this.formControlInput()?.pristine || !this.formControlInput()?.touched){
      return [];
    }
    const errors = this.formControlInput()?.errors;
    const errorMessages: string[] = [];
    if(errors){
      const errorsIterator = Object.entries(errors);
      errorsIterator.forEach(([key, value]) => {
        let message = '';
        if(this.customMessage() && this.hasKey(key)){
          message = this.getMessage(key);
        }
        else {
          message = `${key} ${value}`;
        }
        errorMessages.push(message);
      });
      return errorMessages;
    }
    else {
      return errorMessages;
    }
  }
  private hasKey(key: string): boolean {
    return this.customMessage()?.some(customMsg => customMsg.key === key) ?? false;
  }
  private getMessage(key: string): string {
    return this.customMessage()?.find(customMsg => customMsg.key === key)?.message ?? "Invalid control";
  }
}
