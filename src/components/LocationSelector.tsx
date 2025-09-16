import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

interface Province {
  id: number;
  name_fa: string;
}

interface County {
  id: number;
  province_id: number;
  name_fa: string;
}

interface City {
  id: number;
  county_id: number;
  name_fa: string;
}

interface LocationSelectorProps {
  type: "origin" | "destination";
  onLocationChange: (location: {
    province_id?: number;
    county_id?: number;
    city_id?: number;
    province_name?: string;
    county_name?: string;
    city_name?: string;
  }) => void;
}

const LocationSelector = ({ type, onLocationChange }: LocationSelectorProps) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Load mock data
  useEffect(() => {
    // Mock provinces data
    setProvinces([
      { id: 1, name_fa: "تهران" },
      { id: 2, name_fa: "اصفهان" },
      { id: 3, name_fa: "فارس" },
      { id: 4, name_fa: "خراسان رضوی" }
    ]);
  }, []);

  const handleProvinceChange = (provinceId: string) => {
    const province = provinces.find(p => p.id === parseInt(provinceId));
    setSelectedProvince(province || null);
    setSelectedCounty(null);
    setSelectedCity(null);
    setCities([]);

    if (province) {
      // Mock counties based on province
      const mockCounties = {
        1: [
          { id: 100, province_id: 1, name_fa: "تهران" },
          { id: 101, province_id: 1, name_fa: "ری" },
          { id: 102, province_id: 1, name_fa: "شمیرانات" }
        ],
        2: [
          { id: 200, province_id: 2, name_fa: "اصفهان" },
          { id: 201, province_id: 2, name_fa: "کاشان" }
        ],
        3: [
          { id: 300, province_id: 3, name_fa: "شیراز" },
          { id: 301, province_id: 3, name_fa: "مرودشت" }
        ],
        4: [
          { id: 400, province_id: 4, name_fa: "مشهد" },
          { id: 401, province_id: 4, name_fa: "نیشابور" }
        ]
      };
      setCounties(mockCounties[province.id as keyof typeof mockCounties] || []);
    } else {
      setCounties([]);
    }

    onLocationChange({
      province_id: province?.id,
      province_name: province?.name_fa
    });
  };

  const handleCountyChange = (countyId: string) => {
    const county = counties.find(c => c.id === parseInt(countyId));
    setSelectedCounty(county || null);
    setSelectedCity(null);

    if (county) {
      // Mock cities based on county
      const mockCities = {
        100: [
          { id: 1000, county_id: 100, name_fa: "تهران" },
          { id: 1001, county_id: 100, name_fa: "ورامین" }
        ],
        101: [
          { id: 1100, county_id: 101, name_fa: "شهرری" }
        ],
        102: [
          { id: 1200, county_id: 102, name_fa: "شمیران" }
        ],
        200: [
          { id: 2000, county_id: 200, name_fa: "اصفهان" }
        ],
        201: [
          { id: 2100, county_id: 201, name_fa: "کاشان" }
        ],
        300: [
          { id: 3000, county_id: 300, name_fa: "شیراز" }
        ],
        301: [
          { id: 3100, county_id: 301, name_fa: "مرودشت" }
        ],
        400: [
          { id: 4000, county_id: 400, name_fa: "مشهد" }
        ],
        401: [
          { id: 4100, county_id: 401, name_fa: "نیشابور" }
        ]
      };
      setCities(mockCities[county.id as keyof typeof mockCities] || []);
    } else {
      setCities([]);
    }

    onLocationChange({
      province_id: selectedProvince?.id,
      county_id: county?.id,
      province_name: selectedProvince?.name_fa,
      county_name: county?.name_fa
    });
  };

  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    setSelectedCity(city || null);

    onLocationChange({
      province_id: selectedProvince?.id,
      county_id: selectedCounty?.id,
      city_id: city?.id,
      province_name: selectedProvince?.name_fa,
      county_name: selectedCounty?.name_fa,
      city_name: city?.name_fa
    });
  };

  const title = type === "origin" ? "مبدأ" : "مقصد";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      <div className="space-y-3">
        {/* Province Select */}
        <div>
          <label className="block text-sm font-medium mb-1">استان</label>
          <Select onValueChange={handleProvinceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب استان" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.name_fa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* County Select */}
        <div>
          <label className="block text-sm font-medium mb-1">شهرستان</label>
          <Select onValueChange={handleCountyChange} disabled={!selectedProvince}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب شهرستان" />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id.toString()}>
                  {county.name_fa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Select */}
        <div>
          <label className="block text-sm font-medium mb-1">شهر</label>
          <Select onValueChange={handleCityChange} disabled={!selectedCounty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب شهر" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name_fa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Breadcrumb */}
      {(selectedProvince || selectedCounty || selectedCity) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          {selectedProvince && (
            <>
              <span>{selectedProvince.name_fa}</span>
              {selectedCounty && (
                <>
                  <ChevronLeft size={16} />
                  <span>{selectedCounty.name_fa}</span>
                </>
              )}
              {selectedCity && (
                <>
                  <ChevronLeft size={16} />
                  <span>{selectedCity.name_fa}</span>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;