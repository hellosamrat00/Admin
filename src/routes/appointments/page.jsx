import React, { useState, useEffect } from 'react';

const AppointmentsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);
  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/bookings/', {
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

        const bookingsData = Array.isArray(data) ? data : [];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(`Failed to load bookings: ${err.message}. Please check the backend server.`);
        setBookings([]);
        setFilteredBookings([]);
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Handle month filter
  const handleMonthFilter = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setCurrentPage(1); // Reset to first page

    if (month === 'All') {
      setFilteredBookings(bookings);
    } else {
      const [year, monthIndex] = month.split('-');
      const filtered = bookings.filter((booking) => {
        const date = new Date(booking.appointment_time);
        return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(monthIndex) - 1;
      });
      setFilteredBookings(filtered);
    }
  };

  // Generate month options (last 12 months + current)
  const getMonthOptions = () => {
    const options = [{ value: 'All', label: 'All Months' }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedBooking = await response.json();
      console.log('Updated Booking:', updatedBooking);

      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      setFilteredBookings(filteredBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <label htmlFor="monthFilter" className="mr-2">Filter by Month:</label>
        <select
          id="monthFilter"
          value={selectedMonth}
          onChange={handleMonthFilter}
          className="border rounded p-2"
        >
          {getMonthOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center text-gray-500">No bookings available.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Appointment Time</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3 px-4">{indexOfFirstBooking + index + 1}</td>
                    <td className="py-3 px-4">{booking.user.username}</td>
                    <td className="py-3 px-4">{booking.user.email}</td>
                    <td className="py-3 px-4">{booking.service?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(booking.appointment_time).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                        className="border rounded p-1 bg-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="DIDNT_COME">Didn't Come</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
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

export default AppointmentsPage;