import { Router } from 'express';
import { getOrganizationBySlug } from '../controllers/organizationController.js';

const organizationRoutes = Router();

organizationRoutes.get('/by-slug/:slug', getOrganizationBySlug);

export default organizationRoutes;
