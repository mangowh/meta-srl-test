import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { InputComponent } from '../../components/input/input.component';
import { LinkComponent } from '../../components/link/link.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { SwapiService } from '../../services/swapi.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    PaginationComponent,
    InputComponent,
    SpinnerComponent,
    LinkComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private swapi = inject(SwapiService);

  search = input<string>();
  page = input<string>();

  ngOnInit() {
    this.searchControl.setValue(this.search() ?? '');
    this.currentPage.set(parseInt(this.page() ?? '1'));
  }

  isLoading = signal(false);
  error = signal(false);
  itemsPerPage = signal(10);

  currentPage = signal(1, { equal: () => false }); // voglio che il signal triggeri anche quando gli viene settato lo stesso valore
  currentPage$ = toObservable(this.currentPage);

  searchControl = new FormControl('', [
    Validators.maxLength(50),
    Validators.pattern('[a-zA-Z0-9 ]*'),
  ]);
  searchValue$ = this.searchControl.valueChanges.pipe(
    tap(() => this.currentPage.set(1)),
  );
  searchValue = toSignal(this.searchValue$);

  updateQueryParameters = effect(() => {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchValue(),
        page: this.currentPage(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  });

  planets$ = this.currentPage$.pipe(
    switchMap((currentPage) =>
      this.swapi.getPlanets$(currentPage, this.searchValue() ?? undefined),
    ),
    catchError(() => {
      this.error.set(true);
      return EMPTY;
    }),
    tap(() => this.isLoading.set(false)),
  );
  planets = toSignal(this.planets$);

  goToPreviousPage() {
    this.isLoading.set(true);

    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage() {
    this.isLoading.set(true);

    const totalPages = Math.ceil(
      (this.planets()?.count ?? 1) / this.itemsPerPage(),
    );
    this.currentPage.update((page) => Math.min(totalPages, page + 1));
  }

  goToExactPage($event: number) {
    this.isLoading.set(true);

    this.currentPage.set($event);
  }
}
