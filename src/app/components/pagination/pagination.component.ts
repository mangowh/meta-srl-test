import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  currentPage = input.required<number>();
  itemsPerPage = input(10);
  itemsNum = input(100);

  firstNum = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  lastNum = computed(() =>
    Math.min(this.firstNum() + this.itemsPerPage() - 1, this.itemsNum()),
  );
  pagesNum = computed(() =>
    Math.max(Math.ceil(this.itemsNum() / this.itemsPerPage()), 1),
  );

  pages = computed(() =>
    Array(this.pagesNum())
      .fill(0)
      .map((x, i) => i + 1),
  );

  previousClick = output();
  nextClick = output();
  pageClick = output<number>();
}
