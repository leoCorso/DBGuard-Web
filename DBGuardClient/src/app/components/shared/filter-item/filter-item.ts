import { Component, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MultiSelect } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { FilterConfig, FilterOperator, FilterValue, NumberFilterOperators, TextFilterOperators } from '../../../interfaces/filters';
import { CommonModule } from '@angular/common';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'app-filter-item',
  imports: [Select, ReactiveFormsModule, FormsModule, MultiSelect, DatePicker, InputText, SelectButton, CommonModule, Slider],
  templateUrl: './filter-item.html',
  styleUrl: './filter-item.scss',
})
export class FilterItem {
  // State
  public filterConfig = input.required<FilterConfig>(); // Filter config input
  public filterValueChanged = output<FilterValue>(); // Emitter when filter value or operator changes
  // Data
  public textFilterOperators = TextFilterOperators;
  public numberFilterOperators = NumberFilterOperators;
  // Forms
  public formControl = new FormControl(); // Filter value control
  public selectedFilterOperator = new FormControl<FilterOperator | null>(null); // Filter operator control

  // Component properties
  private destroy = new Subject<void>();

  ngOnInit(): void {
    this.initFilters();
    this.initListeners();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  public initFilters(): void {
    if (!this.formControl.pristine) {
      this.formControl.reset();
    }
    if (!this.selectedFilterOperator.pristine) {
      this.selectedFilterOperator.reset();
    }
    switch (this.filterConfig().type) {
      case 'range':
        this.formControl.patchValue([this.filterConfig().valueRange?.startValue, this.filterConfig().valueRange?.endValue])
        break;
      case 'text':
        this.selectedFilterOperator.patchValue(<FilterOperator>{ operator: '@=*', operatorLabel: 'Contains' });
        break;
      case 'numeric':
        this.selectedFilterOperator.patchValue(<FilterOperator>{ operator: '==', operatorLabel: 'Equals' });
        break;
      case 'datetime':
        this.selectedFilterOperator.patchValue(<FilterOperator>{ operator: '==', operatorLabel: 'Equals' });
        break;
    }
  }
  private initListeners(): void {
    // Listen for changes when input value changes
    this.formControl.valueChanges.pipe(takeUntil(this.destroy), debounceTime(500), distinctUntilChanged()).subscribe((value: any) => {
      this.filterValueChanged.emit(<FilterValue>{
        field: this.filterConfig().field,
        value: value,
        operator: this.filterConfig().type === 'text' || this.filterConfig().type === 'numeric' || this.filterConfig().type === 'datetime' ? this.selectedFilterOperator.value?.operator : this.filterConfig().customOperator,
        type: this.filterConfig().type
      });
    });
    // Listen to changes when operator changes
    this.selectedFilterOperator.valueChanges.pipe(takeUntil(this.destroy), debounceTime(500), distinctUntilChanged()).subscribe((operator: FilterOperator | null) => {
      if (operator && this.formControl.value) {
        this.filterValueChanged.emit(<FilterValue>{
          field: this.filterConfig().field,
          value: this.formControl.value,
          operator: this.filterConfig().type === 'text' || this.filterConfig().type === 'numeric' || this.filterConfig().type === 'datetime' ? operator.operator : this.filterConfig().customOperator,
          type: this.filterConfig().type
        });
      }
    });
  }
  public readonly multiSelectPt: any = {
    hiddenInput: {
      inputmode: 'none',
      readonly: true,
    }
  };
}
