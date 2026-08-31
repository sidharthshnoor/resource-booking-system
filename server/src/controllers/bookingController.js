import {
  cancelBooking,
  createBooking,
  findActiveResourceById,
  findBookingById,
  findBookingsByUserId,
  findAllBookings,
  updateBookingStatus,
  findBookingsByResourceId
} from '../models/bookingModel.js';

function errorResponse(response, status, message) {
  return response.status(status).json({ success: false, message });
}

function parseId(value) {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

function parseDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function parseBookingInput(body) {
  const resourceId = parseId(String(body?.resource_id ?? ''));
  const startTime = parseDate(body?.start_time);
  const endTime = parseDate(body?.end_time);
  const purpose = typeof body?.purpose === 'string' ? body.purpose.trim() : '';

  if (!resourceId || !startTime || !endTime || !purpose) {
    return { error: 'resource_id, start_time, end_time, and purpose are required.' };
  }

  if (new Date(endTime) <= new Date(startTime)) {
    return { error: 'end_time must be later than start_time.' };
  }

  return { value: { resourceId, startTime, endTime, purpose } };
}

export async function listBookings(request, response) {
  try {
    const bookings = await findBookingsByUserId(request.user.id);
    return response.json({ success: true, bookings });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve bookings at this time.');
  }
}

export async function getBooking(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Booking ID must be a positive integer.');

  try {
    const booking = await findBookingById(id);
    if (!booking) return errorResponse(response, 404, 'Booking not found.');
    if (String(booking.user_id) !== String(request.user.id)) {
      return errorResponse(response, 403, 'You are not allowed to access this booking.');
    }
    return response.json({ success: true, booking });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve the booking at this time.');
  }
}

export async function createBookingHandler(request, response) {
  const parsed = parseBookingInput(request.body);
  if (parsed.error) return errorResponse(response, 400, parsed.error);

  try {
    const resource = await findActiveResourceById(parsed.value.resourceId);
    if (!resource) return errorResponse(response, 404, 'Resource not found.');
    if (resource.status !== 'ACTIVE') return errorResponse(response, 409, 'Resource is inactive.');

    const booking = await createBooking({ userId: request.user.id, ...parsed.value });
    return response.status(201).json({ success: true, booking });
  } catch (error) {
    if (error?.code === '23P01') {
      return errorResponse(response, 409, 'The resource is already booked for part of this time period.');
    }
    if (error?.code === '23503') return errorResponse(response, 404, 'Resource not found.');
    if (error?.code === '23514') return errorResponse(response, 400, 'Invalid booking time range.');
    return errorResponse(response, 500, 'Unable to create booking at this time.');
  }
}

export async function cancelBookingHandler(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Booking ID must be a positive integer.');

  try {
    const booking = await findBookingById(id);
    if (!booking) return errorResponse(response, 404, 'Booking not found.');
    if (String(booking.user_id) !== String(request.user.id)) {
      return errorResponse(response, 403, 'You are not allowed to cancel this booking.');
    }

    const cancelled = await cancelBooking(id, request.user.id);
    if (!cancelled) return errorResponse(response, 409, 'This booking cannot be cancelled in its current status.');
    return response.json({ success: true, booking: cancelled });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to cancel the booking at this time.');
  }
}

export async function listAdminBookings(request, response) {
  const status = request.query.status ? String(request.query.status).toUpperCase() : null;
  const validStatuses = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
  if (status && !validStatuses.has(status)) {
    return errorResponse(response, 400, 'Status must be PENDING, APPROVED, REJECTED, or CANCELLED.');
  }

  try {
    const bookings = await findAllBookings(status);
    return response.json({ success: true, bookings });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve bookings at this time.');
  }
}

export async function changeBookingStatus(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Booking ID must be a positive integer.');

  const status = request.params.action === 'approve' ? 'APPROVED' : 'REJECTED';
  try {
    const existing = await findBookingById(id);
    if (!existing) return errorResponse(response, 404, 'Booking not found.');
    if (existing.status !== 'PENDING') {
      return errorResponse(response, 409, 'Only pending bookings can be approved or rejected.');
    }

    const booking = await updateBookingStatus(id, status);
    if (!booking) return errorResponse(response, 409, 'Booking status changed before this request completed.');
    return response.json({ success: true, booking });
  } catch (error) {
    if (error?.code === '23P01') {
      return errorResponse(response, 409, 'The booking conflicts with another pending or approved booking.');
    }
    return errorResponse(response, 500, 'Unable to update booking status at this time.');
  }
}

export async function listResourceBookings(request, response) {
  const resourceId = parseId(request.params.id);
  if (!resourceId) return errorResponse(response, 400, 'Resource ID must be a positive integer.');

  try {
    const bookings = await findBookingsByResourceId(resourceId);
    return response.json({ success: true, bookings });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve resource bookings at this time.');
  }
}
