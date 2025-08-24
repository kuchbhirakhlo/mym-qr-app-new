const { execSync } = require('child_process');

try {
  console.log('Starting build process...');
  
  // Use environment variable to disable trace and telemetry
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  
  // Run build without the unsupported flag
  execSync('next build', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 