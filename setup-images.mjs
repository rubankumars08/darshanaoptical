import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const IMAGES_TO_DOWNLOAD = [
  { name: 'hero-woman.jpg', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=90' },
  { name: 'cat-men.jpg', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=90' },
  { name: 'cat-women.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=90' },
  { name: 'cat-kids.jpg', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=90' },
  { name: 'cat-premium.jpg', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=90' },
  { name: 'cat-office.jpg', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=90' },
  { name: 'cat-sunglasses.jpg', url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=90' },
  { name: 'eye-test.jpg', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=90' },
  { name: 'frame-finder.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=90' },
  { name: 'lens-progressive.jpg', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=90' },
  { name: 'frame-1.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=90' },
  { name: 'frame-2.jpg', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=90' },
  { name: 'frame-3.jpg', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=90' },
  { name: 'frame-4.jpg', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=90' },
  { name: 'frame-5.jpg', url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=90' },
  { name: 'frame-6.jpg', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=90' },
  { name: 'store-1.jpg', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=90' },
  { name: 'store-2.jpg', url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=90' },
  { name: 'store-3.jpg', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=90' },
  { name: 'store-4.jpg', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=90' },
  { name: 'offer-glasses.jpg', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1000&q=90' },
  { name: 'avatar-1.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=90' },
  { name: 'avatar-2.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=90' },
  { name: 'avatar-3.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=90' },
  { name: 'avatar-4.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=90' },
  { name: 'avatar-5.jpg', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=90' }
];

function downloadImage(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(IMAGES_DIR, item.name);
    const file = fs.createWriteStream(dest);

    https.get(item.url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('Downloading all optical assets into public/images/...');
  for (const item of IMAGES_TO_DOWNLOAD) {
    try {
      await downloadImage(item);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err.message);
    }
  }
  console.log('Done downloading local assets!');
}

main();
