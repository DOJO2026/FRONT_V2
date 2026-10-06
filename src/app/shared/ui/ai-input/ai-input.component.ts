import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AiIconComponent, IconName } from '../ai-icon/ai-icon.component';

export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ai-input',
  standalone: true,
  imports: [AiIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AiInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label [attr.for]="inputId()" class="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-[var(--color-danger)]">*</span>
          }
        </label>
      }

      <div [class]="containerClasses()">
        @if (iconPrefix()) {
          <div class="text-[var(--color-text-muted)] flex items-center pl-3 flex-shrink-0">
            <ai-icon [name]="iconPrefix()!" [size]="iconSize()" />
          </div>
        }

        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readOnly]="readonly()"
          [value]="value()"
          (input)="onInputChange($event)"
          (keydown.enter)="onEnterPressed($event)"
          (blur)="onBlur()"
          class="w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none py-2 px-3 disabled:cursor-not-allowed"
        />

        @if (clearable() && value() && !disabled()) {
          <button
            type="button"
            (click)="clearValue()"
            class="text-[var(--color-text-muted)] hover:text-white pr-3 flex items-center transition-colors cursor-pointer"
            aria-label="Limpiar campo"
          >
            <ai-icon name="x" [size]="14" />
          </button>
        }

        @if (iconSuffix()) {
          <div class="text-[var(--color-text-muted)] flex items-center pr-3 flex-shrink-0">
            <ai-icon [name]="iconSuffix()!" [size]="iconSize()" />
          </div>
        }
      </div>

      @if (errorMessage()) {
        <span class="text-xs text-[var(--color-danger)] font-medium flex items-center gap-1 animate-cascade-in">
          {{ errorMessage() }}
        </span>
      } @else if (helperText()) {
        <span class="text-xs text-[var(--color-text-muted)]">
          {{ helperText() }}
        </span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `
})
export class AiInputComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly size = input<InputSize>('md');
  readonly iconPrefix = input<IconName | null>(null);
  readonly iconSuffix = input<IconName | null>(null);
  readonly clearable = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly required = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly inputId = input<string>(`ai-input-${Math.random().toString(36).substring(2, 9)}`);

  readonly value = model<string>('');

  readonly enter = output<string>();
  readonly cleared = output<void>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? 14 : this.size() === 'lg' ? 20 : 16));

  protected readonly containerClasses = computed(() => {
    const base =
      'relative flex items-center w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] border transition-all duration-200';

    const stateClasses = this.errorMessage()
      ? 'border-[var(--color-danger)] focus-within:border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20'
      : 'border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 hover:border-slate-600';

    const disabledClasses = this.disabled() ? 'opacity-50 cursor-not-allowed bg-slate-900/50' : '';

    return `${base} ${stateClasses} ${disabledClasses}`;
  });

  protected onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  protected onEnterPressed(event: Event): void {
    event.preventDefault();
    this.enter.emit(this.value());
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected clearValue(): void {
    this.value.set('');
    this.onChange('');
    this.cleared.emit();
  }

  writeValue(value: string | null): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Disabled state handled via input signal or form binding
  }
}
