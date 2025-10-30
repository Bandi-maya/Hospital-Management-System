// import React, { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   ChevronsLeft, 
//   ChevronsRight,
//   ArrowUpDown,
//   ArrowUp,
//   ArrowDown,
//   MoreHorizontal
// } from 'lucide-react';

// export interface Column<T> {
//   key: keyof T | string;
//   header: string;
//   cell?: (item: T) => React.ReactNode;
//   sortable?: boolean;
//   className?: string;
// }

// export interface Action<T> {
//   label: string;
//   icon?: React.ComponentType<any>;
//   onClick: (item: T) => void;
//   className?: string;
//   disabled?: (item: T) => boolean;
// }

// interface DataTableProps<T> {
//   data: T[];
//   columns: Column<T>[];
//   actions?: Action<T>[];
//   pagination?: {
//     page: number;
//     pageSize: number;
//     total: number;
//     onPageChange: (page: number) => void;
//     onPageSizeChange: (pageSize: number) => void;
//   };
//   sorting?: {
//     column: string;
//     direction: 'asc' | 'desc';
//     onSort: (column: string, direction: 'asc' | 'desc') => void;
//   };
//   loading?: boolean;
//   emptyMessage?: string;
//   className?: string;
// }

// export function DataTable<T extends Record<string, any>>({
//   data,
//   columns,
//   actions = [],
//   pagination,
//   sorting,
//   loading = false,
//   emptyMessage = 'No data available',
//   className = ''
// }: DataTableProps<T>) {
//   const [selectedItems, setSelectedItems] = useState<T[]>([]);

//   const handleSort = (column: Column<T>) => {
//     if (!column.sortable || !sorting) return;
    
//     const direction = 
//       sorting.column === column.key && sorting.direction === 'asc' 
//         ? 'desc' 
//         : 'asc';
    
//     sorting.onSort(column.key as string, direction);
//   };

//   const getSortIcon = (column: Column<T>) => {
//     if (!column.sortable) return null;
    
//     if (sorting?.column !== column.key) {
//       return <ArrowUpDown className="ml-2 h-4 w-4" />;
//     }
    
//     return sorting.direction === 'asc' 
//       ? <ArrowUp className="ml-2 h-4 w-4" />
//       : <ArrowDown className="ml-2 h-4 w-4" />;
//   };

//   const renderCellValue = (item: T, column: Column<T>) => {
//     if (column.cell) {
//       return column.cell(item);
//     }
    
//     const value = item[column.key as keyof T];
    
//     if (value === null || value === undefined) {
//       return <span className="text-muted-foreground">—</span>;
//     }
    
//     if (typeof value === 'boolean') {
//       return (
//         <Badge variant={value ? 'default' : 'secondary'}>
//           {value ? 'Yes' : 'No'}
//         </Badge>
//       );
//     }
    
//     if (value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Date]') {
//       return (value as Date).toLocaleDateString();
//     }
    
//     return String(value);
//   };

//   const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

//   if (loading) {
//     return (
//       <div className={`rounded-md border ${className}`}>
//         <div className="p-8 text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-2 text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-4 ${className}`}>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               {columns.map((column) => (
//                 <TableHead 
//                   key={column.key as string}
//                   className={column.className}
//                 >
//                   {column.sortable ? (
//                     <Button
//                       variant="ghost"
//                       onClick={() => handleSort(column)}
//                       className="h-auto p-0 font-medium"
//                     >
//                       {column.header}
//                       {getSortIcon(column)}
//                     </Button>
//                   ) : (
//                     column.header
//                   )}
//                 </TableHead>
//               ))}
//               {actions.length > 0 && (
//                 <TableHead className="text-right">Actions</TableHead>
//               )}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {data.length === 0 ? (
//               <TableRow>
//                 <TableCell 
//                   colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
//                   className="h-24 text-center"
//                 >
//                   {emptyMessage}
//                 </TableCell>
//               </TableRow>
//             ) : (
//               data.map((item, index) => (
//                 <TableRow key={item.id || index} className="hover:bg-accent/50">
//                   {columns.map((column) => (
//                     <TableCell 
//                       key={column.key as string}
//                       className={column.className}
//                     >
//                       {renderCellValue(item, column)}
//                     </TableCell>
//                   ))}
//                   {actions.length > 0 && (
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                           <DropdownMenuSeparator />
//                           {actions.map((action, actionIndex) => (
//                             <DropdownMenuItem
//                               key={actionIndex}
//                               onClick={() => action.onClick(item)}
//                               className={action.className}
//                               disabled={action.disabled?.(item)}
//                             >
//                               {action.icon && <action.icon className="mr-2 h-4 w-4" />}
//                               {action.label}
//                             </DropdownMenuItem>
//                           ))}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       {pagination && (
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <p className="text-sm text-muted-foreground">
//               Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
//               {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
//               {pagination.total} entries
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-6">
//             <div className="flex items-center space-x-2">
//               <p className="text-sm font-medium">Rows per page</p>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" size="sm">
//                     {pagination.pageSize}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   {[10, 20, 30, 40, 50].map((pageSize) => (
//                     <DropdownMenuItem
//                       key={pageSize}
//                       onClick={() => pagination.onPageSizeChange(pageSize)}
//                     >
//                       {pageSize}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
            
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => pagination.onPageChange(1)}
//                 disabled={pagination.page === 1}
//               >
//                 <ChevronsLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => pagination.onPageChange(pagination.page - 1)}
//                 disabled={pagination.page === 1}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
              
//               <div className="flex items-center space-x-1">
//                 <span className="text-sm font-medium">
//                   Page {pagination.page} of {totalPages}
//                 </span>
//               </div>
              
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => pagination.onPageChange(pagination.page + 1)}
//                 disabled={pagination.page === totalPages}
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => pagination.onPageChange(totalPages)}
//                 disabled={pagination.page === totalPages}
//               >
//                 <ChevronsRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DataTable;
export default {}