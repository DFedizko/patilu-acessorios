import type { InputHTMLAttributes } from "react";
import { SearchIcon } from "@/components/ui/icons/search-icon";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = ({ className = "", ...inputProps }: SearchInputProps) => (
    <div className="flex items-center gap-2 input-base px-3">
        <input
            className={`w-full border-none bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted ${className}`}
            {...inputProps}
        />
        <SearchIcon className="size-4 shrink-0 text-ink-muted" />
    </div>
);
