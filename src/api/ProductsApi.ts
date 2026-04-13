// src/api/ProductsApi.ts
import { Product, Flavor, CreateProductData, EditProductData, AddStockData, CreateFlavorData, EditFlavorData } from '@/types';
import { mockProducts, mockFlavors } from '@/data/mockData';

export interface IProductsApi {
  getProducts(searchTerm?: string): Promise<Product[]>;
  createProduct(product: CreateProductData): Promise<Product>;
  editProduct(product: EditProductData): Promise<Product>;
  deleteProduct(productId: string): Promise<void>;
  addProductStock(data: AddStockData): Promise<Product>;
  
  getFlavors(): Promise<Flavor[]>;
  createFlavor(flavor: CreateFlavorData): Promise<Flavor>;
  editFlavor(flavor: EditFlavorData): Promise<Flavor>;
  toggleFlavorStatus(flavorId: string, isActive: boolean): Promise<Flavor>;
  deleteFlavor(flavorId: string): Promise<void>;
}

export class MockProductsApi implements IProductsApi {
  private products: Product[] = [...mockProducts];
  private flavors: Flavor[] = [...mockFlavors];

  async getProducts(searchTerm: string = ''): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = [...this.products];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      portionSize: 10, // Default value
    };
    
    this.products.push(newProduct);
    return newProduct;
  }

  async editProduct(productData: EditProductData): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.products.findIndex(p => p.id === productData.id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const updatedProduct = {
      ...this.products[index],
      ...productData,
      id: productData.id,
    };
    
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    this.products.splice(index, 1);
  }

  async addProductStock(data: AddStockData): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.products.findIndex(p => p.id === data.productId);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const updatedProduct = {
      ...this.products[index],
      stock: this.products[index].stock + data.quantity,
    };
    
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  async getFlavors(): Promise<Flavor[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.flavors];
  }

  async createFlavor(flavorData: CreateFlavorData): Promise<Flavor> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFlavor: Flavor = {
      ...flavorData,
      id: Date.now().toString(),
    };
    
    this.flavors.push(newFlavor);
    return newFlavor;
  }

  async editFlavor(flavorData: EditFlavorData): Promise<Flavor> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.flavors.findIndex(f => f.id === flavorData.id);
    if (index === -1) {
      throw new Error('Flavor not found');
    }
    
    const updatedFlavor = {
      ...this.flavors[index],
      ...flavorData,
      id: flavorData.id,
    };
    
    this.flavors[index] = updatedFlavor;
    return updatedFlavor;
  }

  async toggleFlavorStatus(flavorId: string, isActive: boolean): Promise<Flavor> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.flavors.findIndex(f => f.id === flavorId);
    if (index === -1) {
      throw new Error('Flavor not found');
    }
    
    const updatedFlavor = {
      ...this.flavors[index],
      isActive,
    };
    
    this.flavors[index] = updatedFlavor;
    return updatedFlavor;
  }

  async deleteFlavor(flavorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.flavors.findIndex(f => f.id === flavorId);
    if (index === -1) {
      throw new Error('Flavor not found');
    }
    
    this.flavors.splice(index, 1);
  }
}

export const defaultProductsApi = new MockProductsApi();