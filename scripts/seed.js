import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Config
const API_URL = process.env.VITE_API_URL || '/api/v1'
const BASE_URL = API_URL.startsWith('http') ? API_URL : `https://shopiversa-production.up.railway.app${API_URL}`

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\n❌ ERROR: Missing Admin Credentials')
  console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.')
  console.error('Example: ADMIN_EMAIL=admin@shopvirsa.com ADMIN_PASSWORD=secret123 npm run seed:products\n')
  process.exit(1)
}

const CATEGORIES = [
  'Sports Goods', 'Cosmetics', "Men's Clothes", "Women's Clothes",
  'Home Appliances', 'Pet Foods', 'Toys and Games', 'Computers', 'Audio', 'Electronics'
]

// Generators
const generateProducts = () => {
  const products = []

  CATEGORIES.forEach(category => {
    for (let i = 1; i <= 200; i++) {
      products.push({
        name: `${category.replace(/'s/g, '')} Premium Item ${i} [SEED]`,
        price: Number((Math.random() * (500 - 10) + 10).toFixed(2)),
        category: category,
        stock: Math.floor(Math.random() * 900) + 10,
        description: `High-quality ${category.toLowerCase()} designed for durability and performance. This is a seeded product for testing the new pagination system.`,
        image: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500` // Using stable fallback to avoid massive 404s on 2000 random images
      })
    }
  })

  return products
}

async function login() {
  console.log(`🔑 Authenticating as ${ADMIN_EMAIL}...`)
  
  // Note: Assuming /auth/login uses standard OAuth2 Password Request format if it's FastAPI
  const formData = new URLSearchParams()
  formData.append('username', ADMIN_EMAIL)
  formData.append('password', ADMIN_PASSWORD)

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Login failed: ${res.status}`, text)
    process.exit(1)
  }

  const data = await res.json()
  return data.access_token || data.token
}

async function fetchAllExistingProducts() {
  console.log('🔍 Fetching existing products to prevent duplicates...')
  let allProducts = []
  let page = 1
  let limit = 200
  let hasMore = true

  while (hasMore) {
    const res = await fetch(`${BASE_URL}/products?page=${page}&limit=${limit}`)
    if (!res.ok) break
    const data = await res.json()
    const products = data.items || data.products || data.data?.products || data.data || []
    if (products.length === 0) break
    allProducts.push(...products)
    
    // Some backends might not return total correctly, if length < limit, we're at the end
    if (products.length < limit) {
      hasMore = false
    } else {
      page++
    }
  }
  return allProducts
}

async function bulkUpload(token, products) {
  const BATCH_SIZE = 50
  console.log(`\n🚀 Uploading ${products.length} products in batches of ${BATCH_SIZE}...`)
  
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    console.log(`   Uploading batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(products.length / BATCH_SIZE)}...`)
    
    try {
      const res = await fetch(`${BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batch)
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(`   ❌ Batch failed: ${res.status}`, text)
      }
    } catch (err) {
      console.error(`   ❌ Network Error on batch:`, err.message)
    }
  }
}

async function run() {
  try {
    const token = await login()
    console.log('✅ Authentication successful.')

    const existingProducts = await fetchAllExistingProducts()
    const existingNames = new Set(existingProducts.map(p => p.name))
    console.log(`📊 Found ${existingProducts.length} existing products in the database.`)

    const desiredProducts = generateProducts()
    
    const productsToCreate = desiredProducts.filter(p => !existingNames.has(p.name))
    const skipped = desiredProducts.length - productsToCreate.length

    if (productsToCreate.length === 0) {
      console.log('\n✨ Database is already fully seeded with 2000 products! No new products needed.')
    } else {
      await bulkUpload(token, productsToCreate)
    }

    console.log('\n================================')
    console.log(`Categories requested: ${CATEGORIES.length}`)
    console.log(`Products created: ${productsToCreate.length}`)
    console.log(`Products skipped: ${skipped}`)
    console.log('Database seeding completed successfully.')
    console.log('================================\n')

  } catch (err) {
    console.error('Fatal Error:', err)
  }
}

run()
