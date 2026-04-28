import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Password } from "primeng/password";

export function passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const password = group.get('password');
        const confirmPassword = group.get('confirmPassword');
        if(password?.pristine || confirmPassword?.pristine){
            return null;
        }
        return password?.value === confirmPassword?.value ? null : { passwordMismatch: true }
    }
}