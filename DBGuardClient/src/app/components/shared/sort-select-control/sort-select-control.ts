import { Component, forwardRef, input, model, OnDestroy, OnInit, signal } from '@angular/core';
import { SortOption, SortValue } from '../../../interfaces/sorting';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-sort-select-control',
  imports: [Select, Button, FormsModule, FloatLabel, InputGroup, InputGroupAddon, TooltipModule],
  templateUrl: './sort-select-control.html',
  styleUrl: './sort-select-control.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SortSelectControl),
      multi: true
    }
  ]
})
export class SortSelectControl implements ControlValueAccessor {
  public sortOptions = input.required<SortOption[]>();
  
  public disabled = signal<boolean>(false);
  public sortValue = signal<SortValue | undefined>(undefined);
  public sortOption = signal<SortOption | undefined>(undefined);
  private onChange: (value: SortValue | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  registerOnChange(fn: (sort: SortValue | undefined) => void): void {
    this.onChange = fn;
  }
  writeValue(obj: SortValue): void {
    const sortOption = this.sortOptions().find(option => option.field === obj.field);
    this.sortOption.set(sortOption);
    this.sortValue.set(obj);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
  
  public getIcon(): string {
    return this.sortValue()?.order === 1 ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }
  public toggleSortDirection(): void {
    this.sortValue.update(sort => sort ? {...sort, order: sort.order === 1 ? -1 : 1} : sort);
    this.onChange(this.sortValue());
  }
  public onFieldSortChanged(): void {
    const field = this.sortOption()!.field;
    this.sortValue.update(sort => sort ? {...sort,field: field} : sort);
    this.onChange(this.sortValue());
  }
}
