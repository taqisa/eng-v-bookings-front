import { Check } from 'lucide-react';
import { clockParts, groupTimeSlots } from '@/lib/timeSlots';
import './TimeSlotPicker.css';

export default function TimeSlotPicker({slots,selected,onSelect,disabled=false,duration}: {slots:string[];selected:string;onSelect:(time:string)=>void;disabled?:boolean;duration:number}) {
  return <div className="booking-times" dir="ltr">
    <p className="booking-times-intro">Choose a start time <span>{duration} minutes per appointment</span></p>
    {groupTimeSlots(slots).map(group => <fieldset key={group.title} disabled={disabled} className="booking-time-group"><legend>{group.title}<span>{group.slots.length} available</span></legend><div className="booking-time-grid">{group.slots.map(raw => {
      const time = clockParts(raw);
      return <button key={raw} type="button" aria-pressed={selected === raw} aria-label={time ? `${time.clock} ${time.period}` : raw} onClick={() => onSelect(raw)} className="booking-time-option"><span dir="ltr">{time?.clock || raw}</span>{time && <small>{time.period}</small>}<Check size={14} aria-hidden="true" className="time-selected-check" /></button>;
    })}</div></fieldset>)}
    {selected && <p className="booking-time-selection" role="status"><Check size={16} aria-hidden="true" />Selected time: <bdi>{clockParts(selected)?.clock || selected}</bdi> {clockParts(selected)?.period}</p>}
  </div>;
}
