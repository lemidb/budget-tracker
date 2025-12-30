import BaseService from '../baseService';
import { User } from '@/app/types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  async getCurrentUser() {
    return this.get<User>('/me');
  }

  async updateUser(userId: string | number, data: UpdateUserData) {
    return this.put<User>(userId, data);
  }

  // create user
  async createUser(data: CreateUserData) {
    return this.post<User>(data,'');
  }

}

export const userService = new UserService();
