import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  SearchResultType,
  useSearch,
  type SearchResult,
} from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, User, LogOut, Menu, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  onToggleSidebar?: () => void;
  onMobileSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
  mobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onMobileSidebarToggle,
  sidebarCollapsed = false,
  isMobile = false,
  mobileSidebarOpen = false,
}) => {
  const { user, logout }: any = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
  } = useSearch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /** Auto focus input when mobile search is opened */
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  /** Close search if user clicks outside (mobile only) */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        handleSearchClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSearchOpen]);

  /** Toggle visibility of dropdown results */
  useEffect(() => {
    setShowResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) performSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) performSearch(value);
    else {
      clearSearch();
      setShowResults(false);
    }
  };

  const handleSearchItemClick = (item: SearchResult) => {
    switch (item.type) {
      case "patient":
        navigate(`/patients/${item.id}`);
        break;
      case "doctor":
        navigate(`/doctors/${item.id}`);
        break;
      case "appointment":
        navigate(`/appointments/${item.id}`);
        break;
      case "medicine":
        navigate(`/medicines/${item.id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    handleSearchClose();
    clearSearch();
  };

  const handleProfileSettings = () => navigate("/settings");

  const handleMobileMenuToggle = () => onMobileSidebarToggle?.();

  const handleToggleSidebar = () => onToggleSidebar?.();

  const handleSearchToggle = () => {
    if (isMobile) {
      setIsSearchOpen((prev) => !prev);
      if (isSearchOpen) {
        clearSearch();
        setShowResults(false);
      }
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setShowResults(false);
    clearSearch();
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    handleSearchClose();
    clearSearch();
  };

  const handleSearchContainerClick = (e: React.MouseEvent) => e.stopPropagation();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "doctor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "nurse":
        return "bg-green-100 text-green-800 border-green-200";
      case "patient":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const getItemIcon = (type: SearchResultType) => {
    switch (type) {
      case "patient":
        return "👤";
      case "doctor":
        return "👨‍⚕️";
      case "appointment":
        return "📅";
      case "medicine":
        return "💊";
      default:
        return "📄";
    }
  };

  /** Search Results Component (for both desktop & mobile) */
  const SearchResultsList = () => (
    <div className="max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in">
      {isSearching ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Searching...</span>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <div className="p-2">
            {searchResults.slice(0, 6).map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleSearchItemClick(item)}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-200 active:bg-gray-100"
              >
                <span>{getItemIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name || item.title}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {item.type} • {item.subtitle}
                  </p>
                </div>
                {item.badge && (
                  <Badge variant="outline" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          {searchResults.length > 6 && (
            <div
              onClick={handleViewAllResults}
              className="p-3 text-center text-sm text-blue-600 hover:bg-blue-50 cursor-pointer rounded-b-lg"
            >
              View all {searchResults.length} results
            </div>
          )}
        </>
      ) : searchQuery.trim() ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No results found for "{searchQuery}"
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500">
          Start typing to search...
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuToggle}
              className="h-9 w-9 border border-gray-200 rounded-lg md:hidden hover:bg-gray-50"
            >
              {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSidebar}
                className="hidden md:flex h-9 w-9 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            )}

            <span className="text-lg font-bold text-blue-600">HMS</span>
          </div>

          {/* Center: Desktop Search */}
          <div className="hidden md:block w-full max-w-lg relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search patients, doctors, appointments..."
                  className="pl-10 pr-8 w-full border-gray-300 focus:border-blue-500 transition-all"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowResults(true)}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery("");
                      clearSearch();
                      setShowResults(false);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50">
                <SearchResultsList />
              </div>
            )}
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
              className="md:hidden h-9 w-9 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white border-2 border-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 border animate-fade-in">
                <DropdownMenuLabel className="font-semibold border-b pb-2">
                  Notifications
                </DropdownMenuLabel>
                <div className="p-3">
                  <div className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New appointment request</p>
                      <p className="text-xs text-gray-500">John Smith requested an appointment</p>
                      <p className="text-[10px] text-gray-400 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 border border-gray-200 rounded-lg p-0"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border rounded-lg animate-fade-in">
                <DropdownMenuLabel className="p-4 border-b">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${getRoleColor(user?.role || "")}`}
                  >
                    {user?.role?.toUpperCase()}
                  </Badge>
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={handleProfileSettings}>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && isSearchOpen && (
          <div
            ref={searchContainerRef}
            onClick={handleSearchContainerClick}
            className="absolute top-full left-0 right-0 bg-white shadow-lg border-t animate-fade-in"
          >
            <div className="p-4 flex items-center gap-2 border-b">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                className="flex-1 border-gray-300 focus:border-blue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>

            {showResults && (
              <div className="max-h-96 overflow-y-auto">
                <SearchResultsList />
              </div>
            )}
          </div>
        )}
      </header>

      {/* Overlay when mobile search is active */}
      {isMobile && isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
          onClick={handleSearchClose}
        />
      )}
    </>
  );
};

export default Header;
