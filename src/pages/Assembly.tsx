import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MobileCard, useIsMobile } from '@/components/ui/responsive-table';
import { Hammer, Clock, AlertTriangle, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { mockOrders, mockBakedProducts } from '@/data/mockData';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Assembly() {
  const isMobile = useIsMobile();
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

  const totalAvailableBases = mockBakedProducts
    .filter(p => p.type === 'cake_base')
    .reduce((sum, p) => sum + p.quantity, 0);

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header - Mobile first */}
        <div className="px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Armado
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Ensamblaje de tortas
          </p>
        </div>

        {/* Stats - Mobile: 2 columnas, Tablet/Desktop: 3 columnas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-0">
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Hammer className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{assemblyOrders.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Pendientes de armar</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-100 text-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">
                  {assemblyOrders.filter(o => differenceInHours(o.pickupDate, new Date()) < 12).length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Urgentes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 text-green-800 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totalAvailableBases}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Bases disponibles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Check */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Materiales Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {mockBakedProducts.filter(p => p.type === 'cake_base').map(product => (
                <div key={product.id} className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                  <p className="text-base sm:text-lg font-bold mt-1">{product.quantity}</p>
                  <p className="text-xs text-muted-foreground">disponibles</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Pedidos para Armar</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            {assemblyOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No hay pedidos pendientes de armar
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {assemblyOrders.map(order => {
                  const urgency = getUrgencyBadge(order);
                  const hoursUntil = differenceInHours(order.pickupDate, new Date());
                  const hasMaterials = checkMaterials(order);
                  
                  return isMobile ? (
                    // Mobile Card Layout
                    <MobileCard 
                      key={order.id}
                      className={`overflow-hidden ${!hasMaterials ? 'border-destructive' : ''}`}
                    >
                      <div className="flex">
                        {/* Urgency color bar */}
                        <div className={`w-1.5 min-h-full ${urgency.color}`} />
                        
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-sm">Pedido #{order.id}</h3>
                                {!hasMaterials && (
                                  <Badge variant="destructive" className="text-xs">
                                    Sin materiales
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{order.customerName}</p>
                            </div>
                            <Badge className={`${urgency.color} text-white text-xs`}>
                              {urgency.label}
                            </Badge>
                          </div>

                          <div className="space-y-2 mt-2">
                            {order.customCakes.map((cake, i) => (
                              <div key={i} className="text-xs bg-muted/50 p-2 rounded">
                                <p className="font-medium">{cake.portions} porciones - {cake.cakeFlavor}</p>
                                <p className="text-muted-foreground mt-0.5">
                                  Relleno: {cake.fillingFlavors.join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                              </span>
                              <span className="text-xs ml-1">
                                {format(order.pickupDate, 'dd MMM', { locale: es })} {order.pickupTime}
                              </span>
                            </div>

                            <Button 
                              size="sm"
                              disabled={!hasMaterials}
                              className="h-8 text-xs"
                              onClick={() => { setSelectedOrder(order); setIsCompleteDialogOpen(true); }}
                            >
                              Completar
                              <CheckCircle className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ) : (
                    // Desktop Layout
                    <div 
                      key={order.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        !hasMaterials 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className={`w-2 h-full min-h-16 rounded-full ${urgency.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        <div className="flex items-center gap-1 text-muted-foreground mb-2 justify-end">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {hoursUntil > 0 ? `${hoursUntil}h` : 'Atrasado'}
                          </span>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
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
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Dialog - Mobile optimized */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Completar Armado</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 px-1">
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm sm:text-base">Pedido #{selectedOrder.id}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Confirmar armado de:</Label>
                  {selectedOrder.customCakes.map((cake, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <Checkbox id={`cake-${i}`} defaultChecked className="mt-0.5" />
                      <div className="flex-1">
                        <label 
                          htmlFor={`cake-${i}`} 
                          className="font-medium text-sm cursor-pointer"
                        >
                          {cake.cakeFlavor} - {cake.portions} porciones
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Relleno: {cake.fillingFlavors.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCompleteDialogOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={completeAssembly} className="w-full sm:w-auto order-1 sm:order-2">
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