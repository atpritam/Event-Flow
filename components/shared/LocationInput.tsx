import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_LOCATION_API;

  const debouncedFetchSuggestions = useRef(
    debounce(async (input: string) => {
      if (
        input.length < 3 ||
        input.toLowerCase().includes("onl") ||
        !validateInput(input)
      ) {
        setSuggestions([]);
        setErrorMessage(null);
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
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "google-map-places.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        const predictions = response.data.predictions.map(
          (pred: any) => pred.description
        );
        setSuggestions(predictions);
        setErrorMessage(null);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 429) {
            setRateLimitReached(true);
            setErrorMessage(
              "Rate limit reached. Suggestions are temporarily unavailable."
            );
          } else {
            setErrorMessage(
              "Failed to fetch location suggestions. Please try again."
            );
          }
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
        setSuggestions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (!rateLimitReached) {
      debouncedFetchSuggestions(value);
    }
  }, [value, rateLimitReached, debouncedFetchSuggestions]);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
  };

  const validateInput = (input: string) => {
    const specialCharPattern = /[^a-zA-Z0-9, ]/;
    return !specialCharPattern.test(input) && input.length <= 100;
  };

  return (
    <div className="relative">
      <Input
        placeholder="Event Location / Online"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue);
          setShowDropdown(true);
        }}
        className="input-field"
      />
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      {showDropdown && suggestions.length > 0 && !rateLimitReached && (
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

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default LocationInput;
