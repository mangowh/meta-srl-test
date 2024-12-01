import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, map, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { DOCUMENT } from '@angular/common';

interface Collection<T> {
  count: number;
  next: string;
  previous: string | null;
  results: Array<T>;
}

interface Planet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: Array<string>;
  films: Array<string>;
  created: string;
  edited: string;
  url: string;

  extends?: {
    films$: Observable<Film>[];
  };
}

interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
  created: string;
  edited: string;
  url: string;
}

type Resource = Collection<Planet> | Planet | Collection<Film> | Film;

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private dom = inject(DOCUMENT);
  private http = inject(HttpClient);
  /**
   * Cache per prevenire di ricaricare le stesse risorse più volte in modalità sviluppo
   */
  private obsCache = new Map<string, Observable<Resource>>();
  private readonly LOCAL_STORAGE_KEY = 'planets-cache';

  constructor() {
    if (environment.cacheResources) {
      this.loadCache();
    }
  }

  getFilms$() {
    return this.getSwapiResource$<Collection<Film>>(
      'https://swapi.dev/api/films/',
    );
  }

  getPlanets$(page = 1, search?: string) {
    const params: { [key: string]: number | string } = {
      page,
    };

    if (search) {
      params['search'] = search;
    }

    return this.getSwapiResource$<Collection<Planet>>(
      'https://swapi.dev/api/planets/',
      params,
    ).pipe(
      map((planets) => {
        planets.results = planets.results.map((result) => ({
          ...result,
          extends: {
            films$: result.films.map((film) => this.getSwapiResource$(film)),
          },
        }));

        return planets;
      }),
    );
  }

  /**
   * Recupera una risorsa con capacità di caching
   * @param uri
   * @returns
   */
  getSwapiResource$<T extends Resource>(
    uri: string,
    params?: { [key: string]: string | number },
  ): Observable<T> {
    const cacheKey = uri + (params ? JSON.stringify(params) : '');

    const retrievedCacheResource = this.obsCache.get(cacheKey);
    if (retrievedCacheResource) {
      return retrievedCacheResource as Observable<T>;
    }

    const obs = this.http.get<T>(uri, { params }).pipe(shareReplay());

    this.obsCache.set(cacheKey, obs);

    if (environment.cacheResources) {
      this.syncCache();
    }

    return obs;
  }

  /**
   * Sync della cache su localStorage
   */
  private async syncCache() {
    const obsCacheArr = Array.from(this.obsCache.entries());

    const cacheObj = await obsCacheArr.reduce<
      Promise<{ [key: string]: Resource }>
    >(async (accPromise, [key, value]) => {
      const acc = await accPromise;

      acc[key] = await lastValueFrom(value);

      return accPromise;
    }, Promise.resolve({}));

    this.dom.defaultView?.localStorage?.setItem(
      this.LOCAL_STORAGE_KEY,
      JSON.stringify(cacheObj),
    );
  }

  /**
   * Recupero cache da localStorage
   */
  private loadCache(): void {
    const serializedCache = this.dom.defaultView?.localStorage?.getItem(
      this.LOCAL_STORAGE_KEY,
    );
    if (serializedCache) {
      const parsedCache: {
        [key: string]: Resource;
      } = JSON.parse(serializedCache);
      const now = Date.now();

      for (const [key, value] of Object.entries(parsedCache)) {
        const observable = of(value);
        this.obsCache.set(key, observable);
      }
    }
  }
}
