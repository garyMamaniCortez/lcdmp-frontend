// src/services/SalesApi.ts
import { Product } from '@/types';
import api from '@/api/api';

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface SaleData {
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'qr';
  timestamp: Date;
}

export interface ISalesApi {
  getProducts(searchTerm?: string): Promise<Product[]>;
  createSale(sale: SaleData): Promise<void>;
}

// Implementación mock para desarrollo
export class MockSalesApi implements ISalesApi {
  private products: Product[] = [
    { id: '1', name: 'Torta de Chocolate', description: 'Torta clásica de chocolate con ganache', basePrice: 180, category: 'cake', portionSize: 10, pricePerPortion: 12, isActive: true, location: 'store', stock: 3, minStock: 1 },
    { id: '2', name: 'Torta de Vainilla', description: 'Torta de vainilla con buttercream', basePrice: 160, category: 'cake', portionSize: 10, pricePerPortion: 11, isActive: true, location: 'store', stock: 2, minStock: 1 },
    { id: '3', name: 'Torta Red Velvet', description: 'Torta red velvet con frosting de queso crema', basePrice: 200, category: 'cake', portionSize: 10, pricePerPortion: 14, isActive: true, location: 'production', stock: 1, minStock: 1 },
    { id: '4', name: 'Cupcake Decorado', description: 'Cupcake con diseño personalizado', basePrice: 15, category: 'cupcake', portionSize: 1, pricePerPortion: 15, isActive: true, location: 'store', stock: 24, minStock: 12 },
    { id: '5', name: 'Cheesecake', description: 'Cheesecake New York style', basePrice: 150, category: 'dessert', portionSize: 8, pricePerPortion: 15, isActive: true, location: 'store', stock: 2, minStock: 1 },
    { id: '6', name: 'Brownie', description: 'Brownie con nueces', basePrice: 8, category: 'dessert', portionSize: 1, pricePerPortion: 8, isActive: true, location: 'store', stock: 20, minStock: 10 },
    { id: '7', name: 'Alfajores', description: 'Alfajores de maicena con dulce de leche', basePrice: 5, category: 'dessert', portionSize: 1, pricePerPortion: 5, isActive: true, location: 'store', stock: 30, minStock: 15 },
    { id: '8', name: 'Torta Selva Negra', description: 'Torta de chocolate con cerezas y crema', basePrice: 220, category: 'cake', portionSize: 15, pricePerPortion: 15, isActive: true, location: 'production', stock: 0, minStock: 1 },
  ];

   async getProducts(searchTerm: string = ''): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = this.products.filter(p => p.isActive && p.location === 'store' && p.stock > 0);
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }

  async createSale(sale: SaleData): Promise<void> {
    console.log('Mock sale created:', sale);
    await new Promise(resolve => setTimeout(resolve, 200));
    // Aquí se podría actualizar el stock local, pero lo dejamos para el backend real
  }
}

export class SalesApi implements ISalesApi {
  async getProducts(searchTerm: string = ''): Promise<Product[]> {
    try {
      const response = await api.get('/sales/products', {
        params: { search: searchTerm || undefined }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener productos');
      }

      return response.data.data as Product[];
    } catch (error: any) {
      console.error('Error en getProducts:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }

  async createSale(sale: SaleData): Promise<void> {
    try {
      const payload = {
        items: sale.items,
        total: sale.total,
        paymentMethod: sale.paymentMethod
      };

      const response = await api.post('/sales', payload);

      if (!response.data.success && response.status !== 201) {
        throw new Error(response.data.message || 'Error al crear la venta');
      }
    } catch (error: any) {
      console.error('Error en createSale:', error);
      const message = error.response?.data?.message || error.message || 'Error al procesar la venta';
      throw new Error(message);
    }
  }
}

// Singleton opcional para la instancia por defecto
export const defaultSalesApi = new SalesApi();