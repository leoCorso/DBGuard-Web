import { Validators, FormControl } from '@angular/forms';

export function isValidEmail(email: string): boolean {
      const control = new FormControl(email, Validators.email);
     return control.valid;
}