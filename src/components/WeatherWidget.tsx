import { useGuest } from '@/contexts/GuestContext';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow';
  wind: number;
  precipitation: number;
}

const mockWeather = {
  today: {
    temp: 5,
    condition: 'cloudy' as const,
    wind: 12,
    precipitation: 20,
  },
  tomorrow: {
    temp: 3,
    condition: 'rain' as const,
    wind: 18,
    precipitation: 80,
  },
};

const WeatherWidget = () => {
  const { language } = useGuest();

  const getWeatherIcon = (condition: WeatherData['condition'], size = 'h-12 w-12') => {
    switch (condition) {
      case 'sunny':
        return <Sun className={`${size} text-amber-400`} />;
      case 'cloudy':
        return <Cloud className={`${size} text-gray-300`} />;
      case 'rain':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'snow':
        return <CloudSnow className={`${size} text-blue-100`} />;
    }
  };

  const getConditionText = (condition: WeatherData['condition']) => {
    const texts = {
      sunny: { da: 'Sol', en: 'Sunny', de: 'Sonnig', nl: 'Zonnig' },
      cloudy: { da: 'Overskyet', en: 'Cloudy', de: 'Bewölkt', nl: 'Bewolkt' },
      rain: { da: 'Regn', en: 'Rain', de: 'Regen', nl: 'Regen' },
      snow: { da: 'Sne', en: 'Snow', de: 'Schnee', nl: 'Sneeuw' },
    };
    return texts[condition][language] || texts[condition]['en'];
  };

  const getGradient = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'from-amber-400 to-orange-500';
      case 'cloudy':
        return 'from-gray-400 to-slate-500';
      case 'rain':
        return 'from-blue-400 to-indigo-500';
      case 'snow':
        return 'from-blue-200 to-cyan-400';
    }
  };

  const labels = {
    today: { da: 'I dag', en: 'Today', de: 'Heute', nl: 'Vandaag' },
    tomorrow: { da: 'I morgen', en: 'Tomorrow', de: 'Morgen', nl: 'Morgen' },
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* I dag */}
      <div className={`rounded-2xl bg-gradient-to-br ${getGradient(mockWeather.today.condition)} p-4 text-white shadow-lg`}>
        <p className="text-xs font-medium opacity-80 mb-1">
          {labels.today[language] || labels.today['en']}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold">{mockWeather.today.temp}°</p>
            <p className="text-sm opacity-90">{getConditionText(mockWeather.today.condition)}</p>
          </div>
          {getWeatherIcon(mockWeather.today.condition)}
        </div>
        <div className="flex gap-4 mt-3 text-xs opacity-80">
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            {mockWeather.today.wind} m/s
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {mockWeather.today.precipitation}%
          </span>
        </div>
      </div>

      {/* I morgen */}
      <div className={`rounded-2xl bg-gradient-to-br ${getGradient(mockWeather.tomorrow.condition)} p-4 text-white shadow-lg`}>
        <p className="text-xs font-medium opacity-80 mb-1">
          {labels.tomorrow[language] || labels.tomorrow['en']}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold">{mockWeather.tomorrow.temp}°</p>
            <p className="text-sm opacity-90">{getConditionText(mockWeather.tomorrow.condition)}</p>
          </div>
          {getWeatherIcon(mockWeather.tomorrow.condition)}
        </div>
        <div className="flex gap-4 mt-3 text-xs opacity-80">
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            {mockWeather.tomorrow.wind} m/s
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {mockWeather.tomorrow.precipitation}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
