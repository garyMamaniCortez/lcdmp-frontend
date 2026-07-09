import api from '@/api/api';
import type { 
  RawMaterial, 
  BakedProduct,
  Category 
} from '@/types';
import { inventoryCategories } from '@/types/consts';

export interface IInventoryApi {
  getRawMaterials(filters?: RawMaterialFilters): Promise<RawMaterial[]>;
  getRawMaterialById(id: string): Promise<RawMaterial>;
  createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterial>;
  updateRawMaterial(id: string, data: Partial<RawMaterial>): Promise<RawMaterial>;
  deleteRawMaterial(id: string): Promise<void>;
  adjustRawMaterialStock(id: string, quantity: number): Promise<RawMaterial>;
  
  getBakedProducts(filters?: BakedProductFilters): Promise<BakedProduct[]>;
  getBakedProductById(id: string): Promise<BakedProduct>;
  createBakedProduct(data: CreateBakedProductData): Promise<BakedProduct>;
  updateBakedProduct(id: string, data: Partial<BakedProduct>): Promise<BakedProduct>;
  deleteBakedProduct(id: string): Promise<void>;
  adjustBakedProductStock(id: string, quantity: number): Promise<BakedProduct>;
  
  getCategories(): Promise<Category[]>;
  
  getLowStockItems(): Promise<LowStockSummary>;
}

export interface RawMaterialFilters {
  category?: string;
  searchTerm?: string;
  lowStockOnly?: boolean;
}

export interface BakedProductFilters {
  type?: string;
  searchTerm?: string;
  lowStockOnly?: boolean;
}

export interface CreateRawMaterialData {
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  category: string;
}

export interface CreateBakedProductData {
  name: string;
  type: 'cake_base' | 'cupcake' | 'cookie' | 'bread' | 'pastry';
  quantity: number;
  minStock: number;
  expiresAt?: Date;
}

export interface LowStockSummary {
  rawMaterials: RawMaterial[];
  bakedProducts: BakedProduct[];
  totalLowStock: number;
}

export class MockInventoryApi implements IInventoryApi {
  private rawMaterials: RawMaterial[] = [];
  private bakedProducts: BakedProduct[] = [];
  private categories: Category[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Datos de ejemplo para materias primas
    this.rawMaterials = [
      {
        id: '1',
        name: 'Harina de Trigo',
        unit: 'kg',
        quantity: 50,
        minStock: 10,
        category: 'flour',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Azúcar Blanca',
        unit: 'kg',
        quantity: 30,
        minStock: 8,
        category: 'sugar',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Leche Entera',
        unit: 'L',
        quantity: 15,
        minStock: 5,
        category: 'dairy',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Huevos',
        unit: 'unidad',
        quantity: 120,
        minStock: 24,
        category: 'eggs',
        lastUpdated: new Date()
      },
      {
        id: '5',
        name: 'Chocolate en Polvo',
        unit: 'kg',
        quantity: 5,
        minStock: 3,
        category: 'flavoring',
        lastUpdated: new Date()
      }
    ];

    // Datos de ejemplo para productos horneados
    this.bakedProducts = [
      {
        id: '1',
        name: 'Bizcocho de Vainilla',
        type: 'cake_base',
        quantity: 8,
        minStock: 3,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Cupcakes de Chocolate',
        type: 'cupcake',
        quantity: 15,
        minStock: 6,
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Galletas de Mantequilla',
        type: 'cookie',
        quantity: 12,
        minStock: 5,
        createdAt: new Date()
      }
    ];

    // Datos de ejemplo para categorías
    this.categories = [
      { id: 'flour', name: 'Harinas', type: 'raw_material' },
      { id: 'dairy', name: 'Lácteos', type: 'raw_material' },
      { id: 'eggs', name: 'Huevos', type: 'raw_material' },
      { id: 'sugar', name: 'Azúcares', type: 'raw_material' },
      { id: 'flavoring', name: 'Saborizantes', type: 'raw_material' },
      { id: 'decoration', name: 'Decoración', type: 'raw_material' },
      { id: 'other', name: 'Otros', type: 'raw_material' }
    ];
  }

  // Simular delay de red
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // MÉTODOS PARA MATERIAS PRIMAS
  // ============================================

  async getRawMaterials(filters?: RawMaterialFilters): Promise<RawMaterial[]> {
    await this.delay(300);
    
    let filtered = [...this.rawMaterials];
    
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(m => m.category === filters.category);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(m => 
          m.name.toLowerCase().includes(term)
        );
      }
      
