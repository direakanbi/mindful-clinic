const fs = require('fs');
const { execSync } = require('child_process');

console.log('Installing sharp...');
try {
  execSync('npm install --no-save sharp', { stdio: 'inherit' });
  const sharp = require('sharp');
  
  sharp('primary_nurse.jpg')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height, channels } = info;
      console.log(`Processing image ${width}x${height} with ${channels} channels...`);
      
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Key out solid black / dark background pixels
        const maxVal = Math.max(r, g, b);
        if (maxVal < 28) {
          data[i + 3] = 0;
        } else if (maxVal < 45) {
          const alpha = Math.round(((maxVal - 28) / 17) * 255);
          data[i + 3] = alpha;
        }
      }
      
      sharp(data, { raw: { width, height, channels: 4 } })
        .png()
        .toFile('primary_nurse_cutout.png')
        .then(() => {
          console.log('Successfully generated primary_nurse_cutout.png!');
        })
        .catch(err => console.error('Error saving PNG:', err));
    });
} catch (err) {
  console.error('Sharp processing error:', err);
}
