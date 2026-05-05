async function verify() {
    const baseURL = 'http://localhost:5000/api';
    console.log('--- Verifying API (using fetch) ---');

    let token = '';
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@roamsquad.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || loginRes.statusText);
        token = loginData.token;
        console.log('   Login successful.');
    } catch (err) {
        console.error('   Login failed:', err.message);
        return;
    }

    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    let countryId = '';
    try {
        console.log('2. Fetching countries...');
        const res = await fetch(`${baseURL}/countries`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        console.log(`   Found ${data.length} countries.`);
        if (data.length > 0) {
            countryId = data[0].id;
            console.log(`   Selected country: ${data[0].name} (${countryId})`);
        } else {
            console.error('   No countries found! Please seed the database.');
            return;
        }
    } catch (err) {
        console.error('   Fetch countries failed:', err.message);
    }

    let stateId = '';
    try {
        console.log(`3. Fetching states for country ${countryId}...`);
        const res = await fetch(`${baseURL}/countries/${countryId}/states`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        console.log(`   Found ${data.length} states.`);
        if (data.length > 0) {
            stateId = data[0].id;
            console.log(`   Selected state: ${data[0].name} (${stateId})`);
        } else {
            console.log('   No states found for this country.');
        }
    } catch (err) {
        console.error('   Fetch states failed:', err.message);
    }

    try {
        if (stateId) {
            console.log(`4. Fetching districts for state ${stateId}...`);
            const res = await fetch(`${baseURL}/states/${stateId}/districts`, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            console.log(`   Found ${data.length} districts.`);
            if (data.length > 0) {
                console.log(`   Selected district: ${data[0].name} (${data[0].id})`);
            } else {
                console.log('   No districts found for this state.');
            }
        }
    } catch (err) {
        console.error('   Fetch districts failed:', err.message);
    }

    console.log('--- Verification Complete ---');
}

verify();
