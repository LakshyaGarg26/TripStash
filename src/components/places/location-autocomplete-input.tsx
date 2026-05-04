"use client";

import { Check, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PlaceSuggestion = {
  id: string;
  label: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  source: "geoapify" | "openstreetmap";
};

export function LocationAutocompleteInput({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [selected, setSelected] = useState<PlaceSuggestion | null>(
    defaultValue
      ? {
          id: `existing:${defaultValue}`,
          label: defaultValue,
          name: defaultValue,
          address: defaultValue,
          latitude: 0,
          longitude: 0,
          source: "geoapify",
        }
      : null,
  );
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIsCurrent = selected?.label === value;
  const canSearch = !selectedIsCurrent && value.trim().length >= 2;
  const showSuggestions = isOpen && canSearch;
  const statusText = useMemo(() => {
    if (!value.trim()) return "Choose a destination from search results.";
    if (selectedIsCurrent) return "Selected destination.";
    if (value.trim().length < 2) return "Type at least 2 characters.";
    return "Select one destination from the list.";
  }, [selectedIsCurrent, value]);

  useEffect(() => {
    const query = value.trim();

    if (!canSearch) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          suggestions?: PlaceSuggestion[];
        };
        setSuggestions(payload.suggestions ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [canSearch, value]);

  function handleSelect(suggestion: PlaceSuggestion) {
    setSelected(suggestion);
    setValue(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
  }

  return (
    <div className="relative lg:col-span-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          autoComplete="off"
          className={cn("pl-9 pr-9", selectedIsCurrent && "border-primary")}
          name="destinationSearch"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setValue(event.target.value);
            setSelected(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search and select a destination"
          required
          role="combobox"
          value={value}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-3 size-4 animate-spin text-muted-foreground" />
        ) : selectedIsCurrent ? (
          <Check className="absolute right-3 top-3 size-4 text-primary" />
        ) : null}
      </div>

      <input name="destination" type="hidden" value={selectedIsCurrent ? selected.name : ""} />
      <input
        name="destinationPlaceId"
        type="hidden"
        value={selectedIsCurrent ? selected.id : ""}
      />
      <input
        name="destinationLabel"
        type="hidden"
        value={selectedIsCurrent ? selected.label : ""}
      />

      <p
        className={cn(
          "mt-1 text-xs",
          selectedIsCurrent ? "text-primary" : "text-muted-foreground",
        )}
      >
        {statusText}
      </p>

      {showSuggestions ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md">
          {isLoading && canSearch ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching places...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                key={suggestion.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
                type="button"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>
                  <span className="block font-medium">{suggestion.name}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {suggestion.address}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No matching places found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
