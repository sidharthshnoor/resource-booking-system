import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function InteractiveCalendar({ bookings, resources, isAdmin }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'month', 'week', 'day'
  
  const actualCurrentDate = new Date();

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderHeader = () => {
    const dateFormat = view === 'month' ? 'MMMM yyyy' : 'MMMM yyyy';
    return (
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrev} style={{ padding: 'var(--spacing-2)' }}>
            <ChevronLeft size={20} />
          </Button>
          <Button variant="outline" onClick={handleToday}>Today</Button>
          <Button variant="outline" onClick={handleNext} style={{ padding: 'var(--spacing-2)' }}>
            <ChevronRight size={20} />
          </Button>
          <h2 style={{ marginLeft: 'var(--spacing-4)', margin: 0, fontSize: '1.25rem' }}>
            {format(currentDate, dateFormat)}
          </h2>
        </div>
        
        <div className="flex gap-2" style={{ backgroundColor: 'var(--color-surface-muted)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => setView('month')}
            style={{ 
              padding: '4px 12px', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: view === 'month' ? 'var(--color-surface)' : 'transparent',
              boxShadow: view === 'month' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'month' ? 600 : 400
            }}
          >Month</button>
          <button 
            onClick={() => setView('week')}
            style={{ 
              padding: '4px 12px', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: view === 'week' ? 'var(--color-surface)' : 'transparent',
              boxShadow: view === 'week' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'week' ? 600 : 400
            }}
          >Week</button>
          <button 
            onClick={() => setView('day')}
            style={{ 
              padding: '4px 12px', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: view === 'day' ? 'var(--color-surface)' : 'transparent',
              boxShadow: view === 'day' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'day' ? 600 : 400
            }}
          >Day</button>
        </div>
      </div>
    );
  };

  const renderBooking = (booking) => {
    const res = resources[booking.resource_id];
    const isPending = booking.status === 'PENDING';
    const isCompleted = new Date(booking.end_time) <= actualCurrentDate;
    
    let bgColor = isPending ? 'var(--color-status-pending-bg)' : 'var(--color-surface)';
    let borderColor = isPending ? 'var(--color-status-pending-text)' : 'var(--color-primary)';
    
    if (isCompleted) {
       bgColor = 'var(--color-surface-muted)';
       borderColor = 'var(--color-text-placeholder)';
    }

    return (
      <div 
        key={booking.id} 
        className={isCompleted ? 'booking-completed' : ''}
        style={{ 
          padding: 'var(--spacing-2)', 
          marginBottom: 'var(--spacing-2)', 
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
          {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
        </div>
        <div style={{ fontWeight: 500, marginBottom: '2px' }}>{res?.name}</div>
        {!isAdmin && (
          <div style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {booking.purpose}
          </div>
        )}
        {isAdmin && <div style={{ color: 'var(--color-text-secondary)' }}>User: {booking.user_name || booking.user_id}</div>}
        
        {isPending && !isCompleted && <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'var(--color-status-pending-text)' }}>PENDING</div>}
        {isCompleted && <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>COMPLETED</div>}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const dateFormat = 'd';
    const rows = [];
    
    let days = [];
    let day = startDate;
    let formattedDate = '';
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayBookings = bookings.filter(b => isSameDay(new Date(b.start_time), cloneDay));
        
        days.push(
          <div 
            key={day} 
            style={{ 
              flex: '1 1 0', 
              minHeight: '120px', 
              borderRight: '1px solid var(--color-border)', 
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: !isSameMonth(day, monthStart) ? 'var(--color-surface-hover)' : 'var(--color-surface)',
              padding: 'var(--spacing-1)',
              width: '14%'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              padding: '4px' 
            }}>
              <span style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isToday(day) ? 'var(--color-secondary)' : 'transparent',
                color: isToday(day) ? 'white' : 'var(--color-text-primary)',
                fontWeight: isToday(day) ? 600 : 400
              }}>
                {formattedDate}
              </span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '80px' }}>
              {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(booking => renderBooking(booking))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex w-full" key={day} style={{ minWidth: '700px' }}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
        <div className="flex w-full" style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)', minWidth: '700px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ flex: '1 1 0', padding: 'var(--spacing-2)', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
              {d}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dayBookings = bookings.filter(b => isSameDay(new Date(b.start_time), date));
      
      days.push(
        <div key={i} style={{ flex: 1, borderRight: i < 6 ? '1px solid var(--color-border)' : 'none', minWidth: '150px' }}>
          <div style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
            <div style={{ fontWeight: 600 }}>{format(date, 'EEEE')}</div>
            <div style={{ color: isToday(date) ? 'var(--color-secondary)' : 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: isToday(date) ? 600 : 400 }}>
              {format(date, 'MMM d')}
            </div>
          </div>
          
          <div style={{ padding: 'var(--spacing-2)', minHeight: '400px', backgroundColor: 'var(--color-background)' }}>
            {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(booking => renderBooking(booking))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex" style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = bookings.filter(b => isSameDay(new Date(b.start_time), currentDate));
    
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', minHeight: '400px', backgroundColor: 'var(--color-background)' }}>
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{format(currentDate, 'EEEE, MMMM do yyyy')}</div>
        </div>
        <div style={{ padding: 'var(--spacing-4)' }}>
          {dayBookings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-8)' }}>
              No bookings for this day.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {dayBookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map(booking => renderBooking(booking))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container w-full">
      {renderHeader()}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
}
