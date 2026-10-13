import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Как Validators.required, но строка из одних пробелов тоже считается пустой. */
export function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value?.trim() ? null : { required: true };
}

/** Параметр маршрута «new» или числовой id сущности. */
export function parseEntityId(id: string | undefined): number | null {
  return id === undefined || id === 'new' ? null : Number(id);
}
