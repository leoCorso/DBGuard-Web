import { Component, Input, input, model, OnInit, output } from '@angular/core';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { CreateHTTPGuardNotificationDTO, CreateHTTPGuardNotificationDTOWIndex } from '../../../../interfaces/notification-dto';
import { CreateNotification } from '../create-notification/create-notification';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpBodyType } from '../../../../enums/http-body-type';
import { HTTPAction } from '../../../../enums/http-action';
import { Textarea } from 'primeng/textarea';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { enumToOptions } from '../../../../helper-functions/enum-helper';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { Card } from 'primeng/card';
import { NotificationType } from '../../../../enums/notification-type';
import { mapToArray, mapToRecords } from '../../../../helper-functions/http-notification-record-helper';

@Component({
  selector: 'app-create-http-notification',
  imports: [InputTextModule, Textarea, InputGroup, InputGroupAddon, FloatLabel, Message, ReactiveFormsModule, Select, TableModule, FormsModule, Button, ButtonGroup, Card],
  templateUrl: './create-http-notification.html',
  styleUrl: './create-http-notification.scss',
})
export class CreateHttpNotification extends CreateNotification<CreateHTTPGuardNotificationDTO, CreateHTTPGuardNotificationDTOWIndex> implements OnInit {
  public httpForm = new FormGroup({
    url: new FormControl<string | null>(null, [Validators.required]),
    actionType: new FormControl<HTTPAction>(HTTPAction.Get, [Validators.required]),
    bodyType: new FormControl<HttpBodyType | null>(null),
    bodyData: new FormControl<string | null>(null)
  });
  public requestHeaderForm = new FormGroup({
    key: new FormControl<string | null>(null, [Validators.required]),
    value: new FormControl<string | null>(null)
  });
  public queryParameterForm = new FormGroup({
    key: new FormControl<string | null>(null, [Validators.required]),
    value: new FormControl<string | null>(null)
  })

  public requestHeaders: { key: string, value: string | null }[] = [];
  public clonedRequestHeaders: { key: string, value: string | null }[] = [];

  public queryParameters: { key: string, value: string | null }[] = [];
  public clonedQueryParameters: { key: string, value: string | null }[] = [];

  public bodyTypes = HttpBodyType;
  public httpActions = HTTPAction;
  public enumToOptions = enumToOptions;

  ngOnInit(): void {
    if(this.notificationToEdit()){
      this.httpForm.patchValue({
        url: this.notificationToEdit()?.url,
        actionType: this.notificationToEdit()?.actionType,
        bodyType: this.notificationToEdit()?.bodyType,
        bodyData: this.notificationToEdit()?.bodyData
      });
      const requestHeaders = this.notificationToEdit()?.requestHeaders;
      this.requestHeaders = requestHeaders ? this.mapToArray(requestHeaders) : [];
      const queryParams = this.notificationToEdit()?.queryParams;
      this.queryParameters = queryParams ? this.mapToArray(queryParams) : [];
    }
  }
  public override saveNotification(): void {
    const httpData = this.httpForm.value;
    if(this.notificationToEdit()){
      const editedNotification: CreateHTTPGuardNotificationDTOWIndex = {
        id: this.notificationToEdit()!.id,
        guardId: this.notificationToEdit()?.guardId,
        index: this.notificationToEdit()!.index,
        url: httpData.url!,
        actionType: httpData.actionType!,
        queryParams: this.mapToRecords(this.queryParameters),
        requestHeaders: this.mapToRecords(this.requestHeaders),
        bodyType: httpData.bodyType ?? undefined,
        bodyData: httpData.bodyData!,
        notificationType: NotificationType.Http,
        notificationProvider: this.notificationProvider()
      }
      this.notificationEdited.emit(editedNotification);
    }
    else {
      const newNotification: CreateHTTPGuardNotificationDTO = {
        url: httpData.url!,
        actionType: httpData.actionType!,
        queryParams: this.mapToRecords(this.queryParameters),
        requestHeaders: this.mapToRecords(this.requestHeaders),
        bodyType: httpData.bodyType ?? undefined,
        bodyData: httpData.bodyData!,
        notificationType: NotificationType.Http,
        notificationProvider: this.notificationProvider()
      };
      this.notificationAdded.emit(newNotification);
    }
  }
  public addKey(type: 'query' | 'header'): void {
    const form = type === 'query' ? this.queryParameterForm : this.requestHeaderForm;
    const values = type === 'query' ? this.queryParameterForm.value : this.requestHeaderForm.value;
    const list = type === 'query' ? this.queryParameters : this.requestHeaders;

    if(list.find(header => header.key === values.key)){
      return;
    }
    const newItem = {
      key: values.key!,
      value: values.value ?? null
    };
    list.push(newItem);
    form.reset();
  }
  public onKeyEditSave(header: {key: string, value: string | null}, rowIndex: number, type: 'query' | 'header'): void {
    const form = type === 'query' ? this.queryParameterForm : this.requestHeaderForm;
    const list = type === 'query' ? this.queryParameters : this.requestHeaders;
    const clonedList = type === 'query' ? this.clonedQueryParameters : this.clonedRequestHeaders;

    if(list.find((existingItem, index) => header.key === existingItem.key && index !== rowIndex)){
      this.onKeyEditCancel(header, rowIndex, type);
      return;
    }
    delete clonedList[rowIndex];
  }
  public onKeyEditInit(header: {key: string, value: string | null}, rowIndex: number, type: 'query' | 'header'): void {
    const clonedList = type === 'query' ? this.clonedQueryParameters : this.clonedRequestHeaders;
    clonedList[rowIndex] = {...header}; 
  }
  public onKeyEditCancel(header: {key: string, value: string | null}, rowIndex: number, type: 'query' | 'header'): void {
    const list = type === 'query' ? this.queryParameters : this.requestHeaders;
    const clonedList = type === 'query' ? this.clonedQueryParameters : this.clonedRequestHeaders;
    list[rowIndex] = clonedList[rowIndex];
    delete clonedList[rowIndex];
  }
  public onRemoveKey(rowIndex: number, type: 'query' | 'header'): void {
    const list = type === 'query' ? this.queryParameters : this.requestHeaders;
    const clonedList = type === 'query' ? this.clonedQueryParameters : this.clonedRequestHeaders;
    list.splice(rowIndex, 1);
    clonedList.splice(rowIndex, 1);
  }
  public mapToArray = mapToArray;
  public mapToRecords = mapToRecords;
}
