import { pool } from '../config/database.js';

export const getOrganizationBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, slug, logo, status FROM organizations WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, organization: result.rows[0] });
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching organization' });
  }
};
