import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface BackendRole {
  id: number | string;
  name: string;
}

export interface BackendManagedUser {
  id: number | string;
  name: string;
  email: string;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  jindungo_subscription_expires_at?: string | null;
  roles?: BackendRole[];
}

interface MutationResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface AdminUserPage {
  data: BackendManagedUser[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface CreateSuperAdminPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);

  async getAll(options: { search?: string; perPage?: number } = {}): Promise<AdminUserPage> {
    let params = new HttpParams().set('per_page', options.perPage ?? 100);

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    const response = await firstValueFrom(
      this.http.get<PaginatedResponse<BackendManagedUser>>('/users', { params }),
    );

    return {
      data: response.data,
      pagination: {
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        perPage: response.per_page ?? response.data.length,
        total: response.total ?? response.data.length,
      },
    };
  }

  async promoteToWriter(userId: string | number): Promise<BackendManagedUser> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendManagedUser>>(`/users/${userId}/roles/writer`, {}),
    );

    return response.data;
  }

  async promoteToAdmin(userId: string | number): Promise<BackendManagedUser> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendManagedUser>>(`/users/${userId}/roles/admin`, {}),
    );

    return response.data;
  }

  async promoteToSuperAdmin(userId: string | number): Promise<BackendManagedUser> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendManagedUser>>(`/users/${userId}/roles/super-admin`, {}),
    );

    return response.data;
  }

  async createSuperAdmin(payload: CreateSuperAdminPayload): Promise<BackendManagedUser> {
    const response = await firstValueFrom(
      this.http.post<MutationResponse<BackendManagedUser>>('/users/super-admin', payload),
    );

    return response.data;
  }
}
