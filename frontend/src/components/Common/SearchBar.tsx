// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from '@/components/ui/command';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { Search, X, Filter } from 'lucide-react';

// interface SearchBarProps {
//   placeholder?: string;
//   onSearch: (query: string) => void;
//   onFilter?: (filters: Record<string, any>) => void;
//   filters?: Array<{
//     key: string;
//     label: string;
//     options: Array<{ value: string; label: string }>;
//   }>;
//   className?: string;
// }

// export const SearchBar: React.FC<SearchBarProps> = ({
//   placeholder = 'Search...',
//   onSearch,
//   onFilter,
//   filters = [],
//   className = ''
// }) => {
//   const [query, setQuery] = useState('');
//   const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
//   const [open, setOpen] = useState(false);

//   const handleSearch = (value: string) => {
//     setQuery(value);
//     onSearch(value);
//   };

//   const handleFilterChange = (key: string, value: string) => {
//     const newFilters = { ...activeFilters };
//     if (value) {
//       newFilters[key] = value;
//     } else {
//       delete newFilters[key];
//     }
//     setActiveFilters(newFilters);
//     onFilter?.(newFilters);
//   };

//   const clearFilter = (key: string) => {
//     handleFilterChange(key, '');
//   };

//   const clearAllFilters = () => {
//     setActiveFilters({});
//     onFilter?.({});
//   };

//   return (
//     <div className={`space-y-3 ${className}`}>
//       {/* Search Input */}
//       <div className="relative flex-1">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder={placeholder}
//           value={query}
//           onChange={(e) => handleSearch(e.target.value)}
//           className="pl-10 pr-10"
//         />
//         {query && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleSearch('')}
//             className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
//           >
//             <X className="h-3 w-3" />
//           </Button>
//         )}
//       </div>

//       {/* Filters */}
//       {filters.length > 0 && (
//         <div className="flex flex-wrap items-center gap-2">
//           <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//               <Button variant="outline" size="sm" className="gap-1">
//                 <Filter className="h-3 w-3" />
//                 Filters
//                 {Object.keys(activeFilters).length > 0 && (
//                   <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
//                     {Object.keys(activeFilters).length}
//                   </Badge>
//                 )}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80 p-0">
//               <Command>
//                 <CommandInput placeholder="Search filters..." />
//                 <CommandList>
//                   <CommandEmpty>No filters found.</CommandEmpty>
//                   {filters.map((filter) => (
//                     <CommandGroup key={filter.key} heading={filter.label}>
//                       <CommandItem
//                         value=""
//                         onSelect={() => handleFilterChange(filter.key, '')}
//                       >
//                         All {filter.label}
//                       </CommandItem>
//                       {filter.options.map((option) => (
//                         <CommandItem
//                           key={option.value}
//                           value={option.value}
//                           onSelect={() => {
//                             handleFilterChange(filter.key, option.value);
//                             setOpen(false);
//                           }}
//                         >
//                           {option.label}
//                           {activeFilters[filter.key] === option.value && (
//                             <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
//                           )}
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   ))}
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>

//           {/* Active Filters */}
//           {Object.entries(activeFilters).map(([key, value]) => {
//             const filter = filters.find(f => f.key === key);
//             const option = filter?.options.find(o => o.value === value);
//             return (
//               <Badge key={key} variant="secondary" className="gap-1">
//                 {filter?.label}: {option?.label}
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => clearFilter(key)}
//                   className="h-3 w-3 p-0 hover:bg-transparent"
//                 >
//                   <X className="h-2 w-2" />
//                 </Button>
//               </Badge>
//             );
//           })}

//           {Object.keys(activeFilters).length > 0 && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
//             >
//               Clear all
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;
export default {}