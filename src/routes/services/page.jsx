import React, { useState, useEffect } from 'react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(10);
  const [formData, setFormData] = useState({ name: '', price: '' });
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/services/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      const servicesData = Array.isArray(data) ? data : [];
      setServices(servicesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(`Failed to load services: ${err.message}. Please check the backend server.`);
      setServices([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingService
      ? `http://localhost:8000/api/services/${editingService.id}/`
      : 'http://localhost:8000/api/services/';
    const method = editingService ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const newService = await response.json();
      if (editingService) {
        setServices(services.map(s => (s.id === newService.id ? newService : s)));
      } else {
        setServices([...services, newService]);
      }
      setFormData({ name: '', price: '' });
      setEditingService(null);
      alert(editingService ? 'Service updated!' : 'Service added!');
    } catch (err) {
      console.error('Error saving service:', err);
      setError(`Failed to save service: ${err.message}`);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({ name: service.name, price: service.price });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/services/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setServices(services.filter(s => s.id !== id));
      alert('Service deleted!');
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(`Failed to delete service: ${err.message}`);
    }
  };

  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(services.length / servicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Management</h1>

      {/* Form for Add/Edit */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="e.g., Haircut"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              max="9999.99"
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="e.g., 20.00"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
            {editingService && (
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setFormData({ name: '', price: '' });
                }}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="text-center text-gray-500">No services found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Price ($)</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((service, index) => (
                  <tr key={service.id} className="border-b">
                    <td className="py-3 px-4">{indexOfFirstService + index + 1}</td>
                    <td className="py-3 px-4">{service.name}</td>
                    <td className="py-3 px-4">{parseFloat(service.price).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(service)}
                        className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`px-4 py-2 rounded ${
                  currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesPage;