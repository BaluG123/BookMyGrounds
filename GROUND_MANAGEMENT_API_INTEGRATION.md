# Ground Management - API Integration Reference

## 📋 API Endpoints Used

### 1. **My Turfs List** - `MyGroundsScreen.tsx`
```typescript
// API Call
groundsAPI.myGrounds()

// Endpoint
GET /api/v1/grounds/my-grounds/

// Auth Required
Authorization: Token <owner_token>

// Response Fields Used
- id
- name
- city
- state
- ground_type_display
- primary_image (URL)
- avg_rating
- min_price { amount, duration }
```

**Integration Status**: ✅ Fully Integrated
- Fetches owner's grounds on screen load
- Pull-to-refresh enabled
- Displays in GroundCard component
- Navigates to detail view on tap

---

### 2. **Ground Details** - `GroundDetailScreen.tsx`
```typescript
// API Call
groundsAPI.detail(groundId)

// Endpoint
GET /api/v1/grounds/{id}/

// Auth Required
Authorization: Token <owner_token>

// Response Fields Used
- id
- name
- description
- ground_type_display
- surface_type_display
- address, city, state, pincode
- latitude, longitude
- opening_time, closing_time
- max_players
- rules
- cancellation_policy
- is_active
- is_verified
- avg_rating
- total_reviews
- total_bookings
- images[] { id, image, is_primary, caption }
- pricing_plans[] { id, duration_display, price, weekend_price }
- amenities[] { id, name, icon }
- owner { full_name, email }
```

**Integration Status**: ✅ Fully Integrated
- Shows complete ground information
- Image carousel for multiple images
- Displays all pricing plans
- Shows amenities as chips
- Edit and Delete buttons

---

### 3. **Create Ground** - `AddGroundScreen.tsx`
```typescript
// API Call
groundsAPI.create(groundData)

// Endpoint
POST /api/v1/grounds/

// Auth Required
Authorization: Token <owner_token>

// Request Payload
{
  "name": "string",
  "description": "string",
  "ground_type": "cricket|football|badminton|tennis|basketball|volleyball|hockey|multi_sport|other",
  "surface_type": "natural_grass|artificial_turf|clay|concrete|synthetic|wooden|other",
  "address": "string",
  "city": "string",
  "state": "string",
  "pincode": "string",
  "latitude": "decimal",
  "longitude": "decimal",
  "opening_time": "HH:MM:SS",
  "closing_time": "HH:MM:SS",
  "max_players": number,
  "rules": "string",
  "cancellation_policy": "string",
  "is_active": boolean,
  "amenity_ids": [1, 2, 3]
}

// Response
Returns created ground with id
```

**Integration Status**: ✅ Fully Integrated
- Form validation
- Map picker for coordinates
- Amenity selector
- Image upload after ground creation
- Success/error alerts

---

### 4. **Update Ground** - `EditGroundScreen.tsx`
```typescript
// API Call
groundsAPI.update(groundId, updateData)

// Endpoint
PATCH /api/v1/grounds/{id}/

// Auth Required
Authorization: Token <owner_token>

// Request Payload
Same as create, but all fields optional (send only what changed)

// Response
Returns updated ground object
```

**Integration Status**: ✅ Fully Integrated
- Pre-fills form with existing data
- Fetches current ground data on load
- Updates only changed fields
- Form validation
- Success/error alerts

---

### 5. **Delete Ground** - `GroundDetailScreen.tsx`
```typescript
// API Call
groundsAPI.delete(groundId)

// Endpoint
DELETE /api/v1/grounds/{id}/

// Auth Required
Authorization: Token <owner_token>

// Behavior
Soft delete - sets is_active = false
```

**Integration Status**: ✅ Fully Integrated
- Confirmation dialog before delete
- Shows loading state during deletion
- Navigates back on success
- Error handling

---

### 6. **Upload Images** - `AddGroundScreen.tsx`
```typescript
// API Call
groundsAPI.uploadImages(groundId, formData)

// Endpoint
POST /api/v1/grounds/{id}/images/

// Auth Required
Authorization: Token <owner_token>

// Headers
Content-Type: multipart/form-data

// FormData Fields
- image: File (required)
- is_primary: boolean
- caption: string (optional)

// Response
Returns uploaded image object with id
```

**Integration Status**: ✅ Integrated
- Uploads after ground creation
- Supports multiple images (up to 5)
- First image marked as primary
- Individual error handling per image
- Continues on failure

---

## 🔧 Additional APIs Available (Not Yet Integrated)

### 7. **Delete Image**
```typescript
// Endpoint
DELETE /api/v1/grounds/{id}/images/{img_id}/

// Usage
Remove specific ground images
```

**Status**: ⚠️ Not Integrated
**Suggested Location**: Add to GroundDetailScreen or create ImageManagementScreen

---

