import { GuardState } from "../enums/guard-state";

export function getGuardStateSeverity(guardState: GuardState): 'success' | 'info' | 'danger' | 'warn' {
    switch(guardState){
      case GuardState.Triggered:
        return 'warn'
      case GuardState.Clear:
        return 'success'
      case GuardState.Error:
        return 'danger'
      case GuardState.Unknown:
        return 'info';
    }
  }