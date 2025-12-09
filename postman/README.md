# Postman Collection for Email Template Manager API

This folder contains Postman collection and environment files for testing the Email Template Manager API.

## Files

1. **Email Template Manager API.postman_collection.json** - Complete API collection with all endpoints
2. **Email Template Manager Environment.postman_environment.json** - Environment variables for the API

## Import Instructions

### Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Email Template Manager API.postman_collection.json`
5. Click **Import**

### Import Environment
1. In Postman, click **Environments** (left sidebar)
2. Click **Import** button
3. Choose `Email Template Manager Environment.postman_environment.json`
4. Click **Import**
5. Select the imported environment from the environment dropdown (top right)

## Environment Variables

The environment includes the following variables:

- **app.var.base_url**: API base URL (default: `http://localhost:3001`)
- **app.var.template_id**: Template ID for testing (set after creating a template)
- **app.var.version_number**: Version number for testing (default: `1`)

## API Endpoints

### Health Check
- `GET /health` - Check API server status

### Templates
- `GET /api/templates/check-name` - Check if template name exists
- `POST /api/templates` - Create new template
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template by ID
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `GET /api/templates/:id/versions` - List all versions
- `GET /api/templates/:id/versions/:v` - Get specific version
- `POST /api/templates/:id/versions/:v/restore` - Restore version

### Sample Data
- `GET /api/templates/:id/sample-data` - Get sample data
- `PUT /api/templates/:id/sample-data` - Update sample data
- `DELETE /api/templates/:id/sample-data` - Delete sample data

### Assets
- `POST /api/assets/upload` - Upload image to S3

## Usage Tips

1. **Create a template first** - Use "Create Template" request to get a `templateId`
2. **Update app.var.template_id variable** - After creating a template, copy the `templateId` from the response and update the `app.var.template_id` environment variable
3. **Test versioning** - Update a template multiple times to create versions, then test version endpoints
4. **Upload images** - Use the "Upload Image" request with a file and template ID

## Example Workflow

1. Import both collection and environment
2. Select the environment from dropdown
3. Run "Health Check" to verify server is running
4. Run "Create Template" to create your first template
5. Copy the `templateId` from response
6. Update `app.var.template_id` environment variable
7. Test other endpoints using the `app.var.template_id` variable

## Notes

- Make sure the backend server is running on `http://localhost:3001` (or update `app.var.base_url`)
- Template names are automatically converted to snake_case
- Sample data updates do NOT create new template versions
- Image uploads require a valid template ID and file (max 5MB)
- All endpoints return JSON responses with consistent error formatting
- Version numbers start at 1 and increment automatically on updates
- Template updates only create new versions if content, name, brandId, or language changes

## Request Examples

### Create Template

```json
{
  "name": "welcome_email",
  "brandId": "brand_123",
  "language": "en",
  "htmlContent": "<!DOCTYPE html><html><body><h1>Hi {{app.var.user.name}}</h1></body></html>",
  "sampleData": {
    "user.name": "John Doe"
  }
}
```

### Update Sample Data

```json
{
  "sampleData": {
    "app.var.user.name": "Jane Doe",
    "app.var.user.email": "jane@example.com",
    "app.var.company.name": "Acme Corp"
  }
}
```

### Image Upload

- Use `multipart/form-data` format
- Form field name: `file`
- Additional field: `templateId` (string)
- Supported formats: JPEG, PNG, GIF, WebP, SVG
- Max file size: 5MB

