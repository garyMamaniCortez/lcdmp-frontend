import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types';
import { categoryLabels } from '@/types/consts';

interface FiltersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  showFilters: boolean;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

export function FiltersSection({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showFilters,
  onToggleFilters,
  onResetFilters,
  isLoading
}: FiltersSectionProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        {/* Mobile filter toggle */}
        <div className="flex sm:hidden items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-3`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
              <Input 
                placeholder="Buscar materias primas..." 
                className="pl-10 w-full text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Filters Button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="sm:w-10 h-10 shrink-0"
              onClick={onResetFilters}
              title="Restablecer filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Active filters indicator */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 text-xs  flex-wrap">
              <span>Filtros activos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: "{searchTerm}"
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Categoría: {categoryLabels[selectedCategory] || selectedCategory}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}