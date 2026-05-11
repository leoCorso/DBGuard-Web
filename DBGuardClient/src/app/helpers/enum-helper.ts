import { SelectOption } from "../interfaces/filters";

export function enumToOptions<T extends Record<string, string | number>>(
  enumObj: T,
  labelMap?: Partial<Record<keyof T, string>>  // optional custom labels
): SelectOption[] {
  return Object.entries(enumObj)
    .filter(([, value]) => typeof value === 'number') // filter out reverse mappings
    .map(([key, value]) => ({
      label: labelMap?.[key as keyof T] ?? formatEnumKey(key),
      value: value as number
    }));
}

// Converts "GreaterThanOrEqualTo" → "Greater Than Or Equal To"
export function formatEnumKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').trim();
}

export function getEnumLabel<T extends Record<string, string | number>>(enumObj: T, value: number): string {
    const key = Object.entries(enumObj)
        .find(([, v]) => v === value)?.[0];
    
    return key ?? value.toString();
}
