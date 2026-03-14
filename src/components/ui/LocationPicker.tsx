'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LocationPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  address: string;
  city: string;
  state: string;
  pincode: string;
  onLocationChange: (location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => void;
  errors?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  registerAddress: React.InputHTMLAttributes<HTMLInputElement>;
  registerCity: React.InputHTMLAttributes<HTMLInputElement>;
  registerState: React.InputHTMLAttributes<HTMLInputElement>;
  registerPincode: React.InputHTMLAttributes<HTMLInputElement>;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
    county?: string;
    state_district?: string;
    neighbourhood?: string;
  };
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  errors,
  registerAddress,
  registerCity,
  registerState,
  registerPincode,
}: LocationPickerProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(value), 400);
  };

  const selectSuggestion = (result: NominatimResult) => {
    const addr = result.address;
    const parts = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean);
    const fullAddress = parts.length > 0 ? parts.join(', ') : result.display_name.split(',').slice(0, 2).join(',');
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || addr.state_district || '';
    const pincode = addr.postcode || '';

    onLocationChange({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: fullAddress,
      city,
      state,
      pincode,
    });

    setSearchQuery(result.display_name);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data: NominatimResult = await res.json();
          selectSuggestion(data);
        } catch {
          onLocationChange({ latitude: lat, longitude: lng, address: '', city: '', state: '', pincode: '' });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search for a place or address..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="shrink-0"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((result, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(result)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700 line-clamp-2">{result.display_name}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {latitude && longitude && (
        <p className="text-xs text-gray-500">
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}

      {/* Manual fields */}
      <Input label="Address" error={errors?.address} {...registerAddress} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" error={errors?.city} {...registerCity} />
        <Input label="State" error={errors?.state} {...registerState} />
      </div>
      <Input label="Pincode" error={errors?.pincode} {...registerPincode} />
    </div>
  );
}
