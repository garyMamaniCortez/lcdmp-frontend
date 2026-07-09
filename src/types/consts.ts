import { AlertCircle, CheckCircle, ChefHat, Clock, Hammer, Palette, Truck } from "lucide-react";
import { Package, Wheat, Milk, Egg } from 'lucide-react';
import { Category, OrderStatus, UserRole } from ".";
import Inventory from '../pages/Inventory';

export const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  baking: { label: 'Horneando', color: 'bg-orange-100 text-orange-800', icon: ChefHat },
  assembling: { label: 'Armando', color: 'bg-blue-100 text-blue-800', icon: Hammer },
  decorating: { label: 'Decorando', color: 'bg-purple-100 text-purple-800', icon: Palette },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivered: { label: 'Entregado', color: 'bg-gray-100 text-gray-800', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  seller: 'Vendedor',
  baker: 'Hornos',
  designer: 'Diseño',
  assembler: 'Armado',
  delivery: 'Delivery',
};

export const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  seller: 'bg-blue-100 text-blue-800',
  baker: 'bg-orange-100 text-orange-800',
  designer: 'bg-purple-100 text-purple-800',
  assembler: 'bg-cyan-100 text-cyan-800',
  delivery: 'bg-green-100 text-green-800',
};

export const categories = [
    { value: 'cake', label: 'Tortas' },
    { value: 'cupcake', label: 'Cupcakes' },
    { value: 'dessert', label: 'Postres' },
    { value: 'bread', label: 'Pan' },
    { value: 'special', label: 'Especiales' },
  ];

export const categoryIcons: Record<string, React.ElementType> = {
  flour: Wheat,
  dairy: Milk,
  eggs: Egg,
  sugar: Package,
  flavoring: Package,
  decoration: Package,
  other: Package,
};

export const categoryLabels: Record<string, string> = {
  flour: 'Harinas',
  dairy: 'Lácteos',
  eggs: 'Huevos',
  sugar: 'Azúcares',
  flavoring: 'Saborizantes',
  decoration: 'Decoración',
  other: 'Otros',
};

export const productTypeLabels: Record<string, string> = {
  cake_base: 'Base de torta',
  cupcake: 'Cupcakes',
  cookie: 'Galletas',
  bread: 'Pan',
  pastry: 'Pastelería',
};

export const inventoryCategories: Category[] = [
  { id: 'flour', name: 'Harinas', type: 'raw_material' },
  { id: 'dairy', name: 'Lácteos', type: 'raw_material' },
  { id: 'eggs', name: 'Huevos', type: 'raw_material' },
  { id: 'sugar', name: 'Azúcares', type: 'raw_material' },
  { id: 'flavoring', name: 'Saborizantes', type: 'raw_material' },
  { id: 'decoration', name: 'Decoración', type: 'raw_material' },
  { id: 'other', name: 'Otros', type: 'raw_material' }
];