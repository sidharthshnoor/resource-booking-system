import React, { useEffect, useState } from 'react';
import resourceService from '../../services/resource.service';
import adminService from '../../services/admin.service';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Search, Edit, Trash2, Plus } from 'lucide-react';

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ROOM',
    location: '',
    capacity: 1,
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getAllResources();
      setResources(res.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingId(resource.id);
      setFormData({
        name: resource.name,
        description: resource.description,
        type: resource.type,
        location: resource.location,
        capacity: resource.capacity,
        status: resource.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', type: 'ROOM', location: '', capacity: 1, status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateResource(editingId, formData);
      } else {
        await adminService.createResource(formData);
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await adminService.deleteResource(id);
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Resource Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Add, edit, or remove resources from the system</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus size={16} style={{ marginRight: '8px' }}/> Add Resource</Button>
      </div>

      <Card noPadding>
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '300px' }}>
            <Input 
              placeholder="Search resources..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Loading resources...</div>
        ) : (
          <Table 
            headers={['Name', 'Type', 'Location', 'Capacity', 'Status', 'Actions']}
            data={filteredResources}
            emptyMessage="No resources found."
            renderRow={(res) => (
              <TableRow key={res.id}>
                <TableCell style={{ fontWeight: 500 }}>{res.name}</TableCell>
                <TableCell>{res.type}</TableCell>
                <TableCell>{res.location}</TableCell>
                <TableCell>{res.capacity}</TableCell>
                <TableCell><Badge status={res.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(res)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(res.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Edit Resource' : 'Add New Resource'}
        footer={
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Resource</Button>
          </div>
        }
      >
        <form className="flex flex-col gap-4">
          <Input 
            label="Resource Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>Description</label>
            <textarea 
              style={{
                padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', outline: 'none'
              }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex gap-4">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
               <label className="text-label">Type</label>
               <select 
                 value={formData.type}
                 onChange={(e) => setFormData({...formData, type: e.target.value})}
                 style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
               >
                 <option value="ROOM">Room</option>
                 <option value="EQUIPMENT">Equipment</option>
                 <option value="VEHICLE">Vehicle</option>
               </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
               <label className="text-label">Status</label>
               <select 
                 value={formData.status}
                 onChange={(e) => setFormData({...formData, status: e.target.value})}
                 style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
               >
                 <option value="ACTIVE">Active</option>
                 <option value="INACTIVE">Inactive</option>
               </select>
            </div>
          </div>
          <div className="flex gap-4">
             <div style={{ flex: 2 }}>
               <Input 
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
             </div>
             <div style={{ flex: 1 }}>
               <Input 
                  label="Capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                />
             </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
