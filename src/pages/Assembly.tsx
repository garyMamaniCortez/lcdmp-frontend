import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Hammer, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { mockOrders, mockBakedProducts } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Assembly() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Filter orders that need assembly (baking completed)
  const assemblyOrders = mockOrders
    .filter(o => o.status === 'assembling')
    .sort((a, b) => {
      const hoursA = differenceInHours(a.pickupDate, new Date());
      const hoursB = differenceInHours(b.pickupDate, new Date());
      const portionsA = a.customCakes.reduce((sum, c) => sum + c.portions, 0);
      const portionsB = b.customCakes.reduce((sum, c) => sum + c.portions, 0);
      return (hoursA - portionsA/10) - (hoursB - portionsB/10);
    });

  const getUrgencyBadge = (order: typeof mockOrders[0]) => {
    const hoursUntil = differenceInHours(order.pickupDate, new Date());
    if (hoursUntil < 12) return { label: 'Urgente', color: 'bg-red-500' };
    if (hoursUntil < 24) return { label: 'Pronto', color: 'bg-orange-500' };
    return { label: 'Normal', color: 'bg-green-500' };
  };

  const completeAssembly = () => {
    toast.success('Armado completado, pedido enviado a decoración');
    setIsCompleteDialogOpen(false);
    setSelectedOrder(null);
  };

  // Check material availability
  const checkMaterials = (order: typeof mockOrders[0]) => {
    const basesNeeded = order.customCakes.reduce((sum, c) => sum + 1, 0);
    const availableBases = mockBakedProducts.filter(p => p.type === 'cake_base').reduce((sum, p) => sum + p.quantity, 0);
    return availableBases >= basesNeeded;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Armado</h1>
            <p className="text-muted-foreground">Ensamblaje de tortas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assemblyOrders.length}</p>
                <p className="text-sm text-muted-foreground">Pendientes de armar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assemblyOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 12).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockBakedProducts.filter(p => p.type === 'cake_base').reduce((sum, p) => sum + p.quantity, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Bases disponibles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Check */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materiales Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockBakedProducts.filter(p => p.type === 'cake_base').map(product => (
                <div key={product.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-lg font-bold">{product.quantity} disponibles</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos para Armar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assemblyOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay pedidos pendientes de armar
                </p>
              ) : (
                assemblyOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  const hasMaterials = checkMaterials(order);
                  
                  return (
                    <div 
                      key={order.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        !hasMaterials ? 'bg-red-50 border border-red-200' : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className={`w-2 h-full min-h-16 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">Pedido #{order.id}</h3>
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                          {!hasMaterials && (
                            <Badge variant="destructive">Sin materiales</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <div className="mt-2 space-y-1">
                          {order.customCakes.map((cake, i) => (
                            <p key={i} className="text-sm">
                              <strong>{cake.portions} porciones</strong> - {cake.cakeFlavor}
                              <br />
                              <span className="text-muted-foreground">
                                Relleno: {cake.fillingFlavors.join(', ')}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                        </p>
                      </div>

                      <Button 
                        size="sm"
                        disabled={!hasMaterials}
                        onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complete Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Completar Armado</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Pedido #{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label>Confirmar armado de:</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Checkbox id={`cake-${i}`} defaultChecked />
                      <div>
                        <label htmlFor={`cake-${i}`} className="font-medium cursor-pointer">
                          {cake.cakeFlavor} - {cake.portions} porciones
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Relleno: {cake.fillingFlavors.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={completeAssembly}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enviar a Decoración
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
