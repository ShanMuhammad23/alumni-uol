# Jobs API Endpoint Documentation

## Overview
This document provides specifications for implementing the Jobs API endpoints required by the frontend jobs listing page (`/jobs/index.html`).

## Base URL
```
https://portal-alumni.uol.edu.pk/api/external
```

---

## Endpoints

### 1. Get All Jobs
**Endpoint:** `GET /jobs`

**Description:** Retrieves a list of all job postings. Supports optional query parameters for filtering.

**Request:**
```
GET /jobs
GET /jobs?category=uol
GET /jobs?location=Lahore
```

**Query Parameters (Optional):**
- `category` (string): Filter by job category (e.g., "uol", "partner")
- `location` (string): Filter by job location
- `company` (string): Filter by company name
- `limit` (integer): Limit the number of results
- `offset` (integer): Offset for pagination

**Response Format:**
The API should return either:
- **Option 1:** Direct array format
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "The University of Lahore",
    "location": "Lahore, Pakistan",
    "category": "uol",
    "job_link": "https://careers.uol.edu.pk/job/123",
    "deadline": "2025-02-15T00:00:00Z",
    "created_at": "2025-01-10T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Data Analyst",
    "company": "Tech Corp",
    "location": "Karachi, Pakistan",
    "category": "partner",
    "job_link": "https://techcorp.com/jobs/456",
    "deadline": "2025-03-01T00:00:00Z",
    "created_at": "2025-01-12T14:20:00Z"
  }
]
```

- **Option 2:** Wrapped format (recommended for consistency)
```json
{
  "data": [
    {
      "id": 1,
      "title": "Software Engineer",
      "company": "The University of Lahore",
      "location": "Lahore, Pakistan",
      "category": "uol",
      "job_link": "https://careers.uol.edu.pk/job/123",
      "deadline": "2025-02-15T00:00:00Z",
      "created_at": "2025-01-10T10:30:00Z"
    }
  ],
  "error": null
}
```

**Response Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "data": null,
  "error": "Error message describing what went wrong"
}
```

---

### 2. Get Job by ID
**Endpoint:** `GET /jobs/{id}`

**Description:** Retrieves a single job posting by its ID.

**Request:**
```
GET /jobs/1
```

**Path Parameters:**
- `id` (integer, required): The job ID

**Response Format:**
```json
{
  "data": {
    "id": 1,
    "title": "Software Engineer",
    "company": "The University of Lahore",
    "location": "Lahore, Pakistan",
    "category": "uol",
    "job_link": "https://careers.uol.edu.pk/job/123",
    "deadline": "2025-02-15T00:00:00Z",
    "created_at": "2025-01-10T10:30:00Z",
    "description": "Full job description here..."
  },
  "error": null
}
```

**Response Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Job not found
- `500 Internal Server Error`: Server error

---

## Data Model

### Job Object Structure

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | integer | Yes | Unique job identifier | `1` |
| `title` | string | Yes | Job title | `"Software Engineer"` |
| `company` | string | No | Company/employer name | `"The University of Lahore"` |
| `location` | string | No | Job location | `"Lahore, Pakistan"` |
| `category` | string | No | Job category (used to distinguish UoL vs partner jobs) | `"uol"` or `"partner"` |
| `job_link` | string (URL) | No | External link to job application page | `"https://careers.uol.edu.pk/job/123"` |
| `deadline` | string (ISO 8601) | No | Application deadline date | `"2025-02-15T00:00:00Z"` |
| `created_at` | string (ISO 8601) | No | Job posting creation date | `"2025-01-10T10:30:00Z"` |
| `description` | string | No | Full job description (for detail view) | `"We are looking for..."` |

### Category Values
The `category` field is used to distinguish between:
- **UoL Jobs**: Jobs posted by The University of Lahore
  - Valid values: `"uol"`, `"the university of lahore"`, `"university of lahore"`, `"uol jobs"` (case-insensitive)
- **Partner Jobs**: Jobs from other employers
  - Any other value or `null`

---

## Frontend Requirements

### Sorting
The frontend handles sorting client-side, but the backend should return jobs ordered by `created_at` descending (newest first) by default.

**Expected Order:**
- All jobs: Ordered by `created_at DESC`
- Frontend then separates into:
  - **Active jobs**: `deadline >= today`, sorted by `deadline ASC` (earliest deadline first)
  - **Expired jobs**: `deadline < today`, sorted by `deadline DESC` (most recently expired first)

