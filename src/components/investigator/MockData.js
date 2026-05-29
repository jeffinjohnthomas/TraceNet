export const mockCases = [
  {
    id: '2026-CH-0457',
    subjectName: 'Ananya R.',
    age: 9,
    gender: 'Female',
    location: 'Shivamogga',
    priority: 'High',
    status: 'In Progress',
    investigator: 'Ravi Kumar',
    date: '2026-04-01',
    evidenceMissing: false,
    notesMissing: false,
    mapX: '35%', mapY: '55%',
    notes: [
      { id: 1, author: 'Ravi Kumar', text: 'Factory owner denies allegations. Neighbors confirm subject was seen entering the premises.', visibility: 'Private', timestamp: '1 day ago' },
      { id: 2, author: 'Ravi Kumar', text: 'Investigation is ongoing. Initial premises check completed.', visibility: 'Public', timestamp: '2 days ago' }
    ],
    timeline: [
      { id: 1, type: 'doc', title: 'Initial_Complaint.pdf', author: 'Public User', timestamp: '3 days ago' },
      { id: 2, type: 'image', title: 'Factory_Entrance.jpg', author: 'Ravi Kumar', timestamp: '1 day ago' }
    ],
    auditLogs: [
      { id: 1, action: 'Case Submitted', user: 'System', time: '3 days ago' },
      { id: 2, action: 'Auto-Priority Assessed (High - Age < 10, Keyword: Factory)', user: 'AI System', time: '3 days ago' },
      { id: 3, action: 'Assigned to Ravi Kumar', user: 'Admin Panel', time: '2 days ago' },
      { id: 4, action: 'Status Updated: In Progress', user: 'Ravi Kumar', time: '2 days ago' }
    ]
  },
  {
    id: 'CIS-2026-0102',
    subjectName: 'Unknown',
    age: 14,
    gender: 'Male',
    location: 'Bangalore Tech Park',
    priority: 'Medium',
    status: 'Submitted',
    investigator: 'Unassigned',
    date: '2026-04-01',
    evidenceMissing: true,
    notesMissing: true,
    mapX: '45%', mapY: '60%',
    notes: [],
    timeline: [],
    auditLogs: [
      { id: 1, action: 'Case Submitted', user: 'Public User', time: '4 hours ago' }
    ]
  },
  {
    id: 'CIS-2026-0103',
    subjectName: 'Kiran D.',
    age: 6,
    gender: 'Male',
    location: 'Hubli Market',
    priority: 'High',
    status: 'Evidence Verified',
    investigator: 'Priya S.',
    date: '2026-03-30',
    evidenceMissing: false,
    notesMissing: true,
    mapX: '20%', mapY: '40%',
    notes: [],
    timeline: [
      { id: 1, type: 'video', title: 'Market_CCTV.mp4', author: 'Priya S.', timestamp: '1 day ago' }
    ],
    auditLogs: [
      { id: 1, action: 'Case Submitted', user: 'System', time: '3 days ago' },
      { id: 2, action: 'Assigned to Priya S.', user: 'Admin', time: '2 days ago' },
      { id: 3, action: 'Evidence Uploaded', user: 'Priya S.', time: '1 day ago' }
    ]
  }
];

export const investigators = [
  { id: 'INV-001', name: 'Ravi Kumar', activeCases: 2, region: 'Shivamogga/Coastal' },
  { id: 'INV-002', name: 'Priya S.', activeCases: 4, region: 'Hubli/North' },
  { id: 'INV-003', name: 'Arjun V.', activeCases: 1, region: 'Bangalore Metro' }
];
