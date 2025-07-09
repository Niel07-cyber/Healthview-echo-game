'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResults } from '../types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const currentQuestion = questions[currentIndex];

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
      setIncorrectAnswers(prev => [...prev, {
        question: question.question,
        selected: selectedAnswer,
        correct: correctAnswer
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Start Screen */}
      {!started && !quizEnded && (
        <div className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center p-8 shadow-elegant">
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
        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="text-center p-8 shadow-elegant">
              <CardContent className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-lg">Laddar frågor, vänligen vänta...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quiz Screen */}
      {started && !quizEnded && currentQuestion && (
        <div className="flex-1 flex flex-col">
          {/* Compact Progress Header */}
          <div className="bg-card border-b p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold">Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex gap-4">
                <span>You: {score}</span>
                <span>AI: {aiScore}</span>
              </div>
            </div>
          </div>

          {/* Main Quiz Content - Single Screen Layout with Card Border */}
          <div className="flex-1 p-4">
            <Card className="h-full shadow-elegant">
              <div className="h-full flex">
                {/* Left Side - Video */}
                <div className="w-1/2 p-6 flex flex-col border-r">
                  <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                  
                  {currentQuestion.videoUrl && (
                    <div className="flex-1 flex items-center justify-center">
                      <video 
                        key={currentIndex} 
                        controls 
                        className="w-full h-full max-h-96 rounded-lg shadow-md object-contain"
                        autoPlay
                      >
                        <source src={currentQuestion.videoUrl} type="video/mp4" />
                        Din webbläsare stödjer inte video.
                      </video>
                    </div>
                  )}
                </div>

                {/* Right Side - Answers and Controls */}
                <div className="w-1/2 p-6 flex flex-col justify-center">
                  <div className="space-y-4 max-w-md mx-auto">
                    {/* Answer Buttons */}
                    {currentQuestion.answers.map((answer, index) => (
                      <Button
                        key={index}
                        onClick={() => selectAnswer(answer)}
                        disabled={answerSelected}
                        variant={answerSelected && answer === currentQuestion.correct ? "default" : "outline"}
                        className={`w-full justify-start text-left p-6 h-auto text-lg ${
                          answerSelected && answer === currentQuestion.correct
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : answerSelected && answer !== currentQuestion.correct
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-accent"
                        }`}
                      >
                        {answer}
                      </Button>
                    ))}

                    {/* Feedback */}
                    {feedbackMessage && (
                      <div className={`p-4 rounded-lg border-l-4 text-center ${
                        feedbackMessage.includes('Rätt') 
                          ? 'bg-green-50 border-green-500 text-green-800' 
                          : 'bg-red-50 border-red-500 text-red-800'
                      }`}>
                        <p className="font-medium text-lg">{feedbackMessage}</p>
                      </div>
                    )}

                    {/* Next Button */}
                    {showNextButton && (
                      <Button 
                        onClick={nextQuestion}
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-4"
                      >
                        {currentIndex + 1 >= questions.length ? "View Results" : "Next question"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {quizEnded && (
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6">
              <Card className="text-center p-8 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold mb-4">The quiz is ready!</CardTitle>
                  <p className="text-xl">You got {score} of {questions.length} right!</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Score Comparison */}
                  <Card className="p-6 bg-accent/10">
                    <CardHeader>
                      <CardTitle className="text-2xl">Score Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center gap-8 text-lg">
                        <div>
                          <span className="font-medium">You: </span>
                          <span className="font-bold text-2xl">{score}</span>
                        </div>
                        <div>
                          <span className="font-medium">🤖 AI: </span>
                          <span className="font-bold text-2xl">{aiScore}</span>
                        </div>
                      </div>
                      
                      {score > aiScore && (
                        <p className="text-green-600 font-semibold text-lg">
                          Congratulations! You beat the AI! 🏆
                        </p>
                      )}
                      {score < aiScore && (
                        <p className="text-red-600 font-semibold text-lg">
                          The AI won this time...🤖🏆
                        </p>
                      )}
                      {score === aiScore && (
                        <p className="text-yellow-600 font-semibold text-lg">
                          Draw! Good job!😄
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Incorrect Answers */}
                  {incorrectAnswers.length > 0 && (
                    <Card className="text-left">
                      <CardHeader>
                        <CardTitle>Incorrect answers:</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {incorrectAnswers.map((item, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                              <p><span className="font-semibold">Question:</span> {item.question}</p>
                              <p><span className="font-semibold text-red-600">Your answer:</span> {item.selected}</p>
                              <p><span className="font-semibold text-green-600">Correct answer:</span> {item.correct}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Previous Results */}
                  {previousResults.length > 0 && (
                    <Card className="text-left">
                      <CardHeader>
                        <CardTitle>Your previous results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {previousResults.map((result, i) => (
                            <div key={i} className="p-3 border rounded">
                              {result.timestamp} – {result.score}/{result.total}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      onClick={restartQuiz}
                      size="lg"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      Play again!
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Footer - appears on all screens */}
      <footer className="bg-muted border-t py-3 px-4">
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
