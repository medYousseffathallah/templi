# Templi - Template Matching App

Templi is a web application that combines the swiping functionality of Tinder with a TikTok-like sidebar for navigation. It allows users to discover, like, and save templates for various purposes such as websites, mobile apps, dashboards, and more.

## Features

- **Tinder-like Swiping**: Swipe right to like templates, left to dislike
- **TikTok-style Sidebar**: Easy navigation between different sections
- **Template Discovery**: Browse templates by category or tags
- **User Profiles**: Save favorite templates and track your activity
- **Template Upload**: Share your own templates with the community

## Tech Stack

- **Frontend**: React, Material-UI, Styled Components
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (planned)

## Project Structure

```
├── public/                  # Static files
├── src/                     # React frontend
│   ├── components/          # React components
│   │   ├── Header.js        # App header
│   │   ├── Sidebar.js       # Navigation sidebar
│   │   ├── SwipeContainer.js # Template swiping container
│   │   └── TemplateCard.js  # Individual template card
│   ├── services/            # API services
│   │   └── api.js           # API client
│   ├── App.js               # Main app component
│   └── index.js             # Entry point
├── models/                  # MongoDB models
│   ├── Template.js          # Template schema
│   ├── User.js              # User schema
│   └── Interaction.js       # User-template interactions
├── routes/                  # API routes
│   ├── templates.js         # Template endpoints
│   ├── users.js             # User endpoints
│   └── interactions.js      # Interaction endpoints
├── seed/                    # Database seeding
│   └── seedTemplates.js     # Seed script for templates
├── server.js                # Express server
└── .env                     # Environment variables
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/templi.git
cd templi
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

4. Seed the database with sample templates

```bash
node seed/seedTemplates.js
```

5. Start the backend server

```bash
node server.js
```

6. In a new terminal, start the React frontend

```bash
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Templates

- `GET /api/templates` - Get all templates
- `GET /api/templates/discover` - Get templates with pagination and filtering
- `GET /api/templates/:id` - Get a single template
- `POST /api/templates` - Create a template
- `PATCH /api/templates/:id` - Update a template
- `DELETE /api/templates/:id` - Delete a template

### Users

- `GET /api/users/:id` - Get user profile
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/:id/favorites` - Get user's favorite templates
- `POST /api/users/:id/favorites/:templateId` - Add template to favorites
- `DELETE /api/users/:id/favorites/:templateId` - Remove template from favorites

### Interactions

- `POST /api/interactions` - Record a new interaction (like, dislike, favorite, view)
- `GET /api/interactions/user/:userId` - Get all interactions for a specific user
- `GET /api/interactions/template/:templateId` - Get all interactions for a specific template
- `GET /api/interactions/stats/template/:templateId` - Get interaction stats for a template

## Future Enhancements

- User authentication with JWT
- Image upload for templates
- Advanced filtering and search
- Recommendation algorithm based on user preferences
- Real-time notifications
- Mobile app version

## License

MIT