'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizResults } from '../types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const QuizPageOriginal: React.FC = () => {
  const [title] = useState("Quiz with AI");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNextButton, setShowNextButton] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<any[]>([]);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('0:00');
  const [currentTime, setCurrentTime] = useState<string>('0:00');

  const currentQuestion = questions[currentIndex];

  // Change video playback speed
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Effect to set playback speed when video loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [currentIndex, playbackSpeed]);

  // Calculate elapsed time
  const calculateElapsedTime = () => {
    if (!startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Real-time timer update during quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (started && !quizEnded && startTime) {
      interval = setInterval(() => {
        setCurrentTime(calculateElapsedTime());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, quizEnded, startTime]);

  // Update elapsed time when quiz ends
  useEffect(() => {
    if (quizEnded && startTime) {
      setElapsedTime(calculateElapsedTime());
    }
  }, [quizEnded, startTime]);

  // Get or create user ID (similar to original)
  const getUserID = () => {
    if (typeof document === 'undefined') return 'user_default';
    const cookieName = "userID";
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    if (match) return match[2];
    const newID = 'user_' + Math.random().toString(36).substring(2, 12);
    document.cookie = `${cookieName}=${newID}; max-age=31536000; path=/`;
    return newID;
  };

  // Start quiz function
  const startQuiz = async () => {
    setStarted(true);
    setLoading(true);
    setStartTime(Date.now());
    
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Kunde inte hämta frågor:', error);
      // You could set some default questions here if needed
    } finally {
      setLoading(false);
    }
  };

  // Get AI answer
  const getAIAnswer = async (questionObj: QuizQuestion): Promise<string> => {
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ESV: questionObj.metadata.ESV,
          EDV: questionObj.metadata.EDV,
          FrameHeight: questionObj.metadata.FrameHeight,
          FrameWidth: questionObj.metadata.FrameWidth,
          FPS: questionObj.metadata.FPS,
          NumberOfFrames: questionObj.metadata.NumberOfFrames,
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction API failed');
      }

      const data = await response.json();
      return data.prediction;
    } catch (error) {
      console.error('API error:', error);
      return "Normal"; // fallback
    }
  };

  // Select answer function
  const selectAnswer = async (selectedAnswer: string) => {
    setAnswerSelected(true);
    const question = currentQuestion;
    const correctAnswer = question.correct;
    const isCorrect = selectedAnswer === correctAnswer;

    // Get AI answer
    const aiAnswer = await getAIAnswer(question);
    const aiCorrect = aiAnswer === correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedbackMessage("Rätt svar! 🎉");
    } else {
      setFeedbackMessage(`Fel svar. Rätt svar var: ${correctAnswer}`);
      
      // Generate explanation based on correct answer
      let explanation = "";
      if (correctAnswer === "Normal") {
        explanation = "Normal left ventricular ejection fraction is typically between 50-70%. Values in this range indicate good cardiac pumping function.";
      } else if (correctAnswer === "Reduced") {
        explanation = "Reduced ejection fraction (typically <40%) indicates impaired left ventricular systolic function, often associated with heart failure.";
      } else if (correctAnswer === "Abnormal") {
        explanation = "This echocardiogram shows abnormal cardiac function that doesn't fit the normal parameters, requiring further clinical evaluation.";
      }

      setIncorrectAnswers(prev => [...prev, {
        question: question.question,
        selected: selectedAnswer,
        correct: correctAnswer,
        explanation: explanation
      }]);
    }

    if (aiCorrect) {
      setAiScore(prev => prev + 1);
    }

    setShowNextButton(true);
  };

  // Next question function
  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizEnded(true);
      // Save results similar to original
      saveResults();
    } else {
      setCurrentIndex(prev => prev + 1);
      setAnswerSelected(false);
      setFeedbackMessage("");
      setShowNextButton(false);
    }
  };

  // Save results
  const saveResults = async () => {
    try {
      const userID = getUserID();
      const result = {
        userID,
        score,
        ai_score: aiScore,
        total: questions.length,
        timestamp: new Date().toLocaleString()
      };

      const response = await fetch("/api/submit_results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        console.log("Results saved successfully");
      }
    } catch (error) {
      console.error("Failed to save results:", error);
    }
  };

  // Restart quiz
  const restartQuiz = () => {
    setStarted(false);
    setQuizEnded(false);
    setCurrentIndex(0);
    setScore(0);
    setAiScore(0);
    setAnswerSelected(false);
    setFeedbackMessage("");
    setShowNextButton(false);
    setIncorrectAnswers([]);
    setPlaybackSpeed(1.0);
    setStartTime(null);
    setElapsedTime('0:00');
    setCurrentTime('0:00');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        {/* Start Screen */}
        {!started && !quizEnded && (
          <div className="min-h-screen flex items-center justify-center px-4 pb-16">
            <Card className="text-center p-8 shadow-elegant max-w-4xl w-full">
              <CardHeader>
                <CardTitle className="text-4xl font-bold mb-4">{title}</CardTitle>
                <p className="text-lg text-muted-foreground mb-8">Press the button to start the test!</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={startQuiz}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-red hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Start the test
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Screen */}
        {loading && (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center p-8 shadow-elegant">
              <CardContent className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-lg">Laddar frågor, vänligen vänta...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Screen */}
        {started && !quizEnded && currentQuestion && (
          <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <div className="bg-white border-b shadow-sm">
              <div className="w-full px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Left side - Exit and Title */}
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => window.location.href = '/'}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Exit Quiz
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">Cardiac Assessment Challenge</h1>
                  </div>

                  {/* Right side - Timer and Scores */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono">{currentTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">You</span>
                        <span className="text-2xl font-bold text-red-600">{score}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-red-600">🤖</span>
                        </div>
                        <span className="text-sm text-gray-600">AI</span>
                        <span className="text-2xl font-bold text-red-600">{aiScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Left Side - Question and Video */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {currentQuestion.question}
                  </h2>
                  
                  <Card className="overflow-hidden shadow-lg">
                    <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                      <span className="text-sm text-gray-600">Echocardiogram</span>
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500">Speed:</span>
                        {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changePlaybackSpeed(speed)}
                            className={`px-2 py-1 text-xs rounded ${
                              playbackSpeed === speed 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-black aspect-video relative">
                      {currentQuestion.videoUrl && (
                        <video 
                          ref={videoRef}
                          key={currentIndex} 
                          controls 
                          className="w-full h-full object-contain"
                          style={{ backgroundColor: 'black' }}
                          onLoadedMetadata={() => {
                            if (videoRef.current) {
                              videoRef.current.playbackRate = playbackSpeed;
                            }
                          }}
                        >
                          <source src={currentQuestion.videoUrl} type="video/mp4" />
                          Din webbläsare stödjer inte video.
                        </video>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Side - Answer Selection */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select Your Answer
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Choose the most appropriate diagnosis based on the echocardiogram
                    </p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.answers.map((answer, index) => {
                      const isSelected = answerSelected && answer === currentQuestion.correct;
                      const isWrong = answerSelected && answer !== currentQuestion.correct;
                      const letters = ['A', 'B', 'C'];
                      
                      return (
                        <div
                          key={index}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-red-500 bg-red-50' 
                              : isWrong && answerSelected
                              ? 'border-gray-300 bg-gray-50 opacity-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => !answerSelected && selectAnswer(answer)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isSelected 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {letters[index]}
                              </div>
                              <span className={`font-medium ${
                                isSelected ? 'text-red-700' : 'text-gray-900'
                              }`}>
                                {answer}
                              </span>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              isSelected 
                                ? 'border-red-500 bg-red-500' 
                                : 'border-gray-300'
                            } flex items-center justify-center`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Message */}
                  {feedbackMessage && (
                    <div className={`p-4 rounded-lg ${
                      feedbackMessage.includes('Rätt') 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <p className="font-medium">{feedbackMessage}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {showNextButton ? (
                    <Button 
                      onClick={nextQuestion}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 text-lg"
                    >
                      {currentIndex + 1 >= questions.length ? "View Results" : "Next question"}
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 text-lg cursor-not-allowed"
                    >
                      Next question
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {quizEnded && (
          <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-white">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                <h1 className="text-xl font-semibold">Assessment Results</h1>
                <div className="w-24"></div> {/* Spacer for centering */}
              </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Your Score */}
                <Card className="text-center p-6">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Trophy className="h-5 w-5" />
                      <span className="font-medium">Your Score</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-blue-600">{score}/{questions.length}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((score / questions.length) * 100)}% Accuracy
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Score */}
                <Card className="text-center p-6">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">AI</span>
                      </div>
                      <span className="font-medium">AI Score</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-purple-600">{aiScore}/{questions.length}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((aiScore / questions.length) * 100)}% Accuracy
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Elapsed */}
                <Card className="text-center p-6">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Time Elapsed</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-green-600">{elapsedTime}</div>
                      <div className="text-sm text-muted-foreground">Total Duration</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Correct Answers */}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Correct Answers</div>
                        <div className="text-sm text-muted-foreground">
                          {score} out of {questions.length} questions
                        </div>
                      </div>
                    </div>

                    {/* Incorrect Answers */}
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Incorrect Answers</div>
                        <div className="text-sm text-muted-foreground">
                          {incorrectAnswers.length} question{incorrectAnswers.length !== 1 ? 's' : ''} to review
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Comparison */}
                  <div className="pt-4 border-t">
                    <div className="font-medium mb-2">Comparison with AI Assistant</div>
                    <div className="text-sm text-muted-foreground">
                      {score > aiScore && `Great job! You scored ${score - aiScore} point${score - aiScore !== 1 ? 's' : ''} higher than the AI.`}
                      {score < aiScore && `Good effort! The AI scored ${aiScore - score} point${aiScore - score !== 1 ? 's' : ''} higher.`}
                      {score === aiScore && `Excellent! You matched the AI's performance exactly.`}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Incorrect Answers */}
              {incorrectAnswers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Review Incorrect Answers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {incorrectAnswers.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg mb-4 last:mb-0">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2 text-left">
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                              <span className="font-medium">Question {index + 1}: {item.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Your Answer */}
                                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-red-900">Your Answer</div>
                                    <div className="text-red-700">{item.selected}</div>
                                  </div>
                                </div>

                                {/* Correct Answer */}
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-green-900">Correct Answer</div>
                                    <div className="text-green-700">{item.correct}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Explanation */}
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="font-medium text-blue-900 mb-2">Explanation</div>
                                <div className="text-blue-800 text-sm leading-relaxed">
                                  {item.explanation || `The correct answer is "${item.correct}". This is based on standard medical diagnostic criteria for echocardiogram interpretation.`}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={restartQuiz}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Take Quiz Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 font-medium"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer - Fixed at bottom */}
      <footer className="bg-muted border-t py-3 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Data Mining • Johannes Gutenberg University • Mainz, Germany
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QuizPageOriginal;
