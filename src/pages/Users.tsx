import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileCard, MobileCardHeader, useIsMobile } from '@/components/ui/responsive-table';
import { Plus, Search, Edit2, Trash2, Users as UsersIcon, Shield } from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';

const mockUsers = [
  { id: '1', email: 'admin@lacasademipa.com', name: 'Carlos Administrador', roles: ['admin'] as UserRole[], createdAt: new Date() },
  { id: '2', email: 'vendedor@lacasademipa.com', name: 'María Vendedora', roles: ['seller'] as UserRole[], createdAt: new Date() },
  { id: '3', email: 'panadero@lacasademipa.com', name: 'Juan Panadero', roles: ['baker'] as UserRole[], createdAt: new Date() },
  { id: '4', email: 'decorador@lacasademipa.com', name: 'Ana Decoradora', roles: ['designer'] as UserRole[], createdAt: new Date() },
  { id: '5', email: 'armador@lacasademipa.com', name: 'Pedro Armador', roles: ['assembler'] as UserRole[], createdAt: new Date() },
  { id: '6', email: 'delivery@lacasademipa.com', name: 'Luis Delivery', roles: ['delivery'] as UserRole[], createdAt: new Date() },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  seller: 'Vendedor',
  baker: 'Hornos',
  designer: 'Diseño',
  assembler: 'Armado',
  delivery: 'Delivery',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  seller: 'bg-blue-100 text-blue-800',
  baker: 'bg-orange-100 text-orange-800',
  designer: 'bg-purple-100 text-purple-800',
  assembler: 'bg-cyan-100 text-cyan-800',
  delivery: 'bg-green-100 text-green-800',
};

export default function Users() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Usuario creado exitosamente');
    setIsDialogOpen(false);
    setSelectedRoles([]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground">Gestión de usuarios y roles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre completo *</Label>
                  <Input placeholder="Nombre del usuario" required />
                </div>
                <div className="space-y-2">
                  <Label>Correo electrónico *</Label>
                  <Input type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña *</Label>
                  <Input type="password" placeholder="Contraseña segura" required />
                </div>
                <div className="space-y-2">
                  <Label>Roles *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(roleLabels) as UserRole[]).map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox 
                          id={role} 
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={() => toggleRole(role)}
                        />
                        <label htmlFor={role} className="text-sm cursor-pointer">
                          {roleLabels[role]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={selectedRoles.length === 0}>
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
                <p className="text-sm text-muted-foreground">Total usuarios</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-800 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockUsers.filter(u => u.roles.includes('admin')).length}
                </p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuarios..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table / Mobile Cards */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <MobileCard key={user.id}>
                <MobileCardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={user.roles.includes('admin')}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </MobileCardHeader>
                
                <div className="flex flex-wrap gap-1 pt-2">
                  {user.roles.map(role => (
                    <Badge key={role} className={roleColors[role]}>
                      {roleLabels[role]}
                    </Badge>
                  ))}
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <Badge key={role} className={roleColors[role]}>
                              {roleLabels[role]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={user.roles.includes('admin')}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
