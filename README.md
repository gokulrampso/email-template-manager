# Email Template Manager

A complete Email Template Management System with versioning, HTML preview, and S3 image upload.

## Features

- ✅ **Template CRUD** - Create, read, update templates
- ✅ **Version Control** - Automatic versioning on every update
- ✅ **HTML Preview** - Live side-by-side preview while editing
- ✅ **Image Upload** - Upload images to S3 with automatic URL insertion
- ✅ **Placeholder Detection** - Automatically extracts `{{variable}}` patterns
- ✅ **Version History** - View and restore previous versions
- ✅ **Modern UI** - Clean, dark theme with Tailwind CSS

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates` | Create new template (version = 1) |
| GET | `/api/templates` | List all templates (latest version) |
| GET | `/api/templates/:id` | Get latest version |
| PUT | `/api/templates/:id` | Update → creates new version |
| GET | `/api/templates/:id/versions` | List all versions |
| GET | `/api/templates/:id/versions/:v` | Get specific version |
| POST | `/api/templates/:id/versions/:v/restore` | Restore version |
| POST | `/api/assets/upload` | Upload image to S3 |

## DynamoDB Schema

| Field | Type | Description |
|-------|------|-------------|
| PK: templateId | string | UUID |
| SK: version | number | Auto-incremented |
| name | string | Template name |
| brandId | string | Optional brand identifier |
| language | string | Optional language code |
| htmlContent | string | The HTML content |
| placeholders | string[] | Extracted `{{variables}}` |
| createdAt | string | ISO timestamp |
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
2. Enter template name and optional brand/language
3. Write HTML content with placeholders like `{{user.name}}`
4. View live preview on the right panel
5. Click "Create Template"

### Editing a Template

1. Click "Edit" on any template
2. Modify the content
3. Click "Save Changes" → creates a new version
4. Upload images using the image uploader

### Version Management

1. Click the clock icon to view version history
2. Preview any previous version
3. Click "Restore" to create a new version from old content

### Placeholders

Use `{{variable}}` syntax in your HTML:
- `{{user.name}}` - Simple variable
- `{{company.logo}}` - Nested object property
- `{{action.url}}` - Link URLs

Placeholders are automatically detected and listed.

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

## License

MIT