### Filtering Logic
The frontend performs client-side filtering:
1. **Active vs Expired**: Jobs with `deadline < today` are considered expired
2. **UoL vs Partner**: Jobs with `category` matching UoL categories are displayed separately
3. **Search**: Frontend searches across `title`, `company`, and `location` fields

### Date Format
- All dates should be in **ISO 8601 format** (e.g., `"2025-02-15T00:00:00Z"`)
- Dates should be in UTC timezone
- The `deadline` field should represent the end of the application period (midnight UTC)

---

## Database Schema Reference

Based on the previous Supabase implementation, the expected database table structure:

**Table Name:** `tbljobs`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `title` | varchar(255) | NOT NULL | Job title |
| `company` | varchar(255) | NULL | Company name |
| `location` | varchar(255) | NULL | Job location |
| `category` | varchar(100) | NULL | Job category (uol/partner) |
| `job_link` | varchar(500) | NULL | External application URL |
| `deadline` | datetime | NULL | Application deadline |
| `created_at` | datetime | DEFAULT CURRENT_TIMESTAMP | Posting creation date |
| `updated_at` | datetime | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |
| `description` | text | NULL | Full job description (optional) |

---

## Implementation Notes

### 1. Response Format Consistency
The frontend handles both response formats:
- Direct array: `[{...}, {...}]`
- Wrapped format: `{ data: [{...}, {...}], error: null }`

**Recommendation:** Use the wrapped format (`{ data, error }`) for consistency with other endpoints and better error handling.

### 2. Date Handling
- Ensure all dates are returned in ISO 8601 format
- Handle `NULL` dates gracefully (frontend checks for existence before formatting)
- Compare dates using UTC to avoid timezone issues

### 3. Filtering
- Support optional query parameters for server-side filtering
- If filters are provided, apply them before returning results
- If no filters provided, return all jobs

### 4. Error Handling
- Always return a consistent error format: `{ data: null, error: "message" }`
- Include appropriate HTTP status codes
- Provide meaningful error messages for debugging

### 5. Performance Considerations
- Consider pagination for large datasets (use `limit` and `offset` parameters)
- Index database columns used in filtering (`category`, `deadline`, `created_at`)
- Consider caching for frequently accessed endpoints

---

## Example Implementation (Pseudocode)

```javascript
// GET /jobs
async function getJobs(req, res) {
  try {
    const { category, location, company, limit, offset } = req.query;
    
    // Build query
    let query = db.select('*').from('tbljobs');
    
    if (category) {
      query = query.where('category', '=', category);
    }
    if (location) {
      query = query.where('location', 'LIKE', `%${location}%`);
    }
    if (company) {
      query = query.where('company', 'LIKE', `%${company}%`);
    }
    
    // Order by created_at DESC (newest first)
    query = query.orderBy('created_at', 'desc');
    
    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const jobs = await query;
    
    // Format dates to ISO 8601
    const formattedJobs = jobs.map(job => ({
      ...job,
      deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
      created_at: job.created_at ? new Date(job.created_at).toISOString() : null
    }));
    
    res.json({
      data: formattedJobs,
      error: null
    });
    
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
}

// GET /jobs/:id
async function getJobById(req, res) {
  try {
    const { id } = req.params;
    
    const job = await db('tbljobs')
      .where('id', id)
      .first();
    
    if (!job) {
      return res.status(404).json({
        data: null,
        error: 'Job not found'
      });
    }
    
    // Format dates
    const formattedJob = {
      ...job,
      deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
      created_at: job.created_at ? new Date(job.created_at).toISOString() : null
    };
    
    res.json({
      data: formattedJob,
      error: null
    });
    
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
}
```

---

## Testing Checklist

- [ ] GET `/jobs` returns all jobs
- [ ] GET `/jobs` with `category=uol` filters correctly
- [ ] GET `/jobs` with `location` parameter filters correctly
- [ ] GET `/jobs` with `company` parameter filters correctly
- [ ] GET `/jobs` returns jobs ordered by `created_at DESC`
- [ ] GET `/jobs/{id}` returns single job
- [ ] GET `/jobs/{id}` returns 404 for non-existent job
- [ ] Dates are returned in ISO 8601 format
- [ ] NULL dates are handled gracefully
- [ ] Error responses follow the `{ data, error }` format
- [ ] Response includes all required fields
- [ ] CORS headers are properly configured for external API access

---

## Contact
For questions or clarifications, please contact the frontend development team.

**Last Updated:** January 2025