### 8. **Pricing Management**
```typescript
// List Pricing
GET /api/v1/grounds/{id}/pricing/

// Add Pricing
POST /api/v1/grounds/{id}/pricing/
{
  "duration_type": "per_hour|two_hours|three_hours|half_day|full_day|custom",
  "duration_hours": decimal,
  "price": decimal,
  "weekend_price": decimal (optional),
  "is_active": boolean
}

// Update Pricing
PATCH /api/v1/grounds/{id}/pricing/{plan_id}/

// Delete Pricing
DELETE /api/v1/grounds/{id}/pricing/{plan_id}/
```

**Status**: ⚠️ Not Integrated
**Suggested Location**: Create PricingManagementScreen

---

## 📱 Component Integration Map

```
MyGroundsScreen
├── API: myGrounds()
├── Component: GroundCard
│   ├── Shows: primary_image, name, city, rating, min_price
│   └── OnPress: Navigate to GroundDetailScreen
└── Button: Navigate to AddGroundScreen

GroundDetailScreen
├── API: detail(id)
├── Shows: Full ground info, images, pricing, amenities
├── Button: Edit → Navigate to EditGroundScreen
└── Button: Delete → API: delete(id)

AddGroundScreen
├── API: create(data)
├── API: uploadImages(id, formData) [after creation]
├── Components: Input, MapPicker, AmenitySelector
└── OnSuccess: Navigate back

EditGroundScreen
├── API: detail(id) [on load]
├── API: update(id, data) [on submit]
├── Components: Input, MapPicker, AmenitySelector
└── OnSuccess: Navigate back
```

---

## 🎯 API Response Examples

### MyGrounds Response
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Super Cricket Arena",
      "city": "Bangalore",
      "state": "Karnataka",
      "ground_type": "cricket",
      "ground_type_display": "Cricket",
      "primary_image": "http://localhost:8001/media/grounds/image.jpg",
      "avg_rating": "4.50",
      "min_price": {
        "amount": "500",
        "duration": "Per Hour"
      },
      "is_active": true,
      "is_verified": true
    }
  ]
}
```

### Ground Detail Response
```json
{
  "id": "uuid",
  "name": "Super Cricket Arena",
  "description": "Premium cricket ground...",
  "ground_type": "cricket",
  "ground_type_display": "Cricket",
  "surface_type": "artificial_turf",
  "surface_type_display": "Artificial Turf",
  "address": "123 Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560095",
  "latitude": "12.9352",
  "longitude": "77.6245",
  "opening_time": "06:00:00",
  "closing_time": "22:00:00",
  "max_players": 22,
  "rules": "Wear sports shoes...",
  "cancellation_policy": "Full refund...",
  "is_active": true,
  "is_verified": true,
  "avg_rating": "4.50",
  "total_reviews": 25,
  "total_bookings": 150,
  "images": [
    {
      "id": "uuid",
      "image": "http://localhost:8001/media/grounds/img1.jpg",
      "is_primary": true,
      "caption": "Main view"
    }
  ],
  "pricing_plans": [
    {
      "id": "uuid",
      "duration_type": "per_hour",
      "duration_display": "Per Hour",
      "duration_hours": "1.00",
      "price": "500.00",
      "weekend_price": "600.00",
      "is_active": true
    }
  ],
  "amenities": [
    {
      "id": 1,
      "name": "Parking",
      "icon": "car"
    }
  ],
  "owner": {
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## ✅ Integration Checklist

- [x] List owner's grounds
- [x] View ground details
- [x] Create new ground
- [x] Update ground
- [x] Delete ground (soft delete)
- [x] Upload images
- [x] Display images in cards
- [x] Display pricing in detail view
- [x] Display amenities
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Navigation flow
- [ ] Delete individual images
- [ ] Manage pricing plans (CRUD)
- [ ] Image management screen
- [ ] Bulk operations

---

## 🐛 Known Issues & Solutions

### Issue: Images not showing
**Cause**: API returns relative URLs, need full URL
**Solution**: ✅ Fixed - GroundCard now checks `primary_image` field first

### Issue: "state is missing" error
**Cause**: State field was not in the form
**Solution**: ✅ Fixed - Added State input field

### Issue: "No images provided" error
**Cause**: FormData not properly formatted
**Solution**: ✅ Fixed - Added proper FormData structure with is_primary and caption

### Issue: Wrong ground/surface types
**Cause**: Frontend options didn't match backend choices
**Solution**: ✅ Fixed - Updated to match backend exactly

---

## 🚀 Next Steps

1. **Add Pricing Management Screen**
   - Create/Edit/Delete pricing plans
   - Set weekend pricing
   - Activate/deactivate plans

2. **Add Image Management**
   - Delete individual images
   - Set primary image
   - Add captions
   - Reorder images

3. **Add Ground Analytics**
   - View booking statistics
   - Revenue reports
   - Popular time slots

4. **Add Bulk Operations**
   - Bulk activate/deactivate
   - Bulk pricing updates
   - Export ground data
