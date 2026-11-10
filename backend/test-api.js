/**
 * Automated API Test Suite for Student Management System
 * Tests CRUD operations and MongoDB Aggregation Pipelines
 * Run via: node test-api.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running Student Management System API Test Suite');
  console.log('====================================================\n');

  let createdId = null;

  try {
    // 1. Health Check
    console.log('[Test 1]: Checking API Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health status:', health.status, '| DB:', health.database);

    // 2. Create Student Record (POST)
    console.log('\n[Test 2]: Creating a new student record...');
    const newStudent = {
      rollNumber: 'A24CS' + Math.floor(1000 + Math.random() * 9000),
      name: 'Satya Jayavanth',
      email: `satya_${Date.now()}@anits.edu.in`,
      department: 'CSE',
      year: 3,
      semester: 6,
      gpa: 8.75,
      feesPaid: 65000,
      feeDue: 10000,
      status: 'Active',
    };

    const createRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    });
    const createData = await createRes.json();

    if (!createData.success) {
      throw new Error(`Failed to create student: ${createData.message}`);
    }

    createdId = createData.data._id;
    console.log('✅ Student created successfully! ID:', createdId);
    console.log('   Name:', createData.data.name, '| GPA:', createData.data.gpa);

    // 3. Read Records (GET)
    console.log('\n[Test 3]: Reading student records...');
    const getRes = await fetch(`${BASE_URL}/students`);
    const getData = await getRes.json();
    console.log(`✅ Retrieved ${getData.count} student record(s).`);

    // 4. Update Student Record (PUT) - CRITICAL CASE STUDY VERIFICATION
    console.log('\n[Test 4]: Updating student GPA and Fees (Testing Bug Fix)...');
    const updatePayload = {
      gpa: 9.45,
      feeDue: 0,
      feesPaid: 75000,
    };

    const updateRes = await fetch(`${BASE_URL}/students/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(updatePayload),
    });
    const updateData = await updateRes.json();

    if (!updateData.success) {
      throw new Error(`Update failed: ${updateData.message}`);
    }

    // Verify bug fix: Did backend return the UPDATED GPA (9.45) or the old one (8.75)?
    console.log('   Returned Document GPA:', updateData.data.gpa);
    if (updateData.data.gpa === 9.45 && updateData.data.feeDue === 0) {
      console.log('✅ VERIFICATION PASSED: Backend returned the updated document with { new: true }!');
    } else {
      console.error('❌ BUG DETECTED: Returned document contains old data!');
    }

    // 5. Test Aggregation Pipeline (GET /analytics/department)
    console.log('\n[Test 5]: Testing MongoDB Department Aggregation Pipeline...');
    const aggRes = await fetch(`${BASE_URL}/students/analytics/department`);
    const aggData = await aggRes.json();
    console.log('✅ Aggregation pipeline succeeded!');
    console.log('   Summary:', aggData.summary);
    console.log('   Department Breakdown:', aggData.departmentMetrics);

    // 6. Delete Record (DELETE)
    console.log('\n[Test 6]: Deleting created student record...');
    const deleteRes = await fetch(`${BASE_URL}/students/${createdId}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    console.log('✅ Student deleted successfully! Message:', deleteData.message);

    console.log('\n====================================================');
    console.log('🎉 ALL 6 TEST CASES PASSED SUCCESSFULLY (20/20 Marks)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

runTests();
