import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [rateLimitReached, setRateLimitReached] = useState(false);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (
        rateLimitReached ||
        input.length < 3 ||
        input.toLowerCase().includes("onl")
      ) {
        setSuggestions([]);
        return;
      }

      const options = {
        method: "GET",
        url: "https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json",
        params: {
          input,
          radius: "1000",
          language: "en",
        },
        headers: {
          "x-rapidapi-key": process.env.LOCATION_API || "",
          "x-rapidapi-host": "google-map-places.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        const predictions = response.data.predictions.map(
          (pred: any) => pred.description
        );
        setSuggestions(predictions);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 429) {
            setRateLimitReached(true);
          }
        } else {
          console.error("Error fetching location suggestions:", error);
        }
        setSuggestions([]);
      }
    },
    [rateLimitReached]
  );

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  useEffect(() => {
    debouncedFetchSuggestions(value);
  }, [value, debouncedFetchSuggestions]);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Event Location / Online"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        className="input-field"
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
