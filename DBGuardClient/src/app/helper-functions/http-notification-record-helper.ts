export function mapToArray(records: Record<string, string | null>): {key: string, value: string | null}[] {
    return Object.entries(records).map(([key, value]) => ({key: key, value: value}));
}
export function mapToRecords(elements: {key: string, value: string | null}[]): Record<string, string | null> {
    return elements.reduce((acc, {key, value}) => ({...acc,[key]:value}), {} as Record<string, string | null>);
}