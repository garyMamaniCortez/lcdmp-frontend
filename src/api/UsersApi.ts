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

export class UsersApi implements IUsersApi {
  
  async getUsers(searchTerm: string = ''): Promise<User[]> {
    try {
      const response = await api.get('/users', {
        params: { search: searchTerm || undefined }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener usuarios');
      }

      return response.data.data as User[];
    } catch (error: any) {
      console.error('Error en getUsers:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async createUser(user: CreateUser): Promise<void> {
    try {
      const response = await api.post('/users', user);

      if (!response.data.success && response.status !== 201) {
        throw new Error(response.data.message || 'Error al crear usuario');
      }
    } catch (error: any) {
      console.error('Error en createUser:', error);
      const message = error.response?.data?.message || error.message || 'Error al crear usuario';
      throw new Error(message);
    }
  }

  async editUser(id: string, user: Partial<CreateUser>): Promise<void> {
    try {
      const response = await api.put(`/users/${id}`, user);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar usuario');
      }
    } catch (error: any) {
      console.error('Error en editUser:', error);
      const message = error.response?.data?.message || error.message || 'Error al actualizar usuario';
      throw new Error(message);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await api.delete(`/users/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar usuario');
      }
    } catch (error: any) {
      console.error('Error en deleteUser:', error);
      const message = error.response?.data?.message || error.message || 'Error al eliminar usuario';
      throw new Error(message);
    }
  }

  async toggleUserStatus(id: string): Promise<void> {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al cambiar estado del usuario');
      }
    } catch (error: any) {
      console.error('Error en toggleUserStatus:', error);
      const message = error.response?.data?.message || error.message || 'Error al cambiar estado del usuario';
      throw new Error(message);
    }
  }
}

export const defaultUsersApi = new UsersApi();