# MongoDB Schema Definitions

## Collections Structure

### users
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "profileImage": String,
  "preferences": {
    "bodyType": String,
    "stylePreference": String,
    "skinTone": String,
    "hairColor": String
  },
  "savedOutfits": [ObjectId],
  "role": String (enum: ["user", "admin"]),
  "createdAt": Date,
  "updatedAt": Date
}
```

### services
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "icon": String,
  "category": String (enum: ["style", "analysis", "recommendation"]),
  "features": [String],
  "isActive": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### newsletters
```json
{
  "_id": ObjectId,
  "email": String (unique),
  "subscribedAt": Date,
  "isActive": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### contacts
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "subject": String,
  "message": String,
  "status": String (enum: ["new", "read", "responded"]),
  "createdAt": Date,
  "updatedAt": Date
}
```

### stylescans
```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "imageUrl": String,
  "analysis": {
    "faceShape": String,
    "skinTone": String,
    "colorPalette": [String],
    "recommendations": {
      "outfits": [String],
      "hairstyles": [String],
      "accessories": [String],
      "colors": [String]
    }
  },
  "scanDate": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```
