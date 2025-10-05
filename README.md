# 📝 Answer Check Using NLP

A comprehensive web application that uses Natural Language Processing (NLP) to evaluate and compare student answers against model answers. The system extracts text from various file formats (PDF, DOCX, images) and provides detailed analysis including keyword matching, semantic similarity, and tone analysis.

**🎯 Final Project Status: COMPLETE & PRODUCTION READY** ✅

## ✨ Features

### 🔍 Text Extraction & Processing
- **Multi-format Support**: PDF, DOCX, DOC, TXT, PNG, JPG, JPEG, GIF, BMP
- **Advanced OCR**: Gemini Vision API for handwritten/scanned documents
- **Hybrid PDF Processing**: Direct text extraction with OCR fallback for scanned pages
- **Intelligent Fallbacks**: Graceful degradation when OCR services are unavailable
- **Text Preprocessing**: Advanced cleaning, tokenization, lemmatization, and stop-word removal

### 📊 Comprehensive Evaluation Engine
- **Keyword Matching**: Advanced algorithm identifying matching keywords between answers
- **Semantic Similarity**: Sentence Transformers for deep meaning comparison
- **Tone Analysis**: Sentiment analysis using TextBlob with multiple tone categories
- **Weighted Scoring**: Configurable evaluation weights (Keywords: 10%, Semantics: 70%, Tone: 20%)
- **Real-time Processing**: Instant evaluation results with detailed breakdowns

### 🎨 Modern UI/UX
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Animated spinners and progress indicators during processing
- **File Management**: Drag-and-drop upload with file type detection and size limits
- **Progress Visualization**: Dynamic animated progress bars with accurate percentage display
- **Interactive Elements**: Hover effects, smooth transitions, and visual feedback
- **Error Handling**: User-friendly error messages and recovery options

### 🔧 Advanced Technical Features
- **State Persistence**: LocalStorage integration for data preservation across sessions
- **Navigation Control**: Smart routing with automatic redirects and user choice
- **API Architecture**: RESTful FastAPI backend with comprehensive error handling
- **Performance Optimization**: Efficient text processing and memory management

## 🛠️ Technology Stack

### Backend
- **Python 3.13**: Core programming language
- **FastAPI**: High-performance async web framework
- **Uvicorn**: ASGI server for production deployment
- **Sentence Transformers**: Advanced semantic similarity using transformer models
- **TextBlob**: Sentiment analysis and tone detection
- **NLTK**: Natural language processing toolkit
- **PyPDF2**: PDF text extraction and manipulation
- **python-docx**: Microsoft Word document processing
- **Pillow**: Comprehensive image processing
- **pdf2image**: PDF to image conversion for OCR processing
- **Gemini Vision API**: Google AI for advanced OCR capabilities
- **Transformers**: Hugging Face transformers for NLP models

### Frontend
- **React 18**: Modern JavaScript library with hooks
- **Vite**: Lightning-fast build tool and development server
- **React Router v6**: Declarative client-side routing
- **CSS3**: Advanced styling with animations and responsive design
- **React Icons**: Comprehensive icon library
- **LocalStorage API**: Client-side data persistence
- **Responsive Design**: Mobile-first approach with breakpoints

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

### System Requirements
- **Python 3.13** or higher
- **Node.js 18+** and **npm**
- **Git** for version control

### API Keys Required
- **Google Gemini API Key**: Required for OCR functionality
  - Get from: https://makersuite.google.com/app/apikey
  - Free tier available with reasonable limits
  - **edit the Api key in Answer-check-using-NLP\backend\app.py
  - line no. 26**

### System Dependencies (Required for PDF OCR)
- **Poppler** (for pdf2image library)
  - **Windows**: Download from https://blog.alivate.com.au/poppler-windows/
  - **macOS**: `brew install poppler`
  - **Linux**: `sudo apt-get install poppler-utils`

### Hardware Requirements
- **RAM**: Minimum 8GB recommended
- **Storage**: 2GB free space for models and dependencies
- **Internet**: Required for API calls and initial model downloads

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Luckyhunt/Answer-check-using-NLP.git
cd Answer-check-using-NLP
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Download NLTK Data (Required)
```bash
cd backend
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

#### Configure API Key
1. Get your Gemini API key from https://makersuite.google.com/app/apikey
2. Edit `backend/app.py` and replace the placeholder:
```python
# Line 26 in app.py
GEMINI_API_KEY = "your_actual_gemini_api_key_here"
```

#### Start Backend Server
```bash
# From backend directory
uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# Or from project root
cd backend && uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

