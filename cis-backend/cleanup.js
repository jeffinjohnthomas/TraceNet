const mongoose = require('mongoose');
const { Case, AuditLog } = require('./models');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Delete all cases
    const caseResult = await Case.deleteMany({});
    console.log(`Deleted ${caseResult.deletedCount} cases.`);

    // Delete all audit logs
    const auditResult = await AuditLog.deleteMany({});
    console.log(`Deleted ${auditResult.deletedCount} audit logs.`);

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
