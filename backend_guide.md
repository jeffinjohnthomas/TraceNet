# Ultimate Implementation Guide: Child Investigation System (Backend)

This is a complete, production-ready step-by-step guide to building the full CIS backend.

---

## STEP 1 & 3: SETUP & FOLDER STRUCTURE

Open a new terminal, navigate to your desired directory, and run:

```bash
mkdir cis-backend && cd cis-backend
npm init -y
npm install express mongoose cors dotenv jsonwebtoken bcryptjs multer
npm install --save-dev nodemon
```

**Create Folders:**
```bash
mkdir config controllers middleware models routes utils uploads
```

**Create `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cis
JWT_SECRET=super_secret_cis_key_2026
```

---

## STEP 2: DATABASE CONNECTION (`config/db.js`)

```javascript
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## STEP 4, 5, 6, 9: MONGOOSE MODELS (`models/`)

### 1. `models/User.js`
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'investigator', 'public'], default: 'public' },
  activeCases: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### 2. `models/Case.js`
```javascript
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true },
  childName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String },
  location: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  status: { type: String, enum: ['Submitted', 'Evidence Verified', 'In Progress', 'Closed'], default: 'Submitted' },
  investigator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Auto-generate Case ID and auto-calculate Priority based on inputs
caseSchema.pre('save', function (next) {
  if (this.isNew) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.caseId = `CIS-${new Date().getFullYear()}-${randomNum}`;
    
    // Smart Priority Logic
    const desc = this.description.toLowerCase();
    if (this.age < 12 || desc.includes('abuse') || desc.includes('labor') || desc.includes('trafficking')) {
      this.priority = 'High';
    } else if (this.age < 16 && desc.includes('missing')) {
      this.priority = 'Medium';
    } else {
      this.priority = 'Low';
    }
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
```

### 3. `models/Log.js` (Audit Logs)
```javascript
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
```

### 4. `models/Note.js`
```javascript
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  visibility: { type: String, enum: ['private', 'public'], default: 'public' }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
```

### 5. `models/Evidence.js`
```javascript
const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Evidence', evidenceSchema);
```

---

## STEP 7: MIDDLEWARE (`middleware/`)

### 1. `middleware/auth.js` (JWT & Roles)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  res.status(401).json({ message: 'Not authorized, no token' });
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Role not authorized for this action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
```

### 2. `middleware/upload.js` (Multer)
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
```

---

## STEP 4, 5, 8: CONTROLLERS (`controllers/`)

### 1. `controllers/authController.js`
```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, phone, password, role });
    res.status(201).json({ _id: user.id, name: user.name, role: user.role, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user.id, name: user.name, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### 2. `controllers/caseController.js`
```javascript
const Case = require('../models/Case');
const Log = require('../models/Log');
const Evidence = require('../models/Evidence');
const Note = require('../models/Note');

exports.createCase = async (req, res) => {
  try {
    const newCase = await Case.create({ ...req.body, createdBy: req.user._id });
    await Log.create({ caseId: newCase.caseId, action: 'Case Created', performedBy: req.user.name });
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.find().populate('investigator', 'name email');
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('investigator', 'name')
      .populate('createdBy', 'name');
    res.json(caseData);
  } catch (err) {
    res.status(404).json({ message: 'Case not found' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseData = await Case.findById(req.params.id);

    // Compliance check
    if (status === 'Closed') {
      const evidenceCount = await Evidence.countDocuments({ caseId: caseData._id });
      const notesCount = await Note.countDocuments({ caseId: caseData._id });
      if (evidenceCount === 0 || notesCount === 0) {
        return res.status(400).json({ message: 'Cannot close: Missing evidence or notes' });
      }
    }

    caseData.status = status;
    await caseData.save();
    await Log.create({ caseId: caseData.caseId, action: `Status updated to ${status}`, performedBy: req.user.name });
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### 3. `controllers/adminController.js`
```javascript
const Case = require('../models/Case');
const User = require('../models/User');
const Log = require('../models/Log');

exports.assignInvestigator = async (req, res) => {
  try {
    const { caseId, investigatorId } = req.body;
    const caseData = await Case.findById(caseId);
    caseData.investigator = investigatorId;
    await caseData.save();

    await User.findByIdAndUpdate(investigatorId, { $inc: { activeCases: 1 } });
    await Log.create({ caseId: caseData.caseId, action: `Assigned to Investigator ID ${investigatorId}`, performedBy: req.user.name });

    res.json({ message: 'Investigator assigned successfully', caseData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCount = await Case.countDocuments();
    const highPriority = await Case.countDocuments({ priority: 'High', status: { $ne: 'Closed' } });
    const openCases = await Case.countDocuments({ status: { $ne: 'Closed' } });
    res.json({ totalCases: totalCount, highPriority, openCases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### 4. `controllers/systemController.js` (Notes & Evidence)
*(For brevity, save logic inside a single controller or chunk them as preferred).*

```javascript
/* controllers/fileController.js */
const Evidence = require('../models/Evidence');
const Note = require('../models/Note');

exports.uploadEvidence = async (req, res) => {
  try {
    const newEv = await Evidence.create({
      caseId: req.body.caseId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedBy: req.user.name
    });
    res.status(201).json(newEv);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const { caseId, text, visibility } = req.body;
    const newNote = await Note.create({ caseId, text, visibility, author: req.user.name });
    res.status(201).json(newNote);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNotes = async (req, res) => {
  try {
    let filter = { caseId: req.params.caseId };
    if (req.user.role === 'public') filter.visibility = 'public'; // Hide private notes
    const notes = await Note.find(filter).sort('-createdAt');
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

---

## MAIN ROUTES (`routes/index.js` or individually)

In `routes/index.js` (Tie them together):
```javascript
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authC = require('../controllers/authController');
const caseC = require('../controllers/caseController');
const adminC = require('../controllers/adminController');
const fileC = require('../controllers/fileController');

const router = express.Router();

// Auth
router.post('/auth/register', authC.register);
router.post('/auth/login', authC.login);

// Cases (Protected)
router.post('/cases', protect, caseC.createCase);
router.get('/cases', protect, caseC.getAllCases);
router.get('/cases/:id', protect, caseC.getCaseById);
router.put('/cases/:id/status', protect, restrictTo('investigator', 'admin'), caseC.updateStatus);

// Evidence & Notes
router.post('/evidence/upload', protect, upload.single('file'), fileC.uploadEvidence);
router.post('/notes', protect, fileC.addNote);
router.get('/notes/:caseId', protect, fileC.getNotes);

// Admin
router.post('/admin/assign', protect, restrictTo('admin'), adminC.assignInvestigator);
router.get('/admin/dashboard', protect, restrictTo('admin'), adminC.getDashboardStats);

module.exports = router;
```

---

## SERVER.JS (The Entry Point)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes/index');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

---

## STEP 10: RUNNING & POSTMAN TESTING

Add this script to your `package.json`:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
Run `npm run dev`. Your backend is alive at `http://localhost:5000`.

### Example Postman Workflows:

**1. Create Public User**
*   **POST** `http://localhost:5000/api/auth/register`
*   Body: `{ "name": "Test User", "email": "test@test.com", "phone": "123456789", "password": "password", "role": "public" }`
*   *Save the token returned!*

**2. Create Case**
*   **POST** `http://localhost:5000/api/cases`
*   Headers: `Authorization: Bearer <token>`
*   Body: `{ "childName": "Ananya R.", "age": 9, "location": "Hubli", "description": "Factory labor suspicion." }`

**3. Upload Evidence**
*   **POST** `http://localhost:5000/api/evidence/upload`
*   Headers: `Authorization: Bearer <token>`
*   Body (Form-Data): `file` (Select a JPG/PDF), `caseId` (Insert ObjectID of Case).
