import {
  createResource,
  deleteResource,
  findResourceById,
  findResources,
  updateResource
} from '../models/resourceModel.js';

const validStatuses = new Set(['ACTIVE', 'INACTIVE']);

function errorResponse(response, status, message) {
  return response.status(status).json({ success: false, message });
}

function parseId(value) {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

function parseResourceInput(body, { allowStatusDefault = false, allowStatusOmission = false } = {}) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const type = typeof body?.type === 'string' ? body.type.trim() : '';
  const location = typeof body?.location === 'string' ? body.location.trim() : '';
  const description = body?.description == null ? null : String(body.description).trim();
  const capacity = body?.capacity;
  const status = body?.status == null
    ? (allowStatusDefault ? 'ACTIVE' : allowStatusOmission ? null : body?.status)
    : body.status;

  if (!name || !type || !location || capacity === undefined || capacity === null || capacity === '') {
    return { error: 'Name, type, location, and capacity are required.' };
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: 'Capacity must be a positive integer.' };
  }

  if (status !== null && !validStatuses.has(status)) {
    return { error: 'Status must be ACTIVE or INACTIVE.' };
  }

  return { value: { name, description: description || null, type, location, capacity, status } };
}

export async function listResources(request, response) {
  const statusValue = typeof request.query.status === 'string' ? request.query.status.trim() : '';
  const status = statusValue ? statusValue.toUpperCase() : null;
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const type = typeof request.query.type === 'string' ? request.query.type.trim() : '';
  const location = typeof request.query.location === 'string' ? request.query.location.trim() : '';

  if (status && !validStatuses.has(status) && status !== 'ALL') {
    return errorResponse(response, 400, 'Status must be ACTIVE, INACTIVE, or ALL.');
  }

  try {
    const resources = await findResources({ search, type, location, status: status === 'ALL' ? null : status, organizationId: request.organizationId });
    return response.json({ success: true, resources });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve resources at this time.');
  }
}

export async function getResource(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Resource ID must be a positive integer.');

  try {
    const resource = await findResourceById(id, request.organizationId);
    if (!resource) return errorResponse(response, 404, 'Resource not found.');
    return response.json({ success: true, resource });
  } catch (_error) {
    return errorResponse(response, 500, 'Unable to retrieve the resource at this time.');
  }
}

export async function createResourceHandler(request, response) {
  const parsed = parseResourceInput(request.body, { allowStatusDefault: true });
  if (parsed.error) return errorResponse(response, 400, parsed.error);

  try {
    const resource = await createResource({ ...parsed.value, organizationId: request.organizationId });
    return response.status(201).json({ success: true, resource });
  } catch (_error) {
    return errorResponse(response, 400, 'Unable to create resource. Check the submitted values.');
  }
}

export async function updateResourceHandler(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Resource ID must be a positive integer.');

  const parsed = parseResourceInput(request.body, { allowStatusOmission: true });
  if (parsed.error) return errorResponse(response, 400, parsed.error);

  try {
    const resource = await updateResource(id, { ...parsed.value, organizationId: request.organizationId });
    if (!resource) return errorResponse(response, 404, 'Resource not found.');
    return response.json({ success: true, resource });
  } catch (_error) {
    return errorResponse(response, 400, 'Unable to update resource. Check the submitted values.');
  }
}

export async function deleteResourceHandler(request, response) {
  const id = parseId(request.params.id);
  if (!id) return errorResponse(response, 400, 'Resource ID must be a positive integer.');

  try {
    const deleted = await deleteResource(id, request.organizationId);
    if (!deleted) return errorResponse(response, 404, 'Resource not found.');
    return response.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (error) {
    if (error?.code === '23503') {
      return errorResponse(response, 409, 'Cannot delete this resource because it has existing bookings. Please deactivate the resource instead.');
    }
    return errorResponse(response, 500, 'Unable to delete resource at this time.');
  }
}