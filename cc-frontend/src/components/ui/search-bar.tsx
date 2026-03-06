import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "./spinner";

interface SearchBarProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Called when the search is submitted (button click or Enter key) */
  onSearch?: (value: string) => void;
  /** Called on every keystroke */
  onChange?: (value: string) => void;
  /** Controlled value */
  value?: string;
  /** Default uncontrolled value */
  defaultValue?: string;
  /** Show a clear button when there is input */
  clearable?: boolean;
  /** Disable the search bar */
  disabled?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
  /** Loading state — shows a spinner inside the button */
  loading?: boolean;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  onChange,
  value,
  defaultValue = "",
  clearable = true,
  disabled = false,
  className,
  loading = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleSearch = () => {
    onSearch?.(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 w-full max-w-xl",
        className
      )}
    >
      {/* Input wrapper */}
      <div className="relative flex-1">
        {/* Leading search icon */}
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={16}
        />

        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-9 pr-9 h-10 rounded-lg border border-input bg-background",
            "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:border-primary",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Clear button */}
        {clearable && inputValue.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-150"
            )}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search button */}
      <Button
        onClick={handleSearch}
        disabled={disabled || loading}
        className="h-10 px-4 gap-2 shrink-0"
      >
        {loading ? (
          /* Spinner */
          <Spinner />
        ) : (
          <Search size={15} />
        )}
        <span>{loading ? "Searching..." : "Search"}</span>
      </Button>
    </div>
  );
}