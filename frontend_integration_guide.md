# Ultimate Frontend Integration Guide: React to Node.js Backend

This guide replaces all fake `MockData.js` scattered across the app with real HTTP requests connecting your frontend to your Node.js backend.

---

## STEP 1: SETUP API SERVICE LAYER (`src/services/api.js`)

First, install axios:
```bash
npm install axios react-router-dom
```

Create a central API utility that automatically attaches your JWT token to outgoing requests.

```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Node.js server URL
});

// Interceptor: Attach JWT Token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default API;
```

---

## STEP 2 & 3: AUTHENTICATION & PROTECTED ROUTES (`src/App.jsx`)

Instead of mock state, we will store the user in LocalStorage upon login and protect routes based on role.

```javascript
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLogin from './MainLogin'; // Your unified login component
import PublicDashboard from './pages/PublicDashboard';
import CaseManagementDashboard from './pages/CaseManagementDashboard';
import AdminDashboard from './pages/AdminDashboard';
import API from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if User is already logged in on refresh
  useEffect(() => {
    const userRole = localStorage.getItem('cis_role');
    const token = localStorage.getItem('cis_token');
    
    if (userRole && token) {
      setCurrentUser({ role: userRole });
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Loading System Protocol...</div>;

  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/" element={!currentUser ? <MainLogin onLogin={(user) => setCurrentUser(user)} /> : <Navigate to={`/${currentUser.role}`} />} />

        {/* Protected Public User */}
        <Route path="/public" element={currentUser?.role === 'public' ? <PublicDashboard onLogout={() => { localStorage.clear(); setCurrentUser(null); }} /> : <Navigate to="/" />} />

        {/* Protected Investigator */}
        <Route path="/investigator" element={currentUser?.role === 'investigator' ? <CaseManagementDashboard onLogout={() => { localStorage.clear(); setCurrentUser(null); }} /> : <Navigate to="/" />} />

        {/* Protected Admin */}
        <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminDashboard onLogout={() => { localStorage.clear(); setCurrentUser(null); }} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
```

### Implementing Real Login inside `MainLogin.jsx`

```javascript
import API from './services/api';

// Inside your login function HandleSubmit:
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await API.post('/auth/login', { email, password });
    
    // Store in browser memory
    localStorage.setItem('cis_token', response.data.token);
    localStorage.setItem('cis_role', response.data.role);
    
    onLogin(response.data); // Update App.jsx State!
  } catch (err) {
    setError(err.response?.data?.message || 'Login Failed. Check credentials.');
  } finally {
    setLoading(false);
  }
};
```

---

## STEP 4, 7 & 9: SUBMITTING COMPLAINTS & EVIDENCE (Public Form)

Handling file uploads via `multipart/form-data` natively with Axios logic.

```javascript
// Function triggered when public user clicks Submit Complaint
const submitComplaint = async () => {
  setIsSubmitting(true);
  
  try {
    // 1. Create the Case
    const caseData = { childName, age, location, description };
    const caseRes = await API.post('/cases', caseData);
    const newCaseId = caseRes.data._id; // Database Object ID

    // 2. Upload Evidence if a file was selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caseId', newCaseId);

      await API.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    setSuccessMessage(`Success! Your Tracking ID is: ${caseRes.data.caseId}`);
  } catch (error) {
    alert("Submission Failed: " + error.response?.data?.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## STEP 5: INVESTIGATOR DASHBOARD (`CaseManagementDashboard.jsx`)

Replace the `mockCases` mapping array with an Axios `useEffect` array state.

```javascript
import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function CaseManagementDashboard({ onLogout }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // INIT: Data Fetching mapping
  useEffect(() => {
    fetchActiveCases();
  }, []);

  const fetchActiveCases = async () => {
    try {
      const response = await API.get('/cases');
      setCases(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Changing Status API Trigger
  const handleUpdateStatus = async () => {
    if (!statusUpdate || !selectedCaseId) return;

    try {
      await API.put(`/cases/${selectedCaseId}/status`, { status: statusUpdate });
      showToast(`Case lifecycle updated to ${statusUpdate}`);
      
      // Refresh the table locally
      setCases(cases.map(c => c._id === selectedCaseId ? { ...c, status: statusUpdate } : c));
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  // Adding Note Tracking ID mapping
  const handleAddNote = async () => {
    try {
      await API.post('/notes', {
        caseId: selectedCaseId,
        text: newNote,
        visibility: noteIsPrivate ? 'private' : 'public'
      });
      showToast('Note permanently archived in DB.');
      setNewNote('');
      // Optionally trigger fetchCaseDetails() here to refresh notes.
    } catch (err) {
      showToast('Error syncing field note.', 'error');
    }
  };

  if (isLoading) return <div>Fetching Police Database Records...</div>;

  return (
    // Render Dashboard Exactly as Built Before...
    <DashboardLayout cases={cases} updateStatus={handleUpdateStatus} />
  );
}
```

---

## STEP 6: ADMIN LOAD BALANCING API (`AdminDashboard.jsx`)

How an admin pulls overall statistics dynamically on load and triggers assignments.

```javascript
const [stats, setStats] = useState({ totalCases: 0, openCases: 0, highPriority: 0 });

useEffect(() => {
  const fetchDashboardStats = async () => {
    try {
      // Parallel API fetching
      const [casesRes, statsRes] = await Promise.all([
        API.get('/cases'),
        API.get('/admin/dashboard')
      ]);
      
      setCases(casesRes.data);
      setStats(statsRes.data);
    } catch (err) {}
  };
  fetchDashboardStats();
}, []);

// Dispatch Investigator Action map
const dispatchInvestigator = async (caseId, investigatorId) => {
  try {
    await API.post('/admin/assign', { caseId, investigatorId });
    showToast('Investigator deployed successfully.');
    
    // Update local table to reflect change avoiding a second load
    setCases(cases.map(c => c._id === caseId ? { ...c, assignedInvestigator: investigatorId } : c));
  } catch (err) {
    alert('Assignment failed.');
  }
};
```

---

## STEP 8: ADVANCED ERROR HANDLING & 10: TESTING PROTOCOLS

**Global Client-Side Interceptor:**
You can catch any unauthorized API hits directly in your central `api.js` to log users out securely if their token expires in the middle of a session.

```javascript
// src/services/api.js (Add this after the Request Interceptor)

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 Unauthorized (invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/'; // Force back to login screen
    }
    return Promise.reject(error);
  }
);
```

### Full Data Flow Testing Strategy (Post Integration):
1.  **Register Target Admin/Investigator:** Setup logic via Postman natively or connect a raw registration page momentarily.
2.  **Log in as Public** → Trigger Form Post → Validate that `api/cases` receives the record without crashing your server.
3.  **Log out, log into Admin** → Confirm the exact ID you just generated generates under "Pending Assignments." Dispatch.
4.  **Log out, log into Investigator** → Filter your table. The specific assigned ID should highlight yellow. Change the status.
5.  **Log out, track as Public** → Insert the tracking string manually. Status should read whatever the Investigator inputted. 

This workflow cements that your API, PostgreSQL/Mongo Hooks, and Stateful Frontend are dancing correctly together.