      if (filters.lowStockOnly) {
        filtered = filtered.filter(m => m.quantity <= m.minStock);
      }
    }
    
    return filtered;
  }

  async getRawMaterialById(id: string): Promise<RawMaterial> {
    await this.delay(200);
    
    const material = this.rawMaterials.find(m => m.id === id);
    if (!material) {
      throw new Error('Materia prima no encontrada');
    }
    
    return material;
  }

  async createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterial> {
    await this.delay(300);
    
    const newMaterial: RawMaterial = {
      id: String(Date.now()),
      name: data.name,
      unit: data.unit,
      quantity: data.quantity || 0,
      minStock: data.minStock || 0,
      category: data.category,
      lastUpdated: new Date()
    };
    
    this.rawMaterials.push(newMaterial);
    console.log('Mock raw material created:', newMaterial);
    return newMaterial;
  }

  async updateRawMaterial(id: string, data: Partial<RawMaterial>): Promise<RawMaterial> {
    await this.delay(300);
    
    const index = this.rawMaterials.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Materia prima no encontrada');
    }
    
    this.rawMaterials[index] = {
      ...this.rawMaterials[index],
      ...data,
      lastUpdated: new Date()
    };
    
    console.log('Mock raw material updated:', this.rawMaterials[index]);
    return this.rawMaterials[index];
  }

  async deleteRawMaterial(id: string): Promise<void> {
    await this.delay(300);
    
    const index = this.rawMaterials.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Materia prima no encontrada');
    }
    
    this.rawMaterials.splice(index, 1);
    console.log('Mock raw material deleted:', id);
  }

  async adjustRawMaterialStock(id: string, quantity: number): Promise<RawMaterial> {
    await this.delay(300);
    
    const material = await this.getRawMaterialById(id);
    const newQuantity = Math.max(0, material.quantity + quantity);
    
    return this.updateRawMaterial(id, { quantity: newQuantity });
  }

  // ============================================
  // MÉTODOS PARA PRODUCTOS HORNEADOS
  // ============================================

  async getBakedProducts(filters?: BakedProductFilters): Promise<BakedProduct[]> {
    await this.delay(300);
    
    let filtered = [...this.bakedProducts];
    
    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(p => p.type === filters.type);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term)
        );
      }
      
      if (filters.lowStockOnly) {
        filtered = filtered.filter(p => p.quantity <= p.minStock);
      }
    }
    
    return filtered;
  }

  async getBakedProductById(id: string): Promise<BakedProduct> {
    await this.delay(200);
    
    const product = this.bakedProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Producto horneado no encontrado');
    }
    
    return product;
  }

  async createBakedProduct(data: CreateBakedProductData): Promise<BakedProduct> {
    await this.delay(300);
    
    const newProduct: BakedProduct = {
      id: String(Date.now()),
      name: data.name,
      type: data.type,
      quantity: data.quantity || 0,
      minStock: data.minStock || 0,
      expiresAt: data.expiresAt,
      createdAt: new Date()
    };
    
    this.bakedProducts.push(newProduct);
    console.log('Mock baked product created:', newProduct);
    return newProduct;
  }

  async updateBakedProduct(id: string, data: Partial<BakedProduct>): Promise<BakedProduct> {
    await this.delay(300);
    
    const index = this.bakedProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Producto horneado no encontrado');
    }
    
    this.bakedProducts[index] = {
      ...this.bakedProducts[index],
      ...data,
      createdAt: this.bakedProducts[index].createdAt // Mantener fecha original
    };
    
    console.log('Mock baked product updated:', this.bakedProducts[index]);
    return this.bakedProducts[index];
  }

  async deleteBakedProduct(id: string): Promise<void> {
    await this.delay(300);
    
    const index = this.bakedProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Producto horneado no encontrado');
    }
    
    this.bakedProducts.splice(index, 1);
    console.log('Mock baked product deleted:', id);
  }

  async adjustBakedProductStock(id: string, quantity: number): Promise<BakedProduct> {
    await this.delay(300);
    
    const product = await this.getBakedProductById(id);
    const newQuantity = Math.max(0, product.quantity + quantity);
    
    return this.updateBakedProduct(id, { quantity: newQuantity });
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  async getCategories(): Promise<Category[]> {
    await this.delay(100);
    return this.categories;
  }

  async getLowStockItems(): Promise<LowStockSummary> {
    await this.delay(300);
    
    const lowStockRaw = this.rawMaterials.filter(m => m.quantity <= m.minStock);
    const lowStockBaked = this.bakedProducts.filter(p => p.quantity <= p.minStock);
    
    return {
      rawMaterials: lowStockRaw,
      bakedProducts: lowStockBaked,
      totalLowStock: lowStockRaw.length + lowStockBaked.length
    };
  }
}

export class InventoryApi implements IInventoryApi {
  async getRawMaterials(filters?: RawMaterialFilters): Promise<RawMaterial[]> {
    try {
      const params: any = {};
      
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          params.category = filters.category;
        }
        if (filters.searchTerm) {
          params.search = filters.searchTerm;
        }
        if (filters.lowStockOnly) {
          params.lowStock = true;
        }
      }
      
