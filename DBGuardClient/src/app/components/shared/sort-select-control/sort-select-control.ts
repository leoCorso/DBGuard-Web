import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SortOption, SortValue } from '../../../interfaces/sorting';
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
