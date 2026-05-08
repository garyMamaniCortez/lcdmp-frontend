import api from './api';
import type { 
  CashRegister, 
  Transaction, 
  PaymentMethod,
	DailySummary,
	ClosingData} from '@/types';

export interface ICashRegisterApi {
  getDailySummary(date?: Date): Promise<DailySummary>;
  
  getTransactions(dateRange: {
    startDate?: string;
    endDate?: string;
    specificDate?: string;
  }): Promise<Transaction[]>;
  
  registerTransaction(data: {
    type: 'sale' | 'deposit' | 'expense' | 'adjustment';
    amount: number;
    method: PaymentMethod;
    orderId?: string;
    description: string;
  }): Promise<Transaction>;
	
  closeCashRegister(closingData: ClosingData): Promise<CashRegister>;
  
  getCurrentStatus(): Promise<{
    isOpen: boolean;
    currentRegister?: CashRegister;
    openingBalance?: number;
  }>;
}

// @/api/CashRegisterApi.ts (continuación)

// Datos mock para pruebas
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'sale',
    amount: 150.00,
    method: 'cash',
    orderId: 'ORD-001',
    description: 'Venta de torta de chocolate',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'user1'
  },
  {
    id: '2',
    type: 'sale',
    amount: 75.50,
    method: 'qr',
    orderId: 'ORD-002',
    description: 'Venta de cupcakes',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdBy: 'user1'
  },
  {
    id: '3',
    type: 'deposit',
    amount: 200.00,
    method: 'cash',
    orderId: 'ORD-003',
    description: 'Adelanto pedido de cumpleaños',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdBy: 'user1'
  },
  {
    id: '4',
    type: 'expense',
    amount: -45.00,
    method: 'cash',
    description: 'Compra de harina y azúcar',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    createdBy: 'user1'
  },
  {
    id: '5',
    type: 'sale',
    amount: 89.99,
    method: 'qr',
    orderId: 'ORD-004',
    description: 'Mesa dulce personalizada',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdBy: 'user1'
  },
  {
    id: '6',
    type: 'expense',
    amount: -30.00,
    method: 'cash',
    description: 'Compra de decoraciones',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    createdBy: 'user1'
  }
];

export class MockCashRegisterApi implements ICashRegisterApi {
  private currentRegister: CashRegister | null = null;
  private transactions: Transaction[] = [...mockTransactions];
  
  constructor() {
    // Simular una caja abierta por defecto
    this.currentRegister = {
      id: 'mock-1',
      date: new Date(),
      openingBalance: 500,
      status: 'open',
      transactions: this.transactions
    };
  }
  
  async getDailySummary(date?: Date): Promise<DailySummary> {
    await this.simulateDelay();
    
    const targetDate = date || new Date();
    const dayTransactions = this.transactions.filter(t => 
      this.isSameDay(t.createdAt, targetDate)
    );
    
    const cashIncome = dayTransactions
      .filter(t => (t.type === 'sale' || t.type === 'deposit') && t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const qrIncome = dayTransactions
      .filter(t => (t.type === 'sale' || t.type === 'deposit') && t.method === 'qr')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = Math.abs(
      dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    );
    
    const currentCashBalance = this.currentRegister?.openingBalance || 0 + cashIncome - totalExpenses;
    const currentQrBalance = qrIncome;
    
    return {
      cashIncome,
      qrIncome,
      totalIncome: cashIncome + qrIncome,
      totalExpenses,
      openingBalance: this.currentRegister?.openingBalance || 500,
      currentCashBalance,
      currentQrBalance,
      transactions: dayTransactions
    };
  }
  
  async getTransactions(dateRange: {
    startDate?: string;
    endDate?: string;
    specificDate?: string;
  }): Promise<Transaction[]> {
    await this.simulateDelay();
    
    let filtered = [...this.transactions];
    
    if (dateRange.specificDate) {
      const specificDate = new Date(dateRange.specificDate);
      filtered = filtered.filter(t => this.isSameDay(t.createdAt, specificDate));
    } else if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      filtered = filtered.filter(t => 
        t.createdAt >= start && t.createdAt <= end
      );
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async registerTransaction(data: {
    type: 'sale' | 'deposit' | 'expense' | 'adjustment';
    amount: number;
    method: PaymentMethod;
    orderId?: string;
    description: string;
  }): Promise<Transaction> {
    await this.simulateDelay();
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: data.type,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      method: data.method,
      orderId: data.orderId,
      description: data.description,
      createdAt: new Date(),
      createdBy: 'current-user'
    };
    
    this.transactions.unshift(newTransaction);
    
    if (this.currentRegister) {
      this.currentRegister.transactions = this.transactions;
    }
    
    console.log('Mock transaction registered:', newTransaction);
    return newTransaction;
  }
  
  async closeCashRegister(closingData: ClosingData): Promise<CashRegister> {
    await this.simulateDelay();
    
    if (!this.currentRegister || this.currentRegister.status === 'closed') {
      throw new Error('No hay una caja abierta para cerrar');
    }
    
    this.currentRegister.status = 'closed';
    this.currentRegister.closingBalance = closingData.countedCash;
    
    console.log('Mock cash register closed:', this.currentRegister);
    return this.currentRegister;
  }
  
  async getCurrentStatus(): Promise<{
    isOpen: boolean;
    currentRegister?: CashRegister;
    openingBalance?: number;
  }> {
    await this.simulateDelay();
    
    return {
      isOpen: this.currentRegister?.status === 'open',
      currentRegister: this.currentRegister || undefined,
      openingBalance: this.currentRegister?.openingBalance
    };
  }
  
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
  
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
}

export class CashRegisterApi implements ICashRegisterApi {
  async getDailySummary(date?: Date): Promise<DailySummary> {
    try {
      const params: any = {};
      if (date) {
        params.date = date.toISOString();
      }
      
      const response = await api.get('/cash-register/daily-summary', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener resumen diario');
      }
      
      return response.data.data as DailySummary;
    } catch (error: any) {
      console.error('Error en getDailySummary:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }
  
  async getTransactions(dateRange: {
    startDate?: string;
    endDate?: string;
    specificDate?: string;
  }): Promise<Transaction[]> {
    try {
      let url = '/cash-register/transactions';
      const params: any = {};
      
      if (dateRange.specificDate) {
        params.date = dateRange.specificDate;
      } else if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      
      const response = await api.get(url, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener transacciones');
      }
      
      return response.data.data as Transaction[];
    } catch (error: any) {
      console.error('Error en getTransactions:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }
  
  async registerTransaction(data: {
    type: 'sale' | 'deposit' | 'expense' | 'adjustment';
    amount: number;
    method: PaymentMethod;
    orderId?: string;
    description: string;
  }): Promise<Transaction> {
    try {
      const response = await api.post('/cash-register/transactions', data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al registrar transacción');
      }
      
      return response.data.data as Transaction;
    } catch (error: any) {
      console.error('Error en registerTransaction:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al registrar transacción');
    }
  }
  
  async closeCashRegister(closingData: ClosingData): Promise<CashRegister> {
    try {
      const response = await api.post('/cash-register/close', closingData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al cerrar caja');
      }
      
      return response.data.data as CashRegister;
    } catch (error: any) {
      console.error('Error en closeCashRegister:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al cerrar caja');
    }
  }
  
  async getCurrentStatus(): Promise<{
    isOpen: boolean;
    currentRegister?: CashRegister;
    openingBalance?: number;
  }> {
    try {
      const response = await api.get('/cash-register/status');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estado de caja');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error en getCurrentStatus:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión');
    }
  }
}

export const defaultCashRegisterApi = new CashRegisterApi();