      const response = await api.get('/inventory/raw-materials', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener materias primas');
      }
      
      return response.data.data as RawMaterial[];
    } catch (error: any) {
      console.error('Error en getRawMaterials:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async getRawMaterialById(id: string): Promise<RawMaterial> {
    try {
      const response = await api.get(`/inventory/raw-materials/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener materia prima');
      }
      
      return response.data.data as RawMaterial;
    } catch (error: any) {
      console.error('Error en getRawMaterialById:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterial> {
    try {
      const response = await api.post('/inventory/raw-materials', data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear materia prima');
      }
      
      return response.data.data as RawMaterial;
    } catch (error: any) {
      console.error('Error en createRawMaterial:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al crear materia prima');
    }
  }

  async updateRawMaterial(id: string, data: Partial<RawMaterial>): Promise<RawMaterial> {
    try {
      const response = await api.put(`/inventory/raw-materials/${id}`, data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar materia prima');
      }
      
      return response.data.data as RawMaterial;
    } catch (error: any) {
      console.error('Error en updateRawMaterial:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al actualizar materia prima');
    }
  }

  async deleteRawMaterial(id: string): Promise<void> {
    try {
      const response = await api.delete(`/inventory/raw-materials/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar materia prima');
      }
    } catch (error: any) {
      console.error('Error en deleteRawMaterial:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al eliminar materia prima');
    }
  }

  async adjustRawMaterialStock(id: string, quantity: number): Promise<RawMaterial> {
    try {
      const response = await api.patch(`/inventory/raw-materials/${id}/stock`, { quantity });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al ajustar stock');
      }
      
      return response.data.data as RawMaterial;
    } catch (error: any) {
      console.error('Error en adjustRawMaterialStock:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al ajustar stock');
    }
  }

  // ============================================
  // PRODUCTOS HORNEADOS
  // ============================================

  async getBakedProducts(filters?: BakedProductFilters): Promise<BakedProduct[]> {
    try {
      const params: any = {};
      
      if (filters) {
        if (filters.type) {
          params.type = filters.type;
        }
        if (filters.searchTerm) {
          params.search = filters.searchTerm;
        }
        if (filters.lowStockOnly) {
          params.lowStock = true;
        }
      }
      
      const response = await api.get('/inventory/baked-products', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener productos horneados');
      }
      
      return response.data.data as BakedProduct[];
    } catch (error: any) {
      console.error('Error en getBakedProducts:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async getBakedProductById(id: string): Promise<BakedProduct> {
    try {
      const response = await api.get(`/inventory/baked-products/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener producto horneado');
      }
      
      return response.data.data as BakedProduct;
    } catch (error: any) {
      console.error('Error en getBakedProductById:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async createBakedProduct(data: CreateBakedProductData): Promise<BakedProduct> {
    try {
      const response = await api.post('/inventory/baked-products', data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear producto horneado');
      }
      
      return response.data.data as BakedProduct;
    } catch (error: any) {
      console.error('Error en createBakedProduct:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al crear producto horneado');
    }
  }

  async updateBakedProduct(id: string, data: Partial<BakedProduct>): Promise<BakedProduct> {
    try {
      const response = await api.put(`/inventory/baked-products/${id}`, data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar producto horneado');
      }
      
      return response.data.data as BakedProduct;
    } catch (error: any) {
      console.error('Error en updateBakedProduct:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al actualizar producto horneado');
    }
  }

  async deleteBakedProduct(id: string): Promise<void> {
    try {
      const response = await api.delete(`/inventory/baked-products/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar producto horneado');
      }
    } catch (error: any) {
      console.error('Error en deleteBakedProduct:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al eliminar producto horneado');
    }
  }

  async adjustBakedProductStock(id: string, quantity: number): Promise<BakedProduct> {
    try {
      const response = await api.patch(`/inventory/baked-products/${id}/stock`, { quantity });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al ajustar stock');
      }
      
      return response.data.data as BakedProduct;
    } catch (error: any) {
      console.error('Error en adjustBakedProductStock:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al ajustar stock');
    }
  }

  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  async getCategories(): Promise<Category[]> {
    return inventoryCategories;
  }

  async getLowStockItems(): Promise<LowStockSummary> {
    try {
      const [rawMaterials, bakedProducts] = await Promise.all([
        this.getRawMaterials({ lowStockOnly: true }),
        this.getBakedProducts({ lowStockOnly: true })
      ]);
      
      return {
        rawMaterials,
        bakedProducts,
        totalLowStock: rawMaterials.length + bakedProducts.length
      };
    } catch (error: any) {
      console.error('Error en getLowStockItems:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }
}

export const defaultInventoryApi = new InventoryApi();