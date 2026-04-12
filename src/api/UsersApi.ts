import { User, CreateUser } from '@/types';
import api from '@/api/api';
import { mockUsers } from '@/data/mockData';

export interface IUsersApi {
  getUsers(searchTerm?: string): Promise<User[]>;
  createUser(user: CreateUser): Promise<void>;
  editUser(id: string, user: Partial<CreateUser>): Promise<void>;
  deleteUser(id: string): Promise<void>;
  toggleUserStatus(id: string): Promise<void>;
}

export class MockUsersApi implements IUsersApi {
  private users: User[] = mockUsers.map(user => ({ ...user, isActive: true }));

  async getUsers(searchTerm: string = ''): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...this.users];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  async createUser(userData: CreateUser): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      username: userData.username,
      roles: userData.roles,
      isActive: true
    };
    
    this.users.push(newUser);
    console.log('Mock user created:', newUser);
  }

  async editUser(id: string, userData: Partial<CreateUser>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...(userData.name && { name: userData.name }),
      ...(userData.username && { username: userData.username }),
      ...(userData.roles && { roles: userData.roles })
    };
    
    console.log('Mock user updated:', this.users[userIndex]);
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    this.users = this.users.filter(u => u.id !== id);
    console.log('Mock user deleted:', id);
  }

  async toggleUserStatus(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    this.users[userIndex].isActive = !this.users[userIndex].isActive;
    console.log('Mock user status toggled:', this.users[userIndex]);
  }
}

export const defaultUsersApi = new MockUsersApi();