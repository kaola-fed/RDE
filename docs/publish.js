const childProcess = require('child_process');
const ghpages = require('gh-pages');

console.log('Building...');

childProcess.execSync('npm run docs:build', { stdio: 'inherit' });

console.log('Publishing...');

ghpages.publish('public', {
    message: 'Publish'
}, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Published.')
});