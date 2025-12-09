# Email Template Manager

A complete Email Template Management System with versioning, HTML preview, and S3 image upload.

## Features

- ✅ **Template CRUD** - Create, read, update, and delete templates
- ✅ **Version Control** - Automatic versioning on every update with version history
- ✅ **HTML Preview** - Live preview with placeholder highlighting in create/edit screens
- ✅ **Dedicated Preview Screen** - Preview templates with dynamic sample data inputs
- ✅ **Image Upload** - Upload images to S3 with automatic URL insertion
- ✅ **Placeholder Detection** - Automatically extracts `{{variable}}` patterns from HTML
- ✅ **Sample Data Management** - Store and manage sample data for template previews
- ✅ **Visual Builder** - Drag-and-drop block-based template builder
- ✅ **Code Editor** - Direct HTML editing with syntax highlighting
- ✅ **Version Comparison** - Side-by-side diff view with inline change highlighting
- ✅ **Template Sorting** - Sort templates by name or last updated date
- ✅ **Name Validation** - Real-time duplicate name checking
- ✅ **Modern UI** - Clean, dark theme with Tailwind CSS and gradient accents

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **File Upload**: Multer

### Frontend
- **Framework**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design system
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Code Editor**: Monaco Editor (via react-ace)
- **Build Tool**: Vite

## Project Structure

```
email-template-manager/
├── backend/
│   ├── src/
│   │   ├── config/        # AWS configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # TypeScript interfaces
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   └── server.ts      # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates` | Create new template (version = 1) |
| GET | `/api/templates` | List all templates (latest version only) |
| GET | `/api/templates/:id` | Get latest version of a template |
| PUT | `/api/templates/:id` | Update template (creates new version if content changed) |
| DELETE | `/api/templates/:id` | Delete template and all its versions |
| GET | `/api/templates/check-name` | Check if template name already exists |
| GET | `/api/templates/:id/versions` | List all versions for a template |
| GET | `/api/templates/:id/versions/:v` | Get specific version |
| POST | `/api/templates/:id/versions/:v/restore` | Restore a version (creates new version) |

### Sample Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates/:id/sample-data` | Get sample data for a template |
| PUT | `/api/templates/:id/sample-data` | Create or update sample data |
| DELETE | `/api/templates/:id/sample-data` | Delete sample data for a template |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets/upload` | Upload image to S3 (multipart/form-data, max 5MB) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API server status |

## DynamoDB Schema

### Templates Table

| Field | Type | Description |
|-------|------|-------------|
| PK: templateId | string | UUID (primary key) |
| SK: version | number | Auto-incremented version (sort key) |
| name | string | Template name (stored as snake_case) |
| brandId | string | Optional brand identifier |
| language | string | Optional language code (e.g., "en", "es") |
| htmlContent | string | The HTML template content |
| placeholders | string[] | Array of extracted `{{variable}}` patterns |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

### Sample Data Table (Optional)

Sample data is stored separately and linked to templates via `templateId`. This allows sample data to be updated without creating new template versions.

| Field | Type | Description |
|-------|------|-------------|
| templateId | string | UUID (primary key) |
| sampleData | object | Key-value pairs for placeholder values |
| updatedAt | string | ISO timestamp |

## Setup Instructions

### Prerequisites
- Node.js 18+
- AWS Account with DynamoDB and S3 access
- AWS CLI configured (optional)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `.env` file in backend:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your AWS credentials:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
DYNAMODB_TABLE=EmailTemplates
S3_BUCKET=email-template-assets
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Create AWS Resources

#### DynamoDB Table

Create a table named `EmailTemplates` with:
- **Partition Key**: `templateId` (String)
- **Sort Key**: `version` (Number)

```bash
aws dynamodb create-table \
  --table-name EmailTemplates \
  --attribute-definitions \
    AttributeName=templateId,AttributeType=S \
    AttributeName=version,AttributeType=N \
  --key-schema \
    AttributeName=templateId,KeyType=HASH \
    AttributeName=version,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

#### S3 Bucket

Create a bucket for storing template images:

