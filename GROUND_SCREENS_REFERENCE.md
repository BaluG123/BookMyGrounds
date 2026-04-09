# Ground Management Screens - Complete Reference

## 🎯 Screen Flow Diagram

```
┌─────────────────────┐
│  MyGroundsScreen    │
│  (List View)        │
│                     │
│  API: myGrounds()   │
└──────┬──────────────┘
       │
       ├─── Tap Ground Card ──────────┐
       │                              │
       │                              ▼
       │                    ┌─────────────────────┐
       │                    │ GroundDetailScreen  │
       │                    │ (Detail View)       │
       │                    │                     │
       │                    │ API: detail(id)     │
       │                    └──────┬──────────────┘
       │                           │
       │                           ├─── Edit Button ────┐
       │                           │                    │
       │                           │                    ▼
       │                           │          ┌─────────────────────┐
       │                           │          │ EditGroundScreen    │
       │                           │          │ (Edit Form)         │
       │                           │          │                     │
       │                           │          │ API: update(id)     │
       │                           │          └─────────────────────┘
       │                           │
       │                           └─── Delete Button ──> Confirmation Dialog
       │                                                   │
       │                                                   └─> API: delete(id)
       │
       └─── Add Turf Button ──────────┐
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │ AddGroundScreen     │
                            │ (Create Form)       │
                            │                     │
                            │ API: create()       │
                            │ API: uploadImages() │
                            └─────────────────────┘
```

---

## 📱 Screen Details

### 1. MyGroundsScreen.tsx

**Purpose**: Dashboard showing all grounds owned by the logged-in admin

**API Integration**:
```typescript
const fetchMyGrounds = async () => {
  const res = await groundsAPI.myGrounds();
  setGrounds(res.data.results || res.data);
};
```

**Features**:
- ✅ Pull-to-refresh
- ✅ Loading indicator
- ✅ Empty state message
- ✅ Add Turf button
- ✅ Ground cards with images

**Data Displayed**:
- Ground image (primary_image)
- Ground name
- Location (city, state)
- Rating badge
- Ground type tag
- Starting price

**Navigation**:
- Tap card → GroundDetailScreen
- Add button → AddGroundScreen

**File Location**: `src/screens/admin/MyGroundsScreen.tsx`

---

### 2. GroundDetailScreen.tsx

**Purpose**: Full details view with edit/delete actions

**API Integration**:
```typescript
// Fetch details
const res = await groundsAPI.detail(groundId);
setGround(res.data);

// Delete
await groundsAPI.delete(groundId);
```

**Features**:
- ✅ Image carousel (horizontal scroll)
- ✅ Status badge (Active/Inactive)
- ✅ Verified badge
- ✅ Stats row (rating, bookings, reviews)
- ✅ Ground details section
- ✅ Amenities chips
- ✅ Pricing plans cards
- ✅ Rules & policies
- ✅ Edit button
- ✅ Delete button with confirmation

**Sections**:
1. **Image Carousel**
   - Horizontal scrollable
   - Full-width images
   - Shows all uploaded images

2. **Basic Info**
   - Name + Active/Inactive badge
   - Verified badge (if verified)
   - Description
   - Location with icon
   - Stats (rating, bookings, reviews)

3. **Ground Details**
   - Type (Cricket, Football, etc.)
   - Surface (Natural Grass, etc.)
   - Max Players
   - Timings

4. **Amenities**
   - Displayed as chips
   - Shows icon + name

5. **Pricing Plans**
   - Cards showing duration + price
   - Weekend price (if different)

6. **Rules & Policies**
   - Ground rules
   - Cancellation policy

7. **Action Buttons**
   - Edit Ground (blue)
   - Delete (red with icon)

**Navigation**:
- Edit button → EditGroundScreen
- Delete → Confirmation → Go back
- Back button → MyGroundsScreen

**File Location**: `src/screens/admin/GroundDetailScreen.tsx`

---

### 3. AddGroundScreen.tsx

**Purpose**: Create new ground with all details

**API Integration**:
```typescript
// Create ground
const res = await groundsAPI.create(groundData);
const groundId = res.data.id;

// Upload images
for (let img of images) {
  const formData = new FormData();
  formData.append('image', img);
  formData.append('is_primary', i === 0 ? 'true' : 'false');
  await groundsAPI.uploadImages(groundId, formData);
}
```

**Features**:
- ✅ Form validation
- ✅ Map picker for coordinates
- ✅ Amenity selector
- ✅ Image picker (up to 5)
- ✅ Image preview
- ✅ Loading state
- ✅ Success/error alerts

**Form Sections**:

1. **Basic Information**
   - Ground Name * (required)
   - Description (multiline)
   - Ground Type (chips: cricket, football, etc.)
   - Surface Type (chips: grass, turf, etc.)

2. **Location Details**
   - Address * (required)
   - City * (required)
   - State * (required)
   - Pincode * (required)
   - Map Picker (interactive map)

3. **Operational Details**
   - Opening Time (HH:MM:SS)
   - Closing Time (HH:MM:SS)
   - Max Players (numeric)
   - Amenities (multi-select)

4. **Photos**
   - Image picker button
   - Preview thumbnails
   - Up to 5 images

5. **Submit Button**
   - "List My Turf"
   - Shows "Creating..." when loading

**Validation Rules**:
- Name is required
- Address is required
- City is required
- State is required
- Pincode is required

**Navigation**:
- Success → Go back to MyGroundsScreen
- Back button → MyGroundsScreen

**File Location**: `src/screens/admin/AddGroundScreen.tsx`

---

### 4. EditGroundScreen.tsx

**Purpose**: Update existing ground details

**API Integration**:
```typescript
// Fetch existing data
const res = await groundsAPI.detail(groundId);
// Pre-fill form with res.data

// Update
await groundsAPI.update(groundId, updateData);
```

