import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Clock, 
  Cake, 
  AlertTriangle,
  CheckCircle,
  Truck,
  CalendarHeart
} from 'lucide-react';
import { RecentOrders, TodaysResume } from '@/types';

const stats: TodaysResume = {
  todaySales: 2450,
  orders: {
    pending: 8,
    inProduction: 5,
    readyForDelivery: 3,
    completedToday: 12
  },
  lowStock: 4,
  yesterdayComparation: "+12%",
}

const recentOrders: RecentOrders[] = [
  { id: 'ORD-001', customer: 'María García', product: 'Torta de Chocolate', status: 'decorating', time: '14:00' },
  { id: 'ORD-002', customer: 'Juan Pérez', product: 'Mesa Dulce x50', status: 'baking', time: '15:30' },
  { id: 'ORD-003', customer: 'Ana López', product: 'Torta Personalizada', status: 'assembling', time: '16:00' },
  { id: 'ORD-004', customer: 'Carlos Rojas', product: 'Cupcakes x24', status: 'ready', time: '12:00' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-status-pending',
  baking: 'bg-status-baking',
  assembling: 'bg-status-assembling',
  decorating: 'bg-status-decorating',
  ready: 'bg-status-ready',
  delivered: 'bg-status-delivered',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  baking: 'Horneando',
  assembling: 'Armando',
  decorating: 'Decorando',
  ready: 'Listo',
  delivered: 'Entregado',
};

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first typography */}
        <div className="px-4 sm:px-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            ¡Buen día, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Aquí tienes el resumen de hoy
          </p>
        </div>

        {/* Stats Grid - Mobile: 1 columna, Tablet: 2 columnas, Desktop: 4 columnas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {hasRole('seller') && (
            <Card className="mx-4 sm:mx-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Ventas de Hoy
                </CardTitle>
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold">Bs. {stats.todaySales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.yesterdayComparation} vs. ayer
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mx-4 sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pedidos Pendientes
              </CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold">{stats.orders.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Para hoy y mañana
              </p>
            </CardContent>
          </Card>

          <Card className="mx-4 sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                En Producción
              </CardTitle>
              <Cake className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold">{stats.orders.inProduction}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Horneando, armando o decorando
              </p>
            </CardContent>
          </Card>

          {hasRole('delivery') && (
            <Card className="mx-4 sm:mx-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Listos para Envío
                </CardTitle>
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-info" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold">{stats.orders.readyForDelivery}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esperando delivery
                </p>
              </CardContent>
            </Card>
          )}

          {hasRole('admin') && (
            <Card className="mx-4 sm:mx-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Stock Bajo
                </CardTitle>
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Productos por debajo del mínimo
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mx-4 sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Completados Hoy
              </CardTitle>
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold">{stats.orders.completedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pedidos entregados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders - Mobile: stacked, Tablet/Desktop: improved spacing */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-4 sm:px-6">
            <CardTitle className="font-display text-lg sm:text-xl">Pedidos Próximos</CardTitle>
            <CardDescription className="text-sm">
              Pedidos que deben completarse pronto
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-2 h-2 rounded-full ${statusColors[order.status]} flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{order.product}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 ml-5 sm:ml-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]} text-white whitespace-nowrap`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {order.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mobile: 1 columna, Tablet: 2 columnas, Desktop: 4 columnas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 px-4 sm:px-0">
          {hasRole('seller') && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
              onClick={() => navigate('/sales')}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">Nueva Venta</CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">Registrar una venta rápida</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {hasRole('seller') && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
              onClick={() => navigate('/orders')}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20 flex-shrink-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">Nuevo Pedido</CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">Crear pedido personalizado</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {hasRole('baker') && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
              onClick={() => navigate('/baking')}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-status-baking/20 flex-shrink-0">
                    <Cake className="h-4 w-4 sm:h-5 sm:w-5 text-status-baking" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">Ver Hornos</CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">Productos por hornear</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {hasRole('seller') && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
              onClick={() => navigate('/special-menus')}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                    <CalendarHeart className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">Menús Especiales</CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">Eventos y promociones</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}