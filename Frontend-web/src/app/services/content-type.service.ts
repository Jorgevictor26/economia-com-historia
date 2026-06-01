import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContentTypeOption } from '../models/content-type.model';

@Injectable({ providedIn: 'root' })
export class ContentTypeService {
  private readonly http = inject(HttpClient);

  getAll(): Promise<ContentTypeOption[]> {
    return firstValueFrom(this.http.get<ContentTypeOption[]>('/content-types'));
  }
}
