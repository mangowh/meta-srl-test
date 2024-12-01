import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  id = Math.random();
  control = input.required<FormControl>();
  label = input<string>();
  type = input<HTMLInputElement['type']>('text');
  autocomplete = input<HTMLInputElement['autocomplete']>('off');
  placeholder = input<string>('');
  innerClass = input<string>();
}
