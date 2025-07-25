import request from 'supertest';
import app from '../../server.js'; 
import { getAuth } from 'firebase-admin/auth';


describe('Auth API Integration Tests (with Jest & Supertest)', () => {
  let testUserEmail;
  let testUserPassword = 'testpassword123';
  let testUsername = 'JestTestUser';
  let testUserId;
  let authToken;

  beforeEach(async () => {
    try {
      await request(`http://${process.env.FIRESTORE_EMULATOR_HOST}`)
        .delete(`/emulator/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`)
        .expect(200);
      console.log(`[Test Case Setup] Firestore data cleared for project ${process.env.FIREBASE_PROJECT_ID}.`);
    } catch (error) {
      console.error('[Test Case Setup] Failed to clear Firestore data:', error.message);
    }
    testUserEmail = `jestuser_${Date.now()}@example.com`;
  });

  it('should allow a new user to sign up and create a profile', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testUserEmail,
        password: testUserPassword,
        username: testUsername
      })
      .expect(201); 

    expect(signupRes.body).toHaveProperty('token');
    expect(signupRes.body).toHaveProperty('userId');
    expect(signupRes.body.username).toBe(testUsername); 

    authToken = signupRes.body.token;
    testUserId = signupRes.body.userId;

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileRes.body).toHaveProperty('id', testUserId);
    expect(profileRes.body).toHaveProperty('username', testUsername);
    expect(profileRes.body).toHaveProperty('email', testUserEmail);
  });

  it('should allow an existing user to login and receive a token', async () => {
    // First, sign up the user
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: testUserEmail,
        password: testUserPassword,
        username: testUsername
      })
      .expect(201);

    // Then, attempt to login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      })
      .expect(200); 

    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body).toHaveProperty('userId');
    expect(loginRes.body.email).toBe(testUserEmail);
  });

  it('should return 401 for unauthorized profile access', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .expect(401); 

    expect(res.body).toHaveProperty('message', 'No token provided.');
  });

  it('should return 409 if email already in use during signup', async () => {
    // First signup
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: testUserEmail,
        password: testUserPassword,
        username: testUsername
      })
      .expect(201);

    // Try to signup again with the same email
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testUserEmail,
        password: testUserPassword,
        username: testUsername
      })
      .expect(409); 

    expect(res.body).toHaveProperty('message', 'Email already in use.');
  });

  // Add more integration tests for other routes (finance, calendar, tasks, mental health, notifications)
});
