import { useEffect, useState } from 'react';
import { Check, Download, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentDetails, appointmentDate, appointmentTime, createAppointmentImage, downloadAppointmentImage } from '@/lib/appointmentCard';
import './Confirmation.css';

export default function AppointmentReceipt({ details, confirmed = true }: { details: AppointmentDetails; confirmed?: boolean }) {
  const [image, setImage] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setImage(null); setFailed(false);
    if (confirmed) createAppointmentImage(details).then(blob => { if (active) setImage(blob); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [details, confirmed, attempt]);
  const share = async () => {
    if (!image) return;
    const file = new File([image], `bookings-${details.id.slice(0, 8)}.png`, { type: 'image/png' });
    try {
      setSharing(true);
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Bookings appointment card' });
      else downloadAppointmentImage(image, details.id);
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) toast.error('Could not share. Please download the image instead.');
    } finally { setSharing(false); }
  };
  return <section className="appointment-receipt" dir="ltr" aria-label="Appointment card">
    <div className="receipt-brand"><span>Bookings</span><small>Your appointment details</small></div>
    <div className="receipt-paper">
      <div className="receipt-status">{confirmed && <Check size={18} />}<span>{confirmed ? 'Confirmed appointment' : 'Booking details'}</span></div>
      <h2>{details.provider}</h2>
      {(details.service || details.specialty) && <p className="receipt-specialty">{details.service || details.specialty}</p>}
      <dl className="receipt-details">
        <div className="receipt-date"><dt>Date</dt><dd>{appointmentDate(details.date)}</dd></div>
        <div><dt>Time</dt><dd className="receipt-time"><bdi>{appointmentTime(details.time)}</bdi></dd></div>
        {details.duration && <div><dt>Duration</dt><dd>{details.duration} minutes</dd></div>}
        {details.location && <div className="receipt-wide"><dt>Location</dt><dd>{details.location}</dd></div>}
        {details.guest && <div className="receipt-wide"><dt>Name</dt><dd>{details.guest}</dd></div>}
      </dl>
      <div className="receipt-reference"><span>Booking reference</span><bdi>{details.id.slice(0, 8).toUpperCase()}</bdi></div>
    </div>
    {confirmed && <div className="receipt-save">
      <button type="button" className="confirmation-primary" disabled={!image} onClick={() => image && downloadAppointmentImage(image, details.id)}>{!image && !failed ? <Loader2 className="confirmation-spin" size={18} /> : <Download size={18} />}{!image && !failed ? 'Preparing appointment card…' : 'Download appointment image'}</button>
      {image && <button type="button" className="confirmation-secondary" disabled={sharing} onClick={share}><Share2 size={18} />Share card</button>}
      {failed && <p role="alert">Could not prepare the image. <button type="button" onClick={() => setAttempt(v => v + 1)}>Try again</button></p>}
      <p>Keep your appointment details on your device.</p>
    </div>}
  </section>;
}
