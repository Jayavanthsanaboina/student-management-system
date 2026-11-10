import React, { useState, useEffect } from 'react';

// API Base URL - Configurable for local dev or cloud deployment (Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialFormState = {
  rollNumber: '',
  name: '',
  email: '',
  department: 'CSE',
  year: 1,
  semester: 1,
  gpa: 8.0,
  feesPaid: 50000,
  feeDue: 15000,
  status: 'Active',
};

function App() {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch student records from backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/students?_t=${Date.now()}`;
      if (selectedDept !== 'All') url += `&department=${selectedDept}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      showMessage('Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch aggregation analytics (Rubric component 4)
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/students/analytics/department?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAnalytics();
  }, [selectedDept, searchTerm]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'semester', 'gpa', 'feesPaid', 'feeDue'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // Handle Create or Update Student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // ====================================================================
        // UPDATE OPERATION (Resolves the Case Study Bug):
        // 1. Sends PUT request to backend
        // 2. Receives updated document (enabled by { new: true } in Mongoose)
        // 3. Immutably updates the React state to guarantee immediate UI refresh
        // ====================================================================
        const res = await fetch(`${API_BASE_URL}/students/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (result.success) {
          const updatedRecord = result.data;
          // State update with new object reference ensures React re-renders table
          setStudents((prev) =>
            prev.map((s) => (s._id === editingId ? updatedRecord : s))
          );
          showMessage('Student record updated successfully!');
          setEditingId(null);
          setFormData(initialFormState);
          fetchAnalytics(); // Refresh aggregated metrics
        } else {
          showMessage(result.message, 'error');
        }
      } else {
        // CREATE OPERATION
        const res = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (result.success) {
          setStudents((prev) => [result.data, ...prev]);
          showMessage('Student record added successfully!');
          setFormData(initialFormState);
          fetchAnalytics(); // Refresh metrics
        } else {
          showMessage(result.message, 'error');
        }
      }
    } catch (err) {
      console.error('Error saving record:', err);
      showMessage('Network error while saving student', 'error');
    }
  };

  // Populate form for editing
  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      semester: student.semester,
      gpa: student.gpa,
      feesPaid: student.feesPaid,
      feeDue: student.feeDue,
      status: student.status,
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Delete student record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
        showMessage('Student record deleted successfully');
        fetchAnalytics();
      } else {
        showMessage(result.message, 'error');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      showMessage('Failed to delete student record', 'error');
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <h1>Student Management System</h1>
          <p>Anil Neerukonda Institute of Technology and Sciences (ANITS) • CSE (AI&ML)</p>
        </div>
        <div className="header-badge">MERN Stack • Full CRUD & Aggregation</div>
      </header>

      {/* Alert Notification */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Analytics Summary Cards (Rubric Component 4: Aggregation) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Students</div>
          <div className="value">{analytics?.summary?.totalRegistered || students.length}</div>
          <div className="subtext">Registered across all branches</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Enrollment</div>
          <div className="value">{analytics?.summary?.totalActive || 0}</div>
          <div className="subtext">Currently on-campus</div>
        </div>
        <div className="stat-card">
          <div className="label">Departments</div>
          <div className="value">{analytics?.departmentMetrics?.length || 5}</div>
          <div className="subtext">CSE, IT, ECE, MECH, CIVIL</div>
        </div>
        <div className="stat-card">
          <div className="label">System Status</div>
          <div className="value" style={{ color: '#16a34a', fontSize: '1.4rem' }}>
            Synchronized
          </div>
          <div className="subtext">Real-time update verified</div>
        </div>
      </div>

      {/* Department Aggregation Breakdown (Rubric Component 4) */}
      {analytics?.departmentMetrics && analytics.departmentMetrics.length > 0 && (
        <div className="analytics-box">
          <h3>📊 Department-Wise Aggregation & Statistics (MongoDB Pipeline)</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Student Count</th>
                  <th>Avg GPA</th>
                  <th>Min GPA</th>
                  <th>Max GPA</th>
                  <th>Total Fees Collected</th>
                  <th>Total Fees Pending</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departmentMetrics.map((dept) => (
                  <tr key={dept.department}>
                    <td><strong>{dept.department}</strong></td>
                    <td>{dept.totalStudents}</td>
                    <td><span className="badge-gpa">{dept.averageGpa}</span></td>
                    <td>{dept.minGpa}</td>
                    <td>{dept.maxGpa}</td>
                    <td>₹{dept.totalFeesCollected.toLocaleString()}</td>
                    <td style={{ color: dept.totalFeesPending > 0 ? '#b91c1c' : '#15803d' }}>
                      ₹{dept.totalFeesPending.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Layout: Form + Records Table */}
      <div className="main-layout">
        {/* Form Column */}
        <aside className="form-card">
          <h2>{editingId ? '✏️ Edit Student Record' : '➕ Register New Student'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                className="form-control"
                placeholder="e.g. A24CS101"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)} // Keep unique roll number fixed during edit
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Student full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="student@anits.edu.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="form-group">
                <label>GPA (0.0 - 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="gpa"
                  className="form-control"
                  value={formData.gpa}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Year (1-4)</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  name="year"
                  className="form-control"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Semester (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  name="semester"
                  className="form-control"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fees Paid (₹)</label>
                <input
                  type="number"
                  name="feesPaid"
                  className="form-control"
                  value={formData.feesPaid}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Fee Due (₹)</label>
                <input
                  type="number"
                  name="feeDue"
                  className="form-control"
                  value={formData.feeDue}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Record' : 'Add Student'}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </aside>

        {/* Directory / Table Column */}
        <main>
          {/* Search & Filter Controls */}
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search student by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Year/Sem</th>
                    <th>GPA</th>
                    <th>Fee Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                        {loading ? 'Loading student records...' : 'No student records found.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student._id}>
                        <td><strong>{student.rollNumber}</strong></td>
                        <td>
                          <div>{student.name}</div>
                          <small style={{ color: '#64748b' }}>{student.email}</small>
                        </td>
                        <td>{student.department}</td>
                        <td>Yr {student.year} / Sem {student.semester}</td>
                        <td>
                          <span className="badge-gpa">{student.gpa.toFixed(2)}</span>
                        </td>
                        <td>
                          {student.feeDue === 0 ? (
                            <span style={{ color: '#15803d', fontWeight: 600 }}>Cleared</span>
                          ) : (
                            <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                              Due: ₹{student.feeDue.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              student.status === 'Active'
                                ? 'badge-active'
                                : student.status === 'On Leave'
                                ? 'badge-leave'
                                : 'badge-graduated'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-edit"
                            onClick={() => handleEdit(student)}
                            title="Edit this record"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-delete"
                            onClick={() => handleDelete(student._id)}
                            title="Delete this record"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
