const prisma = require('./utils/prisma');
const { generateToken } = require('./controllers/authController');

async function testMockLogin(provider, providerId, email, name) {
    console.log(`\nTesting Mock Login for ${provider}...`);
    try {
        const providerIdKey = `${provider}Id`;
        
        // Mock the upsert logic
        let user = await prisma.user.findUnique({ where: { email } });
        
        const providerData = { [providerIdKey]: providerId };
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    ...providerData,
                    role: 'USER'
                }
            });
            console.log(`Created new user: ${user.email}`);
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: providerData
            });
            console.log(`Updated existing user: ${user.email}`);
        }
        
        const token = generateToken(user);
        console.log(`Generated Token: ${token.substring(0, 20)}...`);
        console.log(`Test PASSED for ${provider}`);
        return true;
    } catch (error) {
        console.error(`Test FAILED for ${provider}:`, error.message);
        return false;
    }
}

async function runTests() {
    const googleOk = await testMockLogin('google', 'mock_google_id', 'test_google@example.com', 'Google Tester');
    const facebookOk = await testMockLogin('facebook', 'mock_fb_id', 'test_fb@example.com', 'FB Tester');
    const instagramOk = await testMockLogin('instagram', 'mock_insta_id', 'test_insta@example.com', 'Insta Tester');
    
    if (googleOk && facebookOk && instagramOk) {
        console.log('\nAll OAuth flows (mocked) passed successfully! ✅');
    } else {
        console.log('\nSome OAuth flows failed. ❌');
    }
    process.exit(0);
}

runTests();
