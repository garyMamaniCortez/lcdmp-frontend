import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MobileCard, MobileCardRow, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Eye, Clock, CheckCircle, Truck, AlertCircle, ChefHat, Palette, Hammer } from 'lucide-react';
import { mockOrders, mockFlavors, mockProducts } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatus } from '@/types';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  baking: { label: 'Horneando', color: 'bg-orange-100 text-orange-800', icon: ChefHat },
  assembling: { label: 'Armando', color: 'bg-blue-100 text-blue-800', icon: Hammer },
  decorating: { label: 'Decorando', color: 'bg-purple-100 text-purple-800', icon: Palette },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivered: { label: 'Entregado', color: 'bg-gray-100 text-gray-800', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function Orders() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getOrderPriority = (order: typeof mockOrders[0]) => {
    const hoursUntilPickup = (order.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const totalPortions = order.customCakes.reduce((sum, cake) => sum + cake.portions, 0);
    return hoursUntilPickup - (totalPortions / 10);
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => getOrderPriority(a) - getOrderPriority(b));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Gestión de pedidos de tortas y combos</p>
          </div>
          <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Pedido</DialogTitle>
              </DialogHeader>
              <NewOrderForm onClose={() => setIsNewOrderOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusConfig).slice(0, 4).map(([status, config]) => {
            const count = mockOrders.filter(o => o.status === status).length;
            const Icon = config.icon;
            return (
              <Card key={status} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedStatus(status)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre o teléfono..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(statusConfig).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table / Mobile Cards */}
        {isMobile ? (
          <div className="space-y-3">
            {sortedOrders.map(order => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              return (
                <MobileCard key={order.id} onClick={() => setSelectedOrder(order)}>
                  <MobileCardHeader>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">#{order.id}</span>
                      <Badge className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </MobileCardHeader>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format(order.pickupDate, 'dd MMM', { locale: es })}</p>
                        <p className="text-sm text-muted-foreground">{order.pickupTime}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      {order.customCakes.length > 0 && (
                        <p>{order.customCakes.map(c => `Torta ${c.portions}p ${c.cakeFlavor}`).join(', ')}</p>
                      )}
                      {order.sweetTableCombo && (
                        <p className="text-muted-foreground">+ Mesa dulce ({order.sweetTableCombo.totalQuantity} postres)</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Adelanto: Bs. {order.deposit}</p>
                      </div>
                      <p className="font-bold text-lg">Bs. {order.total}</p>
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Entrega</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map(order => {
                    const config = statusConfig[order.status];
                    const Icon = config.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{format(order.pickupDate, 'dd MMM', { locale: es })}</p>
                            <p className="text-sm text-muted-foreground">{order.pickupTime}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {order.customCakes.length > 0 && (
                              <p className="text-sm">
                                {order.customCakes.map(c => `Torta ${c.portions}p ${c.cakeFlavor}`).join(', ')}
                              </p>
                            )}
                            {order.sweetTableCombo && (
                              <p className="text-sm text-muted-foreground">
                                + Mesa dulce ({order.sweetTableCombo.totalQuantity} postres)
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold">Bs. {order.total}</p>
                          <p className="text-sm text-muted-foreground">
                            Adelanto: Bs. {order.deposit}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && <OrderDetail order={selectedOrder} />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

function NewOrderForm({ onClose }: { onClose: () => void }) {
  const [orderType, setOrderType] = useState<'cake' | 'combo' | 'both'>('cake');
  const cakeFlavors = mockFlavors.filter(f => f.type === 'cake' && f.isActive);
  const fillingFlavors = mockFlavors.filter(f => f.type === 'filling' && f.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pedido creado exitosamente');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre del cliente *</Label>
          <Input placeholder="Nombre completo" required />
        </div>
        <div className="space-y-2">
          <Label>Teléfono *</Label>
          <Input placeholder="Número de teléfono" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de entrega *</Label>
          <Input type="date" required />
        </div>
        <div className="space-y-2">
          <Label>Hora de entrega *</Label>
          <Input type="time" required />
        </div>
      </div>

      {/* Order Type */}
      <div className="space-y-2">
        <Label>Tipo de pedido</Label>
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as typeof orderType)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="cake">Torta</TabsTrigger>
            <TabsTrigger value="combo">Mesa Dulce</TabsTrigger>
            <TabsTrigger value="both">Ambos</TabsTrigger>
          </TabsList>

          <TabsContent value="cake" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Porciones</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 25, 30, 40, 50].map(p => (
                      <SelectItem key={p} value={p.toString()}>{p} porciones</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Forma (opcional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Redonda</SelectItem>
                    <SelectItem value="square">Cuadrada</SelectItem>
                    <SelectItem value="rectangle">Rectangular</SelectItem>
                    <SelectItem value="heart">Corazón</SelectItem>
                    <SelectItem value="two-tier">Dos pisos</SelectItem>
                    <SelectItem value="three-tier">Tres pisos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sabor de torta</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {cakeFlavors.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sabor de relleno</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {fillingFlavors.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción del diseño</Label>
              <Textarea placeholder="Describe el diseño deseado..." />
            </div>

            <div className="space-y-2">
              <Label>Dedicatoria (opcional)</Label>
              <Input placeholder="Texto para la torta" />
            </div>
          </TabsContent>

          <TabsContent value="combo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cantidad de postres</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar combo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 postres - Bs. 400</SelectItem>
                  <SelectItem value="100">100 postres - Bs. 750</SelectItem>
                  <SelectItem value="custom">Cantidad personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="both" className="mt-4">
            <p className="text-muted-foreground text-sm">
              Configure tanto la torta como la mesa dulce usando las opciones anteriores.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delivery */}
      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          <Label>Dirección de envío (opcional)</Label>
          <Input placeholder="Dirección o link de ubicación" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Costo de envío</Label>
            <Input type="number" placeholder="0" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label>Garantía (opcional)</Label>
            <Input placeholder="Descripción de garantía" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Total</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Adelanto</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas adicionales</Label>
        <Textarea placeholder="Observaciones del pedido..." />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Crear Pedido
        </Button>
      </div>
    </form>
  );
}

function OrderDetail({ order }: { order: typeof mockOrders[0] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Cliente</p>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Entrega</p>
          <p className="font-medium">{format(order.pickupDate, 'dd MMMM yyyy', { locale: es })}</p>
          <p className="text-sm">{order.pickupTime}</p>
        </div>
      </div>

      {order.customCakes.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Tortas personalizadas</h4>
          {order.customCakes.map((cake, i) => (
            <div key={i} className="bg-muted/50 p-3 rounded-lg mb-2">
              <p><strong>{cake.portions} porciones</strong> - {cake.cakeFlavor}</p>
              <p className="text-sm text-muted-foreground">
                Relleno: {cake.fillingFlavors.join(', ')}
              </p>
              {cake.design && <p className="text-sm">Diseño: {cake.design}</p>}
              {cake.dedication && <p className="text-sm">Dedicatoria: {cake.dedication}</p>}
              <p className="font-medium mt-1">Bs. {cake.price}</p>
            </div>
          ))}
        </div>
      )}

      {order.sweetTableCombo && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Mesa Dulce</h4>
          <p>{order.sweetTableCombo.totalQuantity} postres - Bs. {order.sweetTableCombo.price}</p>
        </div>
      )}

      {order.guarantee && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Garantía</h4>
          <p>Bs. {order.guarantee.amount} - {order.guarantee.items}</p>
        </div>
      )}

      <div className="border-t pt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-primary">Bs. {order.total}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Adelanto pagado</p>
          <p className="text-lg font-medium">Bs. {order.deposit}</p>
          <p className="text-sm text-muted-foreground">
            Saldo: Bs. {order.total - order.deposit}
          </p>
        </div>
      </div>
    </div>
  );
}
