import React, { useState } from 'react';

interface TimePickerProps {
  onTimeChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange }) => {
  const [hours, setHours] = useState('9');
  const [minutes, setMinutes] = useState('41');
  const [period, setPeriod] = useState('AM');

  const handleSave = () => {
    onTimeChange(`${hours}:${minutes} ${period}`);
  };

  return (
    <div className="alarm-container">
      <h2>إعداد المنبه</h2>
      <div className="time-select">
        <select value={hours} onChange={(e) => setHours(e.target.value)}>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
        <select value={minutes} onChange={(e) => setMinutes(e.target.value)}>
          <option value="38">38</option>
          <option value="39">39</option>
          <option value="40">40</option>
          <option value="41">41</option>
          <option value="42">42</option>
          <option value="43">43</option>
          <option value="44">44</option>
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="AM">ص</option>
          <option value="PM">م</option>
        </select>
      </div>
      <button onClick={() => onTimeChange('')}>إلغاء</button>
      <button onClick={handleSave}>حفظ</button>
    </div>
  );
};

export default TimePicker;
