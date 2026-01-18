# 🚀 CodeMentor

> **Your personal AI-powered code explanation companion** — Understand any code snippet in seconds with AI-generated explanations in Nepali for beginner coders.

[![Django](https://img.shields.io/badge/Django-5.0-darkgreen.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- **🤖 AI Code Explanation** — Paste any code snippet and get instant, easy-to-understand explanations powered by Google's Gemini AI with Nepali references
- **💡 Smart Suggestions** — Get improvement recommendations for your code
- **🎨 Code Syntax Highlighting** — Beautiful syntax highlighting with support for 50+ programming languages
- **📁 History Tracking** — Keep track of all your code explanations with searchable history
- **📥 Export & Share** — Download explanations as PDF or share via link
- **🌓 Dark Mode** — Eye-friendly dark theme with smooth animations
- **⚡ Fast & Responsive** — Optimized for speed with real-time processing
- **🔐 Secure** — CORS-protected backend with environment-based configuration

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** — React framework with App Router
- **React 18** — UI library
- **Tailwind CSS** — Utility-first styling
- **Monaco Editor** — Professional code editor
- **Framer Motion** — Smooth animations
- **React Syntax Highlighter** — Code formatting
- **jsPDF & html2canvas** — PDF export functionality

### Backend

- **Django 5.0** — Python web framework
- **Django REST Framework** — RESTful API
- **Google Generative AI (Gemini)** — AI explanations
- **PostgreSQL/SQLite** — Database
- **Gunicorn** — Production server

### DevOps

- **Docker** — Containerization
- **Docker Compose** — Multi-container orchestration

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.10+ (for local development)
- Node.js 18+ (for local development)
- Google Gemini API Key

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd butwalhacks

# Create environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 📁 Project Structure

```
butwalhacks/
├── frontend/                 # Next.js React application
│   ├── app/                  # App Router pages
│   │   ├── page.js           # Home page
│   │   ├── history/          # History page
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── components/           # React components
│   │   ├── CodeMentor.js     # Main component
│   │   ├── ExplanationRenderer.js
│   │   ├── LanguageSelector.js
│   │   └── ...
│   ├── lib/                  # Utilities
│   │   ├── api.js            # API client
│   │   ├── auth.js           # Authentication
│   │   └── storage.js        # Local storage
│   └── public/               # Static assets
│
├── backend/                  # Django REST API
│   ├── api/                  # Main app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # Data serializers
│   │   ├── urls.py           # URL routing
│   │   └── services/         # Business logic
│   │       ├── ai_service.py
│   │       └── gemini_service.py
│   ├── codementor/           # Django settings
│   ├── manage.py
│   └── requirements.txt
│
├── docker-compose.yml        # Multi-container setup
└── README.md
```

---

## 🔌 API Endpoints

### Explanations

- **POST** `/api/explain/` — Submit code for explanation

  ```json
  {
    "code": "def hello():\n    print('Hello')",
    "language": "python"
  }
  ```

- **GET** `/api/explain/{id}/` — Retrieve explanation by ID

- **GET** `/api/explain/` — List all explanations

### History

- **GET** `/api/history/` — Get user's explanation history
- **DELETE** `/api/history/{id}/` — Delete a history entry

---

## 🎯 Usage

1. **Paste Your Code** — Copy any code snippet into the editor
2. **Select Language** — Choose the programming language (or auto-detect)
3. **Click Explain** — Submit for AI analysis
4. **Review Results** — Get explanation with Nepali references and suggestions
5. **Export or Share** — Download as PDF or share the link
6. **Save to History** — All explanations are automatically saved

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Django
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Database (optional, uses SQLite by default)
# DATABASE_URL=postgresql://user:password@localhost/dbname
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change ports in docker-compose.yml or free up ports
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000
```

### CORS Issues

- Ensure `ALLOWED_HOSTS` includes your frontend domain
- Check `CORS_ALLOWED_ORIGINS` in Django settings

### Gemini API Errors

- Verify API key is valid and has sufficient quota
- Check API is enabled in Google Cloud Console

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Authors

Aarambha Gautam
Anjana Aryal

---

## 🙋 Support

Have questions or suggestions? Feel free to:

- Open an [Issue](../../issues)
- Create a [Discussion](../../discussions)
- Contact us via email

---

**Happy coding! 🎉**
