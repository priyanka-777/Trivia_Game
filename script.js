
document.addEventListener('DOMContentLoaded', function() {
    // Handle 'start-btn' click event on index.html
    var startBtn = document.getElementById('start-btn');
    var endBtn = document.getElementById('end');
    var playagainBtn = document.getElementById('playagain');

    if (endBtn) {
        endBtn.style.display = 'none'; // Hide End button initially
    }
    if (playagainBtn) {
        playagainBtn.style.display = 'none'; // Hide Play Again button initially
    }


    if (startBtn) {
        startBtn.addEventListener('click', function() {
            var player1Name = document.getElementById('name1').value;
            var player2Name = document.getElementById('name2').value;
            //check if two players are entered names 
            if (player1Name && player2Name) {
                localStorage.setItem('player1', player1Name);
                localStorage.setItem('player2', player2Name);
                localStorage.setItem('selectedCategories', JSON.stringify([]));
                localStorage.setItem('player1Score', '0');
                localStorage.setItem('player2Score', '0');
                window.location.href = 'category.html';
            } else {
                alert('Please enter both names');
            }
        });
    }
    if (document.getElementById('categories')) {
        fetchcategories();
    }

    // To handle 'category' submission on category.html
    var categoryForm = document.getElementById('category');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const selectedCategory = document.getElementById('categories').value;
            let selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || [];
            selectedCategories.push(selectedCategory); 
            localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));

            window.location.href = 'questions.html';
        });
    }

     // for fetching the questions from api
     fetchQuestions();
    
    var answerButtons = document.querySelectorAll('.btn');
    var nextButton = document.getElementById('next-btn');
    var currentQuestionIndex = 0;
    var questions = [];
    var currentPlayer = 1;
    var player1Name = localStorage.getItem('player1');
    var player2Name = localStorage.getItem('player2');
    var player1ScoreElement = document.getElementById('player1Score');
    var player2ScoreElement = document.getElementById('player2Score');

    if (player1ScoreElement && player2ScoreElement) {
        var player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
        var player2Score = parseInt(localStorage.getItem('player2Score')) || 0;

        player1ScoreElement.textContent = `${player1Name || 'Player 1'}: ${player1Score}`;
        player2ScoreElement.textContent = `${player2Name || 'Player 2'}: ${player2Score}`;
    }

    // for feteching the questions from API
    function fetchQuestions() {
        var selectedCategory = localStorage.getItem('selectedCategory');
        fetch(`https://the-trivia-api.com/v2/questions?categories=${selectedCategory}&limit=6&difficulties=easy,medium,hard`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                questions = data;
                displayQuestion();
            })
            .catch(function(error) {
                console.error('Error in fetching questions:', error);
            });
    }
    // for updating the player turn
    function updateCurrentPlayerName() {
        var currentPlayerName = currentPlayer === 1 ? player1Name : player2Name;
        document.getElementById('current-player').textContent = `${currentPlayerName}'s Turn`;
    }
    // for displaying the next question
    function displayQuestion() {
        updateCurrentPlayerName();
        if (currentQuestionIndex >= questions.length) {
            // All questions completed
            displayScores();
            return;
        }

        var currentQuestion = questions[currentQuestionIndex];
        document.getElementById('question').textContent= currentQuestion.question.text;
        
        if (endBtn) {
            endBtn.style.display = 'none';
        }
        if (playagainBtn) {
            playagainBtn.style.display = 'none';
        }
        var incorrectAnswers = currentQuestion.incorrectAnswers || [];
        var correctAnswer = currentQuestion.correctAnswer || '';

        var answers = incorrectAnswers.concat(correctAnswer).sort(function() {
            return Math.random() - 0.5;
        });

        answerButtons.forEach(function(button, index) {
            button.textContent = answers[index];
            button.style.display = 'block';
            button.onclick = function() {
                selectAnswer(button, correctAnswer);
            };
        });
    }
    // checking for the selected answer
    function selectAnswer(button, answer) {
        var answerDisplay = document.getElementById('answer');
        if (button.textContent === answer) {
            answerDisplay.textContent = "Correct !";
            if (currentPlayer === 1) {
                var player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
                if (currentQuestionIndex < 2) {
                    player1Score += 10;
                } else if (currentQuestionIndex < 4) {
                    player1Score += 15;
                } else {
                    player1Score += 20;
                }
                localStorage.setItem('player1Score', player1Score);
            } else {
                var player2Score = parseInt(localStorage.getItem('player2Score')) || 0;
                if (currentQuestionIndex < 2) {
                    player2Score += 10;
                } else if (currentQuestionIndex < 4) {
                    player2Score += 15;
                } else {
                    player2Score += 20;
                }
                localStorage.setItem('player2Score', player2Score);
            }
            updateScores();
        } else {
            
            answerDisplay.textContent = "Incorrect !";
        }
        answerButtons.forEach(function(btn) {
            btn.disabled = true;
        });
        document.getElementById('answer').style.display='block';
        nextButton.style.display = 'block';
    }
    // for updating the scores on display
    function updateScores() {
        var player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
        var player2Score = parseInt(localStorage.getItem('player2Score')) || 0;

        player1ScoreElement.textContent = `${player1Name}: ${player1Score}`;
        player2ScoreElement.textContent = `${player2Name}: ${player2Score}`;
    }
        // Move to the next question
        nextButton.addEventListener('click', function() {
            currentQuestionIndex++;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            answerButtons.forEach(function(button) {
                button.disabled = false;
            });
            document.getElementById('answer').style.display='none';
            nextButton.style.display = 'none';
            displayQuestion();
        });
        function displayScores() {
            document.getElementById('question').textContent = 'Trivia Game completed ! Final Scores are:';
            answerButtons.forEach(function(button) {
                button.style.display = 'none';
            });
            document.getElementById('current-player').style.display='none';
            document.getElementById('answer').style.display='none';
            nextButton.style.display = 'none';
            if (endBtn) {
                endBtn.style.display = 'block';
            }
            if (playagainBtn) {
                playagainBtn.style.display = 'block';
            }
            
        }
        // for ending the game
        var endBtn = document.getElementById('end');
        if (endBtn) {
            endBtn.addEventListener('click',endGame);
        }
        //for playing again the game
        var playagainBtn= document.getElementById('playagain');
        if (playagainBtn) {
            playagainBtn.addEventListener('click', function() {
                fetch('https://the-trivia-api.com/v2/categories')
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    var selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || [];
                    var availableCategories = 0;
    
                    for (var category in data) {
                        if (!selectedCategories.includes(category)) {
                            availableCategories++;
                        }
                    }
    
                    if (availableCategories === 0) {
                        endGame();
                    } else {
                    // Redirect to category.html to select new categories
                    window.location.href = 'category.html';
                }
            });
    

            });
        }
        // for end the game and display the winner
        function endGame() {
            var message;
            var player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
            var player2Score = parseInt(localStorage.getItem('player2Score')) || 0;
        
            if (player1Score === 0 && player2Score === 0) {
                message = "You both have to improve your performance.";
            } else if (player1Score === player2Score) {
                message = "It is a tie.";
            } else {
                message = `Game Over! ${player1Score > player2Score ? player1Name : player2Name} wins the game!`;
            }
        
            document.getElementById('message').textContent = message;
            document.getElementById('question').textContent = 'Trivia Game completed! Final Scores are:';
            document.getElementById('end').style.display = 'none';
            document.getElementById('playagain').textContent = 'Thank you !';
            // clear the scores for new game
            localStorage.removeItem('player1Score');
            localStorage.removeItem('player2Score');
            // Clear the selection for the new game
            localStorage.setItem('selectedCategories', JSON.stringify([]));
        }
        
       

        // Fetch categories on category.html
        function fetchcategories() {
            fetch('https://the-trivia-api.com/v2/categories')
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(function(data) {
                    var categoryDropdown = document.getElementById('categories');
                    
                    categoryDropdown.innerHTML = '';
                    var selectedCategories = JSON.parse(localStorage.getItem('selectedCategories')) || [];
                    var availableCategories = 0;
        
                    for (var category in data) {
                        if (!selectedCategories.includes(category)) {
                        var option = document.createElement('option');
                        option.value = category;
                        option.text = data[category];
                        categoryDropdown.add(option);
                        availableCategories++;
                        }
                    }
                    if (availableCategories === 0) {
                        console.log("no categories");
                        endGame();
                    }
                })
                .catch(function(error) {
                    console.error('Error fetching categories:', error);
                });
        }

});
