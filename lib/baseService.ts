import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse } from '@/types/api';

export default abstract class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected async get<RT = T>(url: string = '', params?: any): Promise<RT> {
    const response = await apiClient.get<ApiResponse<RT>>(`/${this.endpoint}${url}`, { params });
    return this.handleResponse(response);
  }

  protected async post<RT = T>(data: any, url: string = ''): Promise<RT> {
    const response = await apiClient.post<ApiResponse<RT>>(`/${this.endpoint}${url}`, data);
    return this.handleResponse(response);
  }

  protected async put<RT = T>(id: string | number, data: any): Promise<RT> {
    const response = await apiClient.put<ApiResponse<RT>>(`/${this.endpoint}/${id}`, data);
    return this.handleResponse(response);
  }

  protected async delete<RT = void>(id: string | number): Promise<RT> {
    const response = await apiClient.delete<ApiResponse<RT>>(`/${this.endpoint}/${id}`);
    return this.handleResponse(response);
  }
  private handleResponse<RT>(response: AxiosResponse<ApiResponse<RT>>): RT {
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'An error occurred');
  }
}