**Features**:
- ✅ Pre-filled form with existing data
- ✅ Same form as AddGroundScreen
- ✅ Form validation
- ✅ Loading state on mount
- ✅ Success/error alerts
- ✅ No image upload (use separate screen)

**Form Sections**:
Same as AddGroundScreen but:
- Pre-filled with existing values
- No image upload section
- Button text: "Update Ground"

**Data Flow**:
1. Screen loads → Fetch ground data
2. Show loading spinner
3. Pre-fill all form fields
4. User edits fields
5. Submit → PATCH request
6. Success → Navigate back

**Navigation**:
- Success → Go back to GroundDetailScreen
- Back button → GroundDetailScreen

**File Location**: `src/screens/admin/EditGroundScreen.tsx`

---

## 🎨 Component Reusability

### Shared Components Used:

1. **ScreenContainer**
   - Wraps all screens
   - Provides consistent padding

2. **Input**
   - Text inputs
   - Multiline support
   - Label + placeholder

3. **Button**
   - Primary action button
   - Loading state
   - Disabled state

4. **GroundCard**
   - Used in MyGroundsScreen
   - Shows ground preview
   - Handles image display

5. **MapPicker**
   - Interactive map
   - Location selection
   - Returns lat/lng

6. **AmenitySelector**
   - Multi-select amenities
   - Fetches from API
   - Returns array of IDs

---

## 🔄 Data Flow

### Create Flow:
```
User fills form
    ↓
Validate form
    ↓
POST /grounds/ → Get ground ID
    ↓
Upload images (if any)
    ↓
Show success alert
    ↓
Navigate back
```

### Edit Flow:
```
Load screen
    ↓
GET /grounds/{id}/ → Fetch data
    ↓
Pre-fill form
    ↓
User edits fields
    ↓
Validate form
    ↓
PATCH /grounds/{id}/ → Update
    ↓
Show success alert
    ↓
Navigate back
```

### Delete Flow:
```
User taps Delete
    ↓
Show confirmation dialog
    ↓
User confirms
    ↓
DELETE /grounds/{id}/
    ↓
Show success alert
    ↓
Navigate back
```

---

## 📊 State Management

Each screen manages its own state:

### MyGroundsScreen:
```typescript
const [grounds, setGrounds] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
```

### GroundDetailScreen:
```typescript
const [ground, setGround] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [deleting, setDeleting] = useState(false);
```

### AddGroundScreen:
```typescript
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({...});
const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
const [images, setImages] = useState<any[]>([]);
```

### EditGroundScreen:
```typescript
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [formData, setFormData] = useState({...});
const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
```

---

## 🎯 Navigation Routes

Added to `AdminGroundsNavigator.tsx`:

```typescript
<Stack.Screen 
  name="MyGroundsList" 
  component={MyGroundsScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="AddGround" 
  component={AddGroundScreen} 
  options={{ title: 'Add New Turf' }}
/>
<Stack.Screen 
  name="GroundDetail" 
  component={GroundDetailScreen} 
  options={{ title: 'Ground Details' }}
/>
<Stack.Screen 
  name="EditGround" 
  component={EditGroundScreen} 
  options={{ title: 'Edit Ground' }}
/>
```

---

## ✅ Complete Feature Checklist

### MyGroundsScreen:
- [x] Fetch owner's grounds
- [x] Display in cards
- [x] Pull to refresh
- [x] Loading state
- [x] Empty state
- [x] Navigate to detail
- [x] Navigate to add

### GroundDetailScreen:
- [x] Fetch ground details
- [x] Display all information
- [x] Image carousel
- [x] Show pricing plans
- [x] Show amenities
- [x] Edit button
- [x] Delete button
- [x] Delete confirmation
- [x] Loading state
- [x] Error handling

### AddGroundScreen:
- [x] Form with all fields
- [x] Ground type selector
- [x] Surface type selector
- [x] Map picker
- [x] Amenity selector
- [x] Image picker
- [x] Image preview
- [x] Form validation
- [x] Create API call
- [x] Upload images
- [x] Success/error alerts
- [x] Loading state

### EditGroundScreen:
- [x] Fetch existing data
- [x] Pre-fill form
- [x] All editable fields
- [x] Form validation
- [x] Update API call
- [x] Success/error alerts
- [x] Loading states

---

## 🚀 Testing Checklist

### Test Scenarios:

1. **List Grounds**
   - [ ] Empty state shows correctly
   - [ ] Grounds load on mount
   - [ ] Pull to refresh works
   - [ ] Images display correctly
   - [ ] Tap navigates to detail

2. **View Details**
   - [ ] All data displays correctly
   - [ ] Images scroll horizontally
   - [ ] Pricing plans show
   - [ ] Amenities display
   - [ ] Edit button works
   - [ ] Delete button works

3. **Create Ground**
   - [ ] All fields editable
   - [ ] Validation works
   - [ ] Map picker works
   - [ ] Amenity selector works
   - [ ] Image picker works
   - [ ] Images preview correctly
   - [ ] Submit creates ground
   - [ ] Images upload after creation
   - [ ] Success navigates back

4. **Edit Ground**
   - [ ] Data loads and pre-fills
   - [ ] All fields editable
   - [ ] Validation works
   - [ ] Submit updates ground
   - [ ] Success navigates back

5. **Delete Ground**
   - [ ] Confirmation shows
   - [ ] Cancel works
   - [ ] Confirm deletes
   - [ ] Success navigates back

---

## 📝 Notes

- All APIs use Token authentication
- Images are uploaded separately after ground creation
- Delete is soft delete (sets is_active = false)
- Edit screen doesn't handle images (add separate image management)
- Pricing plans are read-only in detail view (add pricing management screen)
