# HealthEcho Game

An interactive medical diagnostic game where users analyze echocardiogram videos and compete against AI models to diagnose cardiac conditions based on ejection fraction (EF) values.

![HealthEcho Game](https://img.shields.io/badge/Medical-Diagnostic%20Game-blue) ![React](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Vite](https://img.shields.io/badge/Vite-5.x-purple) ![Flask](https://img.shields.io/badge/Flask-2.3.3-green)

## 🎯 Overview

HealthEcho Game is an educational tool designed for medical professionals and students to practice echocardiogram interpretation. Users watch authentic ultrasound videos and answer diagnostic questions while competing against machine learning models trained on thousands of clinical cases.

## ✨ Features

- **Real Medical Data**: Authentic echocardiogram videos from clinical practice
- **AI Competition**: Challenge ML models (LightGBM) trained on medical datasets
- **Interactive Quiz**: Progressive question system with immediate feedback
- **Video Playback Controls**: Adjustable speed controls (0.5x - 1.5x) for detailed analysis
- **Score Tracking**: Compare your diagnostic accuracy against AI predictions
- **Modern UI**: Built with ShadcnUI and Tailwind CSS for a professional interface
- **Responsive Design**: Full-width layout optimized for medical workstations

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: ShadcnUI + Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme
- **State Management**: React hooks for quiz state
- **Routing**: React Router for navigation

### Backend (Flask + Python)
- **API Server**: Flask with CORS support
- **ML Models**: LightGBM for cardiac function prediction
- **Data Processing**: Pandas for CSV data handling
- **Video Serving**: Static file serving for MP4 echocardiograms
- **Results Storage**: CSV-based score tracking

## 📁 Project Structure

```
├── src/
│   ├── components/ui/          # ShadcnUI component library
│   ├── pages/
│   │   ├── Index.tsx          # Homepage with game introduction
│   │   ├── QuizPageOriginal.tsx # Main quiz interface
│   │   └── NotFound.tsx       # 404 page
│   ├── types/
│   │   └── quiz.ts            # TypeScript interfaces
│   └── assets/                # Images and static assets
├── backend/
│   ├── API_server_original.py # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── quiz_question.json     # Static quiz questions
│   ├── lightgbm_model.pkl     # Trained ML model
│   ├── label_encoder.pkl      # ML preprocessing encoder
│   ├── FileList.csv          # Video metadata
│   └── results.csv           # User score history
├── public/
│   └── mp4/                   # Echocardiogram video files
├── package.json               # Node.js dependencies
└── vite.config.ts            # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/healthecho-game.git
   cd healthecho-game
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python API_server_original.py
   ```
   The Flask server will start at `http://127.0.0.1:5000`

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The React app will be available at `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Play

1. **Start the Quiz**: Click "Start the test" on the homepage
2. **Watch Videos**: Analyze echocardiogram videos using playback controls
3. **Answer Questions**: Select the most appropriate cardiac function classification
4. **Get Feedback**: Receive immediate results and AI comparison
5. **Track Progress**: View your score progression throughout the quiz
6. **Final Results**: Compare your overall performance against the AI model

## 🎛️ Video Controls

- **Playback Speed**: Adjust video speed from 0.5x to 1.5x for detailed analysis
- **Standard Controls**: Play, pause, seek, and volume controls
- **Auto-Reset**: Speed resets to 1x when starting new questions

## 📊 Scoring System

- **User Score**: Points awarded for correct diagnoses
- **AI Score**: Parallel scoring by machine learning model
- **Comparison**: Real-time tracking of human vs. AI performance
- **Results Storage**: Scores saved with timestamps for progress tracking

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern hooks-based architecture
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **ShadcnUI**: Professional component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Medical icons and indicators
- **React Router**: Client-side routing

### Backend
- **Flask 2.3.3**: Lightweight web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Pandas**: Data manipulation and analysis
- **LightGBM**: Gradient boosting ML framework
- **Scikit-learn**: Machine learning utilities
- **NumPy**: Numerical computing

## 🔧 Configuration

### Environment Variables
No environment variables required for basic setup.

### Model Configuration
- ML models are pre-trained and included as `.pkl` files
- Video metadata is configured in `FileList.csv`
- Quiz questions can be modified in `quiz_question.json`

## 📝 API Endpoints

- `GET /api/questions` - Fetch quiz questions and video metadata
- `POST /api/submit_results` - Submit user scores and get AI comparison
- `GET /videos/<filename>` - Serve echocardiogram video files
- `GET /api/previous_results` - Retrieve user's quiz history

## 🎨 UI/UX Features

- **Medical Theme**: Professional color scheme suitable for clinical environments
- **Accessibility**: ARIA labels and keyboard navigation support
- **Responsive Layout**: Optimized for various screen sizes
- **Progress Indicators**: Visual feedback on quiz completion
- **Loading States**: Smooth transitions and loading animations

## 🧪 Development

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint code checking
```

### Project Standards
- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Code quality and consistency
- **Component Architecture**: Reusable UI components
- **Clean Code**: Modular structure with clear separation of concerns

## 🎓 Educational Value

This project serves as:
- **Medical Training Tool**: Practice echocardiogram interpretation
- **AI Comparison Study**: Understand ML model capabilities in medical diagnosis
- **Interactive Learning**: Immediate feedback for skill improvement
- **Clinical Data Experience**: Work with authentic medical imaging data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is developed for educational purposes as part of a Data Mining course at Johannes Gutenberg University, Mainz, Germany.

## 🏥 Medical Disclaimer

This tool is for educational purposes only and should not be used for actual medical diagnosis. Always consult qualified healthcare professionals for medical decisions.

## 📞 Support

For technical support or questions about the project, please contact the development team through the university's Data Mining course channels.

---

**Data Mining • Johannes Gutenberg University • Mainz, Germany**
