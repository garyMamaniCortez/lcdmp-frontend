import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Building, CreditCard, Bell, Palette, Plus, Edit2, Trash2 } from 'lucide-react';
import { mockBranches } from '@/data/mockData';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = () => {
    toast.success('Configuración guardada');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Ajustes generales del sistema</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branches">Sucursales</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
                <CardDescription>
                  Datos principales de la repostería
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del negocio</Label>
                    <Input defaultValue="La Casa de Mi Padre" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono principal</Label>
                    <Input defaultValue="4567890" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dirección principal</Label>
                  <Input defaultValue="Av. Heroínas #456, Cochabamba, Bolivia" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NIT</Label>
                    <Input placeholder="Número de NIT" />
                  </div>
                  <div className="space-y-2">
                    <Label>Razón social</Label>
                    <Input placeholder="Razón social para facturas" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo oscuro</p>
                    <p className="text-sm text-muted-foreground">Cambiar tema de la aplicación</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de stock bajo</p>
                    <p className="text-sm text-muted-foreground">Alertas cuando el inventario esté bajo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recordatorios de pedidos</p>
                    <p className="text-sm text-muted-foreground">Alertas para pedidos próximos a entregar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
          </TabsContent>

          <TabsContent value="branches" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Sucursales
                    </CardTitle>
                    <CardDescription>
                      Gestiona las sucursales del negocio
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Sucursal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBranches.map(branch => (
                    <div key={branch.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{branch.name}</h3>
                          {branch.isMain && <Badge>Principal</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{branch.address}</p>
                        <p className="text-sm text-muted-foreground">Tel: {branch.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={branch.isMain}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
                <CardDescription>
                  Configura los métodos de pago aceptados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Efectivo</p>
                    <p className="text-sm text-muted-foreground">Pagos en efectivo en tienda</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Pago QR</p>
                    <p className="text-sm text-muted-foreground">Pagos digitales vía código QR</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de QR</CardTitle>
                <CardDescription>
                  Datos para generar códigos QR de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input placeholder="Nombre del banco" />
                </div>
                <div className="space-y-2">
                  <Label>Número de cuenta</Label>
                  <Input placeholder="Número de cuenta bancaria" />
                </div>
                <div className="space-y-2">
                  <Label>Nombre del titular</Label>
                  <Input placeholder="Nombre como aparece en la cuenta" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura cuándo recibir alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nuevos pedidos</p>
                    <p className="text-sm text-muted-foreground">Notificar cuando se registre un nuevo pedido</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pedidos urgentes</p>
                    <p className="text-sm text-muted-foreground">Alertas para pedidos con menos de 6 horas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Stock bajo</p>
                    <p className="text-sm text-muted-foreground">Cuando el inventario esté por debajo del mínimo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cierre de caja</p>
                    <p className="text-sm text-muted-foreground">Recordatorio para cerrar caja al final del día</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios de Notificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora de inicio</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora de fin</Label>
                    <Input type="time" defaultValue="20:00" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solo recibirás notificaciones dentro de este horario
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
