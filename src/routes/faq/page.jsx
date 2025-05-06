import React, { useState, useEffect } from 'react';

const FAQpage = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [editFAQ, setEditFAQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('http://localhost:8000/faqs/', {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load FAQs. Please check the backend server.');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/faqs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFAQ),
      });
      if (!response.ok) throw new Error('Failed to create FAQ');
      setNewFAQ({ question: '', answer: '' });
      fetchFaqs();
    } catch (err) {
      setError('Failed to create FAQ.');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/faqs/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFAQ),
      });
      if (!response.ok) throw new Error('Failed to update FAQ');
      setEditFAQ(null);
      fetchFaqs();
    } catch (err) {
      setError('Failed to update FAQ.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/faqs/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete FAQ');
      fetchFaqs();
    } catch (err) {
      setError('Failed to delete FAQ.');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">FAQ Management</h1>

      {/* Create Form */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New FAQ</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            value={newFAQ.question}
            onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
            placeholder="Question"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={newFAQ.answer}
            onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
            placeholder="Answer"
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add FAQ
          </button>
        </form>
      </div>

      {/* FAQ Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Question</th>
              <th className="py-2 px-4 border-b">Answer</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {editFAQ && editFAQ.id === faq.id ? (
                    <input
                      type="text"
                      value={editFAQ.question}
                      onChange={(e) => setEditFAQ({ ...editFAQ, question: e.target.value })}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    faq.question
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editFAQ && editFAQ.id === faq.id ? (
                    <textarea
                      value={editFAQ.answer}
                      onChange={(e) => setEditFAQ({ ...editFAQ, answer: e.target.value })}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    faq.answer
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editFAQ && editFAQ.id === faq.id ? (
                    <button
                      onClick={() => handleUpdate(faq.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditFAQ({ id: faq.id, question: faq.question, answer: faq.answer })}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FAQpage;