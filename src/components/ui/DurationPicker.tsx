import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface Duration {
  hours: number;
  minutes: number;
}

interface DurationPickerProps {
  minHours?: number;
  maxHours?: number;
  minuteIntervals?: number[];
  defaultValue?: Duration;
  onChange: (duration: Duration) => void;
}

const DurationPicker: React.FC<DurationPickerProps> = ({
  minHours = 0,
  maxHours = 12,
  minuteIntervals = [0, 5, 10, 15, 30, 45],
  defaultValue = { hours: 0, minutes: 0 },
  onChange,
}) => {
  const [hours, setHours] = useState(defaultValue.hours);
  const [minutes, setMinutes] = useState(defaultValue.minutes);

  useEffect(() => {
    onChange({ hours, minutes });
  }, [hours, minutes, onChange]);

  const handleHoursChange = (value: string) => {
    setHours(parseInt(value, 10));
  };

  const handleMinutesChange = (value: string) => {
    setMinutes(parseInt(value, 10));
  };

  const hourOptions = Array.from(
    { length: maxHours - minHours + 1 },
    (_, i) => minHours + i
  );
  const minuteOptions = minuteIntervals;

  return (
    <div className="flex items-center space-x-2">
      <Select onValueChange={handleHoursChange} defaultValue={String(hours)}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Hours" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((hour) => (
            <SelectItem key={hour} value={String(hour)}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>:</span>
      <Select
        onValueChange={handleMinutesChange}
        defaultValue={String(minutes)}
      >
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Minutes" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((minute) => (
            <SelectItem key={minute} value={String(minute)}>
              {String(minute).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DurationPicker;
