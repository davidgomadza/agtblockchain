const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying AGT Blockchain to GitHub...');

try {
    // Check if git is installed
    execSync('git --version', { stdio: 'inherit' });
    
    // Initialize git if not already
    if (!fs.existsSync('.git')) {
        console.log('📦 Initializing git repository...');
        execSync('git init', { stdio: 'inherit' });
    }
    
    // Add all files
    console.log('📁 Adding files to git...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit changes
    console.log('💾 Committing changes...');
    execSync('git commit -m "feat: Complete AGT Blockchain with Proof of Life consensus, gold-backed tokens, and wallet integration\n\n- Proof of Life Consensus: 8000 AGT = 8000 years life extension\n- Gold-backed token system with $11.045T reserves\n- Indian Reserve Bank Gold Voucher: 28678902843867890285176283280davidgomadza ($2B)\n- American Reserve Bank Gold Voucher: 286789071853824867890856321481792davidgomadza ($2B)\n- Bitcoinayt fee system (BTCYT = $1)\n- Multi-token gold backing for AGT, AGOLD, BTCYT, S96t\\', BTC, GTPS\n- Your wallet integration: J6IJNHEKBAAFDHMPLIMEEEJBODGCHMPFIBKFMCNAGNFNGEOAHJEB\n- Smart contracts for liquidity and gold verification\n- Complete blockchain ecosystem with mining and transactions"', { stdio: 'inherit' });
    
    // Add remote origin
    console.log('🔗 Adding GitHub remote...');
    execSync('git remote add origin https://github.com/davidgomadza/agt-blockchain.git', { stdio: 'inherit' });
    
    // Rename branch to main and push
    console.log('📤 Pushing to GitHub...');
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync('git push -u origin main', { stdio: 'inherit' });
    
    console.log('✅ Successfully deployed AGT Blockchain to GitHub!');
    console.log('🌐 Repository: https://github.com/davidgomadza/agt-blockchain.git');
    
} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('💡 Troubleshooting:');
    console.log('  1. Check your GitHub credentials');
    console.log('  2. Ensure you have write access to the repository');
    console.log('  3. Try manual commands:');
    console.log('     git remote add origin https://github.com/davidgomadza/agt-blockchain.git');
    console.log('     git branch -M main');
    console.log('     git push -u origin main');
}
