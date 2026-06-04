const http = require('http');

async function testAuth() {
  console.log("=== STARTING AUTHENTICATION API INTEGRATION TESTS ===");
  const base_url = "http://localhost:400";
  
  // 1. Try to fetch profile without authentication (Should fail/unauthorized)
  try {
    const res = await fetch(`${base_url}/api/auth/profile`);
    const data = await res.json();
    console.log("Test 1 (Unauthorized Profile Fetch):", !data.isSuccess ? "PASS" : "FAIL", "-", data.message);
  } catch (e) {
    console.log("Test 1 (Unauthorized Profile Fetch): FAIL (Server not running on port 400. Start it with npm run dev)");
    return;
  }

  // 2. Try to login with incorrect credentials
  try {
    const res = await fetch(`${base_url}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid@example.com", password: "wrong", role: "admin" })
    });
    const data = await res.json();
    console.log("Test 2 (Invalid Login):", (!data.isSuccess && res.status === 404) ? "PASS" : "FAIL", "-", data.message);
  } catch (e) {
    console.log("Test 2 (Invalid Login): FAIL -", e.message);
  }

  // 3. Login with correct admin credentials (seeded admin@example.com / admin)
  let adminCookie = "";
  try {
    const res = await fetch(`${base_url}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin", role: "admin" })
    });
    const data = await res.json();
    const cookies = res.headers.get('set-cookie');
    if (data.isSuccess && cookies) {
      adminCookie = cookies.split(';')[0];
      console.log("Test 3 (Successful Admin Login): PASS");
    } else {
      console.log("Test 3 (Successful Admin Login): FAIL -", data.message);
    }
  } catch (e) {
    console.log("Test 3 (Successful Admin Login): FAIL -", e.message);
  }

  // 4. Fetch profile with correct authentication cookie
  if (adminCookie) {
    try {
      const res = await fetch(`${base_url}/api/auth/profile`, {
        headers: { "Cookie": adminCookie }
      });
      const data = await res.json();
      console.log("Test 4 (Authorized Profile Fetch):", (data.isSuccess && data.user.role === 'admin') ? "PASS" : "FAIL", "-", data.user?.email);
    } catch (e) {
      console.log("Test 4 (Authorized Profile Fetch): FAIL -", e.message);
    }
  } else {
    console.log("Test 4 (Authorized Profile Fetch): SKIP (No cookie)");
  }

  // 5. Test logout
  if (adminCookie) {
    try {
      const res = await fetch(`${base_url}/api/auth/logout`, {
        method: "POST",
        headers: { "Cookie": adminCookie }
      });
      const data = await res.json();
      console.log("Test 5 (Logout):", data.isSuccess ? "PASS" : "FAIL", "-", data.message);
    } catch (e) {
      console.log("Test 5 (Logout): FAIL -", e.message);
    }
  } else {
    console.log("Test 5 (Logout): SKIP (No cookie)");
  }

  console.log("=== TESTS COMPLETE ===");
}

testAuth();
