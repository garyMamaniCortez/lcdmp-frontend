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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            ¡Buen día, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes el resumen de hoy
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {hasRole('seller') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas de Hoy
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {stats.todaySales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.yesterdayComparation} vs. ayer
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Para hoy y mañana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Producción
              </CardTitle>
              <Cake className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.inProduction}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Horneando, armando o decorando
              </p>
            </CardContent>
          </Card>

          {hasRole('delivery') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Listos para Envío
                </CardTitle>
                <Truck className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.readyForDelivery}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esperando delivery
                </p>
              </CardContent>
            </Card>
          )}

          {hasRole('admin') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stock Bajo
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Productos por debajo del mínimo
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completados Hoy
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.completedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pedidos entregados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Pedidos Próximos</CardTitle>
            <CardDescription>
              Pedidos que deben completarse pronto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${statusColors[order.status]}`} />
                    <div>
                      <p className="font-medium">{order.product}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]} text-white`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {order.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions based on role */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {hasRole('seller') && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
              onClick={() => navigate('/sales')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Nueva Venta</CardTitle>
                    <CardDescription>Registrar una venta rápida</CardDescription>
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
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Package className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Nuevo Pedido</CardTitle>
                    <CardDescription>Crear pedido personalizado</CardDescription>
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
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-status-baking/20">
                    <Cake className="h-5 w-5 text-status-baking" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ver Hornos</CardTitle>
                    <CardDescription>Productos por hornear</CardDescription>
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
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <CalendarHeart className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Menús Especiales</CardTitle>
                    <CardDescription>Eventos y promociones</CardDescription>
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