```bash
aws s3 mb s3://email-template-assets

# Enable public access for images
aws s3api put-public-access-block \
  --bucket email-template-assets \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 4. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

### Creating a Template

1. Click "New Template" on the home page
2. Choose between Visual Builder or Code Editor mode
3. **Visual Builder**: Use drag-and-drop blocks to build your template
4. **Code Editor**: Write HTML directly with syntax highlighting
5. Enter template name (automatically converted to snake_case)
6. Add optional brand ID and language code
7. Use placeholders like `{{app.var.user.name}}` in your HTML
8. View live preview with highlighted placeholders
9. Click "Create" to save

### Editing a Template

1. Click "Edit" on any template from the list
2. Modify HTML content or use visual blocks
3. Placeholders are highlighted in yellow in the preview
4. Click "Update" to save changes (creates new version if content changed)
5. Use the Preview button (top-right) to test with sample data
6. Upload images using the image uploader

### Previewing Templates

1. Click the eye icon on any template, or use the Preview button in edit mode
2. View template with sample data applied
3. Input fields are automatically generated for all placeholders
4. Modify sample data values in real-time
5. See instant preview updates as you change values
6. Sample data is saved per template for future previews

### Version Management

1. Click the clock icon on any template to view version history
2. See side-by-side comparison with inline change highlighting
3. Horizontal scrolling supported for long lines
4. Click "Preview" on any version to see it rendered
5. Click "Restore" to create a new version from an old one
6. Current version is clearly marked

### Template List Features

- **Sorting**: Click column headers to sort by:
  - Template Name (alphabetical)
  - Last Updated (chronological)
- **Quick Actions**: 
  - Preview (eye icon)
  - Version History (clock icon)
  - Edit (green button)
  - Delete (trash icon)

### Placeholders

Use `{{app.var.variable}}` syntax in your HTML:
- `{{app.var.user.name}}` - Simple variable
- `{{app.var.company.logo}}` - Nested object property  
- `{{app.var.action.url}}` - Link URLs
- Placeholders work in text content, HTML attributes (href, src, etc.), and everywhere in the HTML

Placeholders are:
- Automatically detected and listed
- Highlighted in yellow in create/edit previews
- Dynamically extracted for preview screen inputs
- Replaced with sample data values in the preview screen

**Note**: All placeholders must be prefixed with `app.var.` (e.g., `{{app.var.user.name}}` instead of `{{user.name}}`)

## Development

### Backend

```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Postman Collection

A complete Postman collection is available in the `postman/` directory:

- **Collection**: `Email Template Manager API.postman_collection.json`
- **Environment**: `Email Template Manager Environment.postman_environment.json`

### Importing to Postman

1. Open Postman
2. Click "Import" button
3. Select both JSON files from the `postman/` directory
4. The environment includes variables:
   - `app.var.base_url`: http://localhost:3001
   - `app.var.template_id`: Set after creating a template
   - `app.var.version_number`: Version to use for version-specific requests

### Testing the API

All endpoints are documented with:
- Request examples with sample data
- Descriptions of required/optional fields
- Response format documentation

## Frontend Features

### Template Management
- **Template List**: View all templates with sorting by name or last updated
- **Create Template**: Two modes available:
  - **Visual Builder**: Drag-and-drop block-based editor with pre-built components
  - **Code Editor**: Direct HTML editing with syntax highlighting
- **Edit Template**: Update existing templates with version control
- **Template Preview**: 
  - Create/Edit screens show placeholder-highlighted preview
  - Dedicated preview screen with dynamic sample data inputs
  - Real-time preview updates as you modify data

### Version Control UI
- **Version History**: Side-by-side comparison view
- **Diff Visualization**: Inline character-level change highlighting
- **Horizontal Scrolling**: Support for long lines without wrapping
- **Version Restoration**: One-click restore from any version

### User Experience
- **Placeholder Highlighting**: Visual indicators (yellow/amber) for all placeholders
- **Name Validation**: Real-time duplicate checking with visual feedback
- **Sample Data Management**: 
  - Auto-population from template-specific defaults
  - Dynamic input field generation
  - Persistent storage per template
- **Responsive Design**: Works on desktop and tablet devices
- **Dark Theme**: Modern UI with gradient accents and glass-morphism effects

## Latest Features (Recent Updates)

- ✨ **Placeholder Highlighting**: Visual highlighting of placeholders in create/edit previews (including in links/attributes)
- ✨ **Enhanced Preview**: Dedicated preview screen with dynamic input generation
- ✨ **Template Sorting**: Sort templates by name or last updated date with visual indicators
- ✨ **Sample Data Management**: Store and manage sample data per template
- ✨ **Version Comparison**: Improved diff view with inline change detection and horizontal scrolling
- ✨ **UI Improvements**: 
  - Updated favicon matching app icon design
  - Removed UUID display from UI (cleaner interface)
  - Added Preview button in edit screen
  - Context-aware button labels ("Create" vs "Update")
- ✨ **Name Validation**: Real-time duplicate name checking with visual feedback

## License

MIT


