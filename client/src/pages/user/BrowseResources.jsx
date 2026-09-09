import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Search, MapPin, Users, Info } from 'lucide-react';
import ResourceDetails from './ResourceDetails';

export default function BrowseResources() {
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getAllResources();
      setResources(res.resources);
      if (location.state?.resourceId) {
        const resourceToBook = res.resources.find(resource => resource.id === location.state.resourceId);
        if (resourceToBook) {
          setSelectedResource(resourceToBook);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = r.name?.toLowerCase().includes(searchLower) ?? false;
    const descMatch = r.description?.toLowerCase().includes(searchLower) ?? false;
    
    const matchesSearch = nameMatch || descMatch;
    const matchesType = typeFilter ? r.type === typeFilter : true;
    
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(resources.map(r => r.type))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 style={{ marginBottom: 'var(--spacing-2)' }}>Browse Resources</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Find and book available resources</p>
        </div>
      </div>

      <Card>
        <div className="flex gap-4 items-end">
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Search by name or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div>Loading resources...</div>
      ) : filteredResources.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--spacing-10)' }}>
          <Search size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
          <h3>No resources found</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
          {filteredResources.map(resource => (
            <Card key={resource.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-3)' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{resource.name}</h3>
                <Badge status={resource.status} />
              </div>
              
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-4)', flex: 1 }}>
                {resource.description}
              </p>
              
              <div className="flex flex-col gap-2" style={{ marginBottom: 'var(--spacing-6)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> {resource.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} /> Capacity: {resource.capacity}
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} /> Type: {resource.type}
                </div>
              </div>
              
              <Button 
                fullWidth 
                onClick={() => setSelectedResource(resource)}
                disabled={resource.status !== 'ACTIVE'}
              >
                {resource.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selectedResource && (
        <ResourceDetails 
          resource={selectedResource} 
          isOpen={!!selectedResource} 
          onClose={() => setSelectedResource(null)} 
        />
      )}
    </div>
  );
}
