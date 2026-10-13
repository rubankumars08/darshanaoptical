// scratch/test_product_image_upload.mjs
const BASE = 'http://localhost:3000';

async function run() {
  console.log('🚀 Testing Product Image Upload & Update Flow...\n');

  // 1. Authenticate as admin
  const loginRes = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@darshana.com',
      password: 'admin@2026',
    }),
  });
  const setCookie = loginRes.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : '';
  console.log('Admin login status:', loginRes.status, 'Cookie acquired:', !!cookie);

  // 2. Upload product image via Base64 JSON
  // 1x1 transparent PNG base64
  const testPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const uploadRes = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify({
      dataUrl: testPngBase64,
      filename: 'test_lens.png',
    }),
  });
  const uploadJson = await uploadRes.json();
  console.log('Upload API status:', uploadRes.status, uploadJson);

  if (!uploadRes.ok || !uploadJson.url) {
    console.error('❌ Upload API failed');
    process.exit(1);
  }
  console.log('✅ Image uploaded successfully to:', uploadJson.url);

  // 3. Create product with uploaded image_url
  const sku = 'TEST-IMG-' + Date.now().toString().slice(-4);
  const createRes = await fetch(`${BASE}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify({
      name: 'Oakley Carbon Fiber Sports Frame',
      product_code: sku,
      category: 'frame',
      brand: 'Oakley',
      model: 'OX8156',
      color: 'Satin Black',
      purchase_price: 4200,
      selling_price: 6900,
      mrp: 7500,
      stock: 8,
      low_stock_threshold: 2,
      image_url: uploadJson.url,
      description: 'Ultra-durable carbon fiber optical frame with Unobtainium earsocks',
    }),
  });
  const createJson = await createRes.json();
  console.log('Create product status:', createRes.status, 'Created ID:', createJson?.product?.id, 'Image:', createJson?.product?.image_url);

  if (!createRes.ok || createJson?.product?.image_url !== uploadJson.url) {
    console.error('❌ Product creation with image failed');
    process.exit(1);
  }
  console.log('✅ Product created with image_url!');

  const productId = createJson.product.id;

  // 4. Update the product with a new image_url
  const newImageUrl = '/images/products/oakley_matte_black_v2.webp';
  const updateRes = await fetch(`${BASE}/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify({
      image_url: newImageUrl,
      selling_price: 7200,
    }),
  });
  const updateJson = await updateRes.json();
  console.log('Update product status:', updateRes.status, 'New Image:', updateJson?.product?.image_url);

  if (!updateRes.ok || updateJson?.product?.image_url !== newImageUrl) {
    console.error('❌ Product image update failed');
    process.exit(1);
  }
  console.log('✅ Product image updated successfully!');

  // 5. Verify GET /api/admin/products includes the image
  const getRes = await fetch(`${BASE}/api/admin/products?q=${sku}`, {
    headers: { 'Cookie': cookie },
  });
  const getJson = await getRes.json();
  const found = getJson?.products?.find((p) => p.id === productId);
  console.log('Found product in catalog with image:', found?.image_url === newImageUrl);

  if (found && found.image_url === newImageUrl) {
    console.log('\n🎉 ALL PRODUCT IMAGE UPLOAD & UPDATE TESTS PASSED!\n');
  } else {
    console.error('❌ Catalog fetch verification failed');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
