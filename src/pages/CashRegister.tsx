import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Minus, DollarSign, QrCode, Banknote, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockCashRegister } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function CashRegister() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'sale' | 'deposit' | 'expense'>('sale');

  const cashTransactions = mockCashRegister.transactions.filter(t => t.method === 'cash');
  const qrTransactions = mockCashRegister.transactions.filter(t => t.method === 'qr');

  const cashTotal = cashTransactions.reduce((sum, t) => sum + t.amount, mockCashRegister.openingBalance);
  const qrTotal = qrTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalSales = mockCashRegister.transactions
    .filter(t => t.type === 'sale' || t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    mockCashRegister.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Transacción registrada');
    setIsAddTransactionOpen(false);
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Caja cerrada correctamente');
    setIsCloseRegisterOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Caja</h1>
            <p className="text-muted-foreground">
              {format(mockCashRegister.date, 'EEEE, dd MMMM yyyy', { locale: es })}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de transacción</Label>
                    <Select value={transactionType} onValueChange={(v) => setTransactionType(v as typeof transactionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venta</SelectItem>
                        <SelectItem value="deposit">Adelanto de pedido</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto (Bs.)</Label>
                    <Input type="number" placeholder="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Método de pago</Label>
                    <Select defaultValue="cash">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="qr">QR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea placeholder="Descripción de la transacción..." required />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCloseRegisterOpen} onOpenChange={setIsCloseRegisterOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cerrar Caja del Día</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCloseRegister} className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Saldo inicial:</span>
                      <span>Bs. {mockCashRegister.openingBalance}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>+ Ingresos:</span>
                      <span>Bs. {totalSales}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Gastos:</span>
                      <span>Bs. {totalExpenses}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total en caja:</span>
                      <span>Bs. {cashTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Monto contado en caja (Bs.)</Label>
                    <Input type="number" placeholder="0" defaultValue={cashTotal} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Saldo inicial para mañana (Bs.)</Label>
                    <Input type="number" placeholder="500" defaultValue="500" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Notas (opcional)</Label>
                    <Textarea placeholder="Observaciones del cierre..." />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCloseRegisterOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Confirmar Cierre</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                  <Banknote className="h-5 w-5" />
                </div>
                <Badge variant="outline">Efectivo</Badge>
              </div>
              <p className="text-2xl font-bold mt-3">Bs. {cashTotal}</p>
              <p className="text-sm text-muted-foreground">En caja</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                  <QrCode className="h-5 w-5" />
                </div>
                <Badge variant="outline">Digital</Badge>
              </div>
              <p className="text-2xl font-bold mt-3">Bs. {qrTotal}</p>
              <p className="text-sm text-muted-foreground">Pagos QR</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3 text-green-600">+Bs. {totalSales}</p>
              <p className="text-sm text-muted-foreground">Ingresos del día</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3 text-red-600">-Bs. {totalExpenses}</p>
              <p className="text-sm text-muted-foreground">Gastos del día</p>
            </CardContent>
          </Card>
        </div>

        {/* Opening Balance */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo de apertura</p>
              <p className="text-xl font-bold">Bs. {mockCashRegister.openingBalance}</p>
            </div>
            <Badge variant={mockCashRegister.status === 'open' ? 'default' : 'secondary'}>
              {mockCashRegister.status === 'open' ? 'Caja Abierta' : 'Caja Cerrada'}
            </Badge>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos del Día</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCashRegister.transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-muted-foreground">
                      {format(transaction.createdAt, 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === 'sale' ? 'default' :
                        transaction.type === 'deposit' ? 'secondary' :
                        transaction.type === 'expense' ? 'destructive' : 'outline'
                      }>
                        {transaction.type === 'sale' ? 'Venta' :
                         transaction.type === 'deposit' ? 'Adelanto' :
                         transaction.type === 'expense' ? 'Gasto' : 'Ajuste'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.method === 'cash' ? (
                          <Banknote className="h-4 w-4" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {transaction.method === 'cash' ? 'Efectivo' : 'QR'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}Bs. {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
