"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [ageGroup, setAgeGroup] = useState(null);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Timers and game stats
  const [gameStats, setGameStats] = useState({
    clickGame: { score: 0, time: 0 },
    memoryGame: { score: 0, time: 0 },
    colorGame: { score: 0, time: 0 },
    reactionGame: { score: 0, time: 0 }
  });
  const [questionTimes, setQuestionTimes] = useState([]);
  const questionStartTime = useRef(null);
  
  // Game states
  const [clickCounter, setClickCounter] = useState(0);
  const [clickStartTime, setClickStartTime] = useState(null);
  const [memorySequence, setMemorySequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [memoryStage, setMemoryStage] = useState("waiting");
  const [colorTarget, setColorTarget] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [waitingForReaction, setWaitingForReaction] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(null);
  const [reactionMessage, setReactionMessage] = useState("Get ready...");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Start timer when showing a new question
  useEffect(() => {
    if (ageGroup && gamesCompleted >= 4 && !quizFinished) {
      questionStartTime.current = Date.now();
    }
  }, [currentQuestion, ageGroup, gamesCompleted, quizFinished]);

  // Age-based Questions
  const questions = {
    "5-10": [
      { question: "Which is the largest planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], scores: [1, 2, 3, 1] },
      { question: "What comes after 29?", options: ["30", "31", "29", "32"], scores: [3, 1, 0, 2] },
      { question: "Which shape has 4 equal sides?", options: ["Rectangle", "Square", "Triangle", "Circle"], scores: [1, 3, 0, 0] },
      { question: "Solve: 5 + 3 =", options: ["6", "8", "10", "7"], scores: [1, 3, 0, 2] },
      { question: "What is 2 × 3?", options: ["5", "6", "4", "7"], scores: [0, 3, 1, 2] },
    ],
    "10-15": [
      { question: "What is the square root of 144?", options: ["12", "14", "16", "10"], scores: [3, 1, 0, 2] },
      { question: "Which element is needed for breathing?", options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon"], scores: [3, 1, 2, 0] },
      { question: "Solve: 15 × 4", options: ["45", "50", "60", "55"], scores: [1, 2, 3, 0] },
      { question: "Which is faster?", options: ["Sound", "Light", "Water Waves", "Wind"], scores: [1, 3, 2, 0] },
      { question: "What is the capital of France?", options: ["Rome", "Paris", "London", "Berlin"], scores: [1, 3, 0, 2] },
    ],
    "15-20": [
      { question: "Solve: 2x + 3 = 11, find x", options: ["4", "3", "5", "6"], scores: [3, 1, 0, 2] },
      { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Processing Unit", "Control Power Unit", "Central Program Unit"], scores: [3, 1, 0, 2] },
      { question: "Solve: 100 ÷ 5", options: ["25", "20", "15", "10"], scores: [1, 3, 0, 2] },
      { question: "Which is the strongest material?", options: ["Gold", "Iron", "Diamond", "Plastic"], scores: [1, 0, 3, 2] },
      { question: "Which programming language is mainly used for AI?", options: ["Java", "C++", "Python", "HTML"], scores: [1, 2, 3, 0] },
    ],
  };

  // Handle Answer Selection
  const handleAnswer = (index) => {
    // Record time taken for this question
    const timeTaken = (Date.now() - questionStartTime.current) / 1000;
    setQuestionTimes(prev => [...prev, timeTaken]);
    
    // Update score
    setScore(score + questions[ageGroup][currentQuestion].scores[index]);
    
    // Move to next question or finish quiz
    if (currentQuestion + 1 < questions[ageGroup].length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Get Aptitude Result
  const getResult = () => {
    if (score >= 12) return "You have a strong analytical mind! You might enjoy Science or Engineering.";
    if (score >= 8) return "You have great creativity! You might enjoy Art or Design.";
    if (score >= 4) return "You are active and energetic! Maybe Sports or Outdoor Careers suit you.";
    return "You have a mixed skill set! Explore different fields to find your passion.";
  };

  // Get average question time
  const getAverageTime = () => {
    if (questionTimes.length === 0) return 0;
    const sum = questionTimes.reduce((a, b) => a + b, 0);
    return (sum / questionTimes.length).toFixed(1);
  };

  // Game 1: Click Speed Test
  const handleClickGame = () => {
    if (clickCounter === 0) {
      setClickStartTime(Date.now());
    }
    
    if (clickCounter < 5) {
      setClickCounter(clickCounter + 1);
    }
    
    if (clickCounter === 4) {
      const endTime = Date.now();
      const timeTaken = (endTime - clickStartTime) / 1000;
      const clickScore = Math.max(0, Math.floor(10 - timeTaken));
      
      setGameStats(prev => ({
        ...prev,
        clickGame: { score: clickScore, time: timeTaken }
      }));
      
      setGamesCompleted(gamesCompleted + 1);
      setClickCounter(0);
    }
  };

  // Game 2: Memory Game
  const startMemoryGame = () => {
    // Generate random sequence
    const newSequence = Array.from({length: 4}, () => Math.floor(Math.random() * 4));
    setMemorySequence(newSequence);
    setMemoryStage("showing");
    setUserSequence([]);
    
    // Show sequence then wait for user input
    let currentIndex = 0;
    const showInterval = setInterval(() => {
      if (currentIndex >= newSequence.length) {
        clearInterval(showInterval);
        setMemoryStage("inputting");
        return;
      }
      // Update active button for display
      setUserSequence([newSequence[currentIndex]]);
      currentIndex++;
      
      // Clear active button after short delay
      setTimeout(() => {
        setUserSequence([]);
      }, 300);
    }, 1000);
  };

  const handleMemoryInput = (buttonIndex) => {
    if (memoryStage !== "inputting") return;
    
    const newUserSequence = [...userSequence, buttonIndex];
    setUserSequence(newUserSequence);
    
    // Check if user sequence matches so far
    for (let i = 0; i < newUserSequence.length; i++) {
      if (newUserSequence[i] !== memorySequence[i]) {
        // Wrong sequence
        setMemoryStage("failed");
        setGameStats(prev => ({
          ...prev,
          memoryGame: { score: Math.max(0, newUserSequence.length - 1), time: 0 }
        }));
        setGamesCompleted(gamesCompleted + 1);
        return;
      }
    }
    
    // If completed full sequence correctly
    if (newUserSequence.length === memorySequence.length) {
      setMemoryStage("success");
      setGameStats(prev => ({
        ...prev,
        memoryGame: { score: 10, time: 0 }
      }));
      setGamesCompleted(gamesCompleted + 1);
    }
  };

  // Game 3: Color Matching Game
  const startColorGame = () => {
    const colors = ["red", "blue", "green", "yellow", "purple"];
    const shuffled = [...colors].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const options = shuffled.slice(0, 3);
    
    setColorTarget(target);
    setColorOptions(options);
  };

  const handleColorSelection = (selected) => {
    const correct = selected === colorTarget;
    const colorScore = correct ? 10 : 0;
    
    setGameStats(prev => ({
      ...prev,
      colorGame: { score: colorScore, time: 0 }
    }));
    
    setGamesCompleted(gamesCompleted + 1);
    setColorTarget(null);
  };

  // Game 4: Reaction Time Game
  const startReactionGame = () => {
    setReactionMessage("Get ready...");
    setWaitingForReaction(true);
    
    // Random delay between 1-5 seconds
    const delay = 1000 + Math.random() * 4000;
    
    setTimeout(() => {
      setReactionMessage("CLICK NOW!");
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (!waitingForReaction) return;
    
    if (!reactionStartTime) {
      // Clicked too early
      setReactionMessage("Too early! Try again");
      setTimeout(() => {
        startReactionGame();
      }, 1500);
      return;
    }
    
    // Calculate reaction time
    const reactionTime = (Date.now() - reactionStartTime) / 1000;
    const reactionScore = Math.max(0, Math.floor(10 - reactionTime * 10));
    
    setGameStats(prev => ({
      ...prev,
      reactionGame: { score: reactionScore, time: reactionTime }
    }));
    
    setWaitingForReaction(false);
    setReactionStartTime(null);
    setGamesCompleted(gamesCompleted + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-700 transition duration-300">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Child Aptitude Test
        </h1>

        {/* Step 1: Age Selection */}
        {!ageGroup && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Select Your Age Group:
            </h2>
            {Object.keys(questions).map((age) => (
              <button 
                key={age} 
                className="w-full bg-indigo-500 text-white px-6 py-3 rounded-lg mb-3 hover:bg-indigo-700 transition"
                onClick={() => setAgeGroup(age)}
              >
                {age} years
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Games Section */}
        {ageGroup && gamesCompleted === 0 && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Game 1: Click Speed Test
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click the button 5 times as fast as you can!
            </p>
            <div className="flex justify-center items-center mb-3">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {clickCounter}/5
              </span>
            </div>
            <button 
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
              onClick={handleClickGame}
            >
              {clickCounter === 0 ? "Start Game" : "Click Me!"}
            </button>
          </div>
        )}

        {/* Game 2: Memory Game */}
        {ageGroup && gamesCompleted === 1 && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Game 2: Memory Game
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Remember the sequence of buttons and repeat it!
            </p>
            
            {memoryStage === "waiting" && (
              <button 
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                onClick={startMemoryGame}
              >
                Start Memory Game
              </button>
            )}
            
            {memoryStage !== "waiting" && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      className={`h-20 rounded-lg ${
                        userSequence.includes(index) 
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-200 dark:bg-gray-600"
                      } ${memoryStage === "inputting" ? "hover:bg-indigo-500 cursor-pointer" : ""}`}
                      onClick={() => handleMemoryInput(index)}
                      disabled={memoryStage !== "inputting"}
                    />
                  ))}
                </div>
                
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  {memoryStage === "showing" && "Watch the pattern..."}
                  {memoryStage === "inputting" && "Now repeat the pattern!"}
                  {memoryStage === "success" && "Great job! You remembered correctly."}
                  {memoryStage === "failed" && "Not quite right. Let's move on to the next game."}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Game 3: Color Matching */}
        {ageGroup && gamesCompleted === 2 && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Game 3: Color Matching
            </h2>
            
            {!colorTarget ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Select the matching color as quickly as you can.
                </p>
                <button 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                  onClick={startColorGame}
                >
                  Start Color Game
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                  Click on the <span className="font-bold" 
                  style={{color: colorTarget}}>{colorTarget}</span> color:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      className="h-20 rounded-lg"
                      style={{backgroundColor: color}}
                      onClick={() => handleColorSelection(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Game 4: Reaction Time */}
        {ageGroup && gamesCompleted === 3 && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Game 4: Reaction Time
            </h2>
            
            {!waitingForReaction && gamesCompleted === 3 ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Test your reaction speed. Click when the text changes to "CLICK NOW!"
                </p>
                <button 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                  onClick={startReactionGame}
                >
                  Start Reaction Test
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className={`w-full h-32 rounded-lg ${
                    reactionStartTime ? "bg-green-500" : "bg-red-500"
                  } text-white text-xl font-bold`}
                  onClick={handleReactionClick}
                >
                  {reactionMessage}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Quiz */}
        {ageGroup && gamesCompleted >= 4 && !quizFinished && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {questions[ageGroup][currentQuestion].question}
            </h2>
            <div className="grid gap-4">
              {questions[ageGroup][currentQuestion].options.map((option, index) => (
                <button 
                  key={index} 
                  className="w-full bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-4 text-right text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} of {questions[ageGroup].length}
            </div>
          </div>
        )}

        {/* Step 4: Show Result */}
        {quizFinished && (
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🎉 Your Result:</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{getResult()}</p>
            
            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Show Details
              </button>
            ) : (
              <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Quiz Performance</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-1">Quiz Score: {score} points</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Average Time per Question: {getAverageTime()} seconds</p>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Game Performance</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    Click Speed: {gameStats.clickGame.score}/10 points 
                    ({gameStats.clickGame.time.toFixed(1)}s)
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Memory Game: {gameStats.memoryGame.score}/10 points
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Color Matching: {gameStats.colorGame.score}/10 points
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Reaction Time: {gameStats.reactionGame.score}/10 points
                    {gameStats.reactionGame.time > 0 && ` (${gameStats.reactionGame.time.toFixed(3)}s)`}
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Question Times</h3>
                <div className="grid grid-cols-3 gap-2">
                  {questionTimes.map((time, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-600 p-2 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Q{index + 1}: {time.toFixed(1)}s
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}