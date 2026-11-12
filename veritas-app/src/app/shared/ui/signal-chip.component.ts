import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SignalLabel } from '../../models';
import { SIGNAL_COPY } from '../signal-copy';

@Component({
  selector: 'app-signal-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [class]="'chip chip--' + copy().tone">{{ copy().chip }}</span>`,
})
export class SignalChipComponent {
  readonly label = input.required<SignalLabel>();
  protected readonly copy = computed(() => SIGNAL_COPY[this.label()]);
}
