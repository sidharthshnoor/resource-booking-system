import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import bookingService from '../../services/booking.service';
import { Info, MapPin, Users } from 'lucide-react';

export default function ResourceDetails({ resource, isOpen, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert date + time strings to ISO strings for backend
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      await bookingService.createBooking({
        resource_id: resource.id,
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: formData.purpose
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/app/bookings');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to schedule booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Booking Confirmed">
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <h3 style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-2)' }}>Success!</h3>
          <p>Your booking request for {resource.name} has been submitted.</p>
        </div>
      </Modal>
    );
  }

  const footer = (
    <div className="flex justify-between items-center w-full">
      <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
      <Button isLoading={loading} type="submit" form="booking-form">Submit Booking</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule: ${resource.name}`} footer={footer}>
      <div className="flex flex-col gap-6">
        
        {/* Resource Summary */}
        <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: '0 0 var(--spacing-2) 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{resource.description}</p>
          <div className="flex gap-4" style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
            <span className="flex items-center gap-1"><MapPin size={14}/> {resource.location}</span>
            <span className="flex items-center gap-1"><Users size={14}/> {resource.capacity}</span>
            <span className="flex items-center gap-1"><Info size={14}/> {resource.type}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-status-rejected-bg)', color: 'var(--color-status-rejected-text)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Booking Form */}
        <form id="booking-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input 
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          
          <div className="flex gap-4">
            <Input 
              label="Start Time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <Input 
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <Input 
            label="Purpose"
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="e.g. Quarterly Planning Meeting"
            required
          />
        </form>
      </div>
    </Modal>
  );
}
