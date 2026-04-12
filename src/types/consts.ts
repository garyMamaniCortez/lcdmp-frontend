import { AlertCircle, CheckCircle, ChefHat, Clock, Hammer, Palette, Truck } from "lucide-react";
import { OrderStatus, UserRole } from ".";

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