**Note**: First run may take longer due to model downloads.

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Production Build

#### Build Frontend for Production
```bash
cd frontend
npm run build
```

## 🎯 Usage Guide

### Step 1: Upload Files
1. Navigate to the home page (`http://localhost:5173`)
2. **Upload Model Answer**: Select the official answer key file
3. **Upload Student Answer**: Select the student's submitted answer
4. Supported formats: PDF, DOCX, DOC, TXT, PNG, JPG, JPEG, GIF, BMP

### Step 2: Process Files
1. Click **"Process & Review Extracted Text"**
2. Wait for the loading indicator to complete text extraction
3. The system will automatically navigate to the results page

### Step 3: Review Results
1. **Extracted Text**: View the processed text from both files
2. **Evaluation Metrics**:
   - **Keywords**: Percentage of matching keywords (0-100%)
   - **Semantics**: Semantic similarity score (0-100%)
   - **Tone**: Sentiment analysis result
   - **Word Count**: Comparison of answer lengths
3. **Overall Score**: Weighted combination of all metrics

### Step 4: Additional Actions
- **📤 Upload New Files**: Clear current data and upload new files
- **🔄 Start Fresh**: Reset everything and return to upload page

## 🔧 Configuration

### Evaluation Weights
Modify the scoring formula in `frontend/src/componants/Evaluation/Evaluation.jsx`:
```javascript
const testScore = 0.1 * evaluation.keyword + 0.7 * evaluation.semantics + 0.2 * evaluation.toneScore
```

### API Endpoints
- `GET /`: API status and information
- `POST /extractFileText`: Extract text from uploaded files
- `POST /evaluation`: Evaluate answer similarity
- `GET /docs`: Interactive API documentation

### File Size Limits
- Maximum file size: Configurable in upload components
- Recommended: Keep files under 10MB for optimal performance

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- **Issue**: Import errors or missing dependencies
- **Solution**: Ensure all Python packages are installed and NLTK data is downloaded

#### OCR Not Working
- **Issue**: "Poppler utility is missing"
- **Solution**: Install Poppler for your operating system (see Prerequisites)

#### Frontend Build Fails
- **Issue**: Node modules not installed
- **Solution**: Run `npm install` in frontend directory

#### Upload Button Not Working
- **Issue**: Page doesn't navigate to upload page
- **Solution**: Clear browser cache and ensure routes are properly configured

#### Evaluation Shows 0 Keywords
- **Issue**: Keyword matching returns zero
- **Solution**: Check that text extraction completed successfully

### Debug Mode
Enable debug logging by modifying the backend console output settings.

## 📁 Project Structure

```
Answer-check-using-NLP/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── evaluation.py          # NLP evaluation functions
│   ├── text_preprocessing.py  # Text cleaning utilities
│   ├── requirements.txt       # Python dependencies
│   └── __pycache__/          # Python cache files
├── frontend/
│   ├── public/
│   │   └── images/           # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Evaluation/   # Results display
│   │   │   ├── Hero/         # Landing page
│   │   │   ├── Navbar/       # Navigation
│   │   │   ├── Upload/       # File upload interface
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── Home/         # Upload page
│   │   │   └── Summary/      # Results page
│   │   ├── StateManager/     # React context
│   │   ├── images/           # Component images
│   │   └── main.jsx          # App entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Build configuration
├── venv/                     # Python virtual environment
└── README.md                 # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Gemini API** by Google for OCR capabilities
- **Sentence Transformers** for semantic similarity
- **FastAPI** for the robust backend framework
- **React** for the modern frontend library

## 📞 Support

For support, please check the troubleshooting section above or open an issue in the repository.

---

## 🎯 Quick Start Guide

### For New Users:
1. **Clone & Install**: `git clone <repo> && cd Answer-check-using-NLP`
2. **Setup Backend**: `cd backend && pip install -r requirements.txt && python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"`
3. **Get API Key**: Visit https://makersuite.google.com/app/apikey
4. **Configure**: Edit `backend/app.py` with your API key
5. **Start Services**:
   - Backend: `uvicorn app:app --host 127.0.0.1 --port 8000`
   - Frontend: `cd frontend && npm install && npm run dev`
6. **Use**: Open http://localhost:5173 and start evaluating!

### Project Status: ✅ COMPLETE
- **All Features**: Implemented and tested
- **UI/UX**: Polished and responsive
- **Error Handling**: Comprehensive fallbacks
- **Documentation**: Complete setup guide
- **Production Ready**: Optimized for deployment

**Happy Evaluating! 🎓📚✨**
