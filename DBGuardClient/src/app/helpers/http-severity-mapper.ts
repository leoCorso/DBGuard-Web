import { HTTPAction } from "../enums/http-action";

export function getHttpSeverity(action: HTTPAction): 'success' | 'danger' | 'warn' {
    switch(action){
        case HTTPAction.Get:
            return 'success';
        case HTTPAction.Post:
            return 'warn';
        case HTTPAction.Put:
            return 'warn';
        case HTTPAction.Patch:
            return 'warn';
        case HTTPAction.Delete:
            return 'danger';
    }
}