const { validateInternshipDates } = require('../validators/internshipDate.validator');

function runVerification() {
  console.log('--- Running Multi-Internship Verification ---');

  const today = new Date().toISOString().split('T')[0];

  const oneMonthAgoDate = new Date();
  oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
  const oneMonthAgo = oneMonthAgoDate.toISOString().split('T')[0];

  const twoYearsAgoDate = new Date();
  twoYearsAgoDate.setFullYear(twoYearsAgoDate.getFullYear() - 2);
  const twoYearsAgo = twoYearsAgoDate.toISOString().split('T')[0];

  const futureDate = '2030-01-01';

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  function assertThrows(fn, expectedMsg, testName) {
    try {
      fn();
      console.error(`✗ FAIL: ${testName} - Expected error containing "${expectedMsg}" but no error was thrown`);
      failed++;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes(expectedMsg.toLowerCase())) {
        console.log(`✓ PASS: ${testName} - Blocked with correct error: "${err.message}"`);
        passed++;
      } else {
        console.error(`✗ FAIL: ${testName} - Got error "${err.message}" but expected "${expectedMsg}"`);
        failed++;
      }
    }
  }

  // 1. Valid dates
  try {
    validateInternshipDates(oneMonthAgo, today);
    assert(true, 'Valid dates (start 1 month ago, end today) passed validation');
  } catch (err) {
    assert(false, `Valid dates failed with error: ${err.message}`);
  }

  // 2. Future startDate
  assertThrows(
    () => validateInternshipDates(futureDate, today),
    'Start date cannot be in the future',
    'Future start date'
  );

  // 3. Start date > 1 year ago
  assertThrows(
    () => validateInternshipDates(twoYearsAgo, today),
    'Start date cannot be more than 1 year before today',
    'Start date > 1 year ago'
  );

  // 4. Future endDate is allowed when it is at least 14 days after start
  try {
    validateInternshipDates(oneMonthAgo, futureDate);
    assert(true, 'Future end date (at least 2 weeks after start) passed validation');
  } catch (err) {
    assert(false, `Future end date failed with error: ${err.message}`);
  }

  // 4b. End date less than 14 days after start
  const thirteenDaysAfterStartDate = new Date(oneMonthAgoDate);
  thirteenDaysAfterStartDate.setDate(thirteenDaysAfterStartDate.getDate() + 13);
  const thirteenDaysAfterStart = thirteenDaysAfterStartDate.toISOString().split('T')[0];
  assertThrows(
    () => validateInternshipDates(oneMonthAgo, thirteenDaysAfterStart),
    'End date must be at least 2 weeks',
    'End date less than 2 weeks after start'
  );

  // 5. endDate before startDate
  assertThrows(
    () => validateInternshipDates(today, oneMonthAgo),
    'End date cannot be before start date',
    'End date before start date'
  );

  console.log(`\nVerification Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runVerification();
