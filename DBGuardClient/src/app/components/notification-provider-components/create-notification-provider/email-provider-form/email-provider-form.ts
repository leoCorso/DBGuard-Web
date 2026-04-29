import { Component, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateEmailNotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { NotificationType } from '../../../../enums/notification-type';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-email-provider-form',
  imports: [InputText, InputNumber, FloatLabel, ReactiveFormsModule, Message, Password, Button, Checkbox, TooltipModule],
  templateUrl: './email-provider-form.html',
  styleUrl: './email-provider-form.scss',
})
export class EmailProviderForm implements OnInit {
  public emailProviderToEdit = input<CreateEmailNotificationProviderDTO>();

  public createEmailProvider = output<CreateEmailNotificationProviderDTO>();
  public emailProviderForm = new FormGroup({
    smtpServer: new FormControl<string | null>(null, [Validators.required]),
    port: new FormControl<number>(587, [Validators.required]),
    username: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, [Validators.required]),
    senderEmail: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    verifyProvider: new FormControl<boolean>(true)
  });
  ngOnInit(): void {
    if(this.emailProviderToEdit()){
      this.emailProviderForm.patchValue(this.emailProviderToEdit()!);
    }
  }
  public addEmailProvider(): void {
    const values = this.emailProviderForm.value;
    if(!values){
      return;
    }
    const provider: CreateEmailNotificationProviderDTO = {
      id: this.emailProviderToEdit()?.id,
      smtpServer: values.smtpServer!,
      port: values.port!,
      username: values.username!,
      password: values.password!,
      providerType: NotificationType.Email,
      senderEmail: values.senderEmail!,
      verifyProvider: values.verifyProvider!
    };
    this.createEmailProvider.emit(provider);
  }
}
