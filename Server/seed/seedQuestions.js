const Question = require("../models/Question");

const seedQuestions = async () => {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      console.log("Questions already exist. Skipping seeding.");
      return;
    }

    const questions = [
      // BBA Questions (Updated as per provided document)
      {
        question: "The children _____ playing in the park.",
        options: ["is", "are", "was", "be"],
        correctAnswer: "are",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Pick the correct sentence:",
        options: [
          "He don’t like coffee.",
          "He doesn’t likes coffee.",
          "He doesn’t like coffee.",
          "He isn’t like coffee."
        ],
        correctAnswer: "He doesn’t like coffee.",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the antonym of “Lazy”:",
        options: ["Active", "Slow", "Dull", "Tired"],
        correctAnswer: "Active",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Fill in the blank: “They arrived _____ the airport in time.”",
        options: ["in", "at", "to", "on"],
        correctAnswer: "at",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Which of the following is a proper noun?",
        options: ["river", "book", "Kathmandu", "house"],
        correctAnswer: "Kathmandu",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Select the correct spelling:",
        options: ["Occured", "Occurred", "Ocurred", "Occurud"],
        correctAnswer: "Occurred",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the synonym of “Famous”:",
        options: ["Popular", "Regular", "Noisy", "Tough"],
        correctAnswer: "Popular",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Fill in the blank: “She hasn’t called me _____ Monday.”",
        options: ["from", "since", "on", "for"],
        correctAnswer: "since",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the passive voice: “They cleaned the room.”",
        options: [
          "The room was cleaned by them.",
          "The room is clean.",
          "The room cleans itself.",
          "They are cleaning the room."
        ],
        correctAnswer: "The room was cleaned by them.",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "What part of speech is the word “honestly”?",
        options: ["Noun", "Verb", "Adverb", "Adjective"],
        correctAnswer: "Adverb",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the synonym of “Happy”:",
        options: ["Sad", "Joyful", "Angry", "Cry"],
        correctAnswer: "Joyful",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Select the correctly punctuated sentence:",
        options: [
          "Do you like chocolate",
          "Do you like chocolate!",
          "Do you like chocolate.",
          "Do you like chocolate?"
        ],
        correctAnswer: "Do you like chocolate?",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Identify the adverb: “He speaks politely.”",
        options: ["He", "speaks", "politely", "none"],
        correctAnswer: "politely",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Fill in the blank: “The boy _____ playing with his toys.”",
        options: ["are", "is", "am", "be"],
        correctAnswer: "is",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Find the antonym of “Victory”:",
        options: ["Success", "Triumph", "Win", "Defeat"],
        correctAnswer: "Defeat",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the correct preposition: “The cat jumped _____ the table.”",
        options: ["on", "in", "at", "from"],
        correctAnswer: "on",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Which sentence is correct?",
        options: [
          "They has a new car.",
          "They have a new car.",
          "They having a new car.",
          "They is a new car."
        ],
        correctAnswer: "They have a new car.",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Identify the noun: “Honesty is the best policy.”",
        options: ["Honesty", "is", "the", "best"],
        correctAnswer: "Honesty",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Select the synonym for “Difficult”:",
        options: ["Easy", "Simple", "Hard", "Quick"],
        correctAnswer: "Hard",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Fill in the blank: “She _____ watching a movie now.”",
        options: ["is", "are", "am", "be"],
        correctAnswer: "is",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Choose the correct spelling:",
        options: ["Inteligent", "Intelligant", "Intelligent", "Intelliegent"],
        correctAnswer: "Intelligent",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "What part of speech is “quick” in the sentence: “She is a quick learner”?",
        options: ["Verb", "Noun", "Adjective", "Adverb"],
        correctAnswer: "Adjective",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Select the antonym of “Strong”:",
        options: ["Tough", "Weak", "Firm", "Solid"],
        correctAnswer: "Weak",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Fill in the blank: “I have lived here _____ five years.”",
        options: ["since", "from", "for", "on"],
        correctAnswer: "for",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "Which is the passive form of “She writes poems.”?",
        options: [
          "Poems wrote by her.",
          "Poems are written by her.",
          "Poems were written by her.",
          "Poems is written by her."
        ],
        correctAnswer: "Poems are written by her.",
        category: "Verbal Ability",
        program: "BBA"
      },
      {
        question: "What is the remainder when 257 is divided by 9?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "5",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "The sum of first 50 natural numbers is:",
        options: ["1225", "1250", "1275", "1300"],
        correctAnswer: "1275",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "A train travels 180 km in 3 hours. Its average speed in m/s is:",
        options: ["15", "16.67", "17", "18"],
        correctAnswer: "16.67",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Which of the following numbers is divisible by 11?",
        options: ["21451", "23562", "45322", "143"],
        correctAnswer: "23562",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If 3x + 5 = 17, then 5x – 2 is:",
        options: ["12", "13", "18", "15"],
        correctAnswer: "18",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "The least number which when divided by 12, 18, and 30 leaves a remainder 3 is:",
        options: ["183", "363", "543", "3630"],
        correctAnswer: "183",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "A shopkeeper marks goods at 40% above cost price and offers a discount of 10%. The profit % is:",
        options: ["26%", "27%", "28%", "30%"],
        correctAnswer: "26%",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "The sum of three consecutive odd numbers is 87. The largest number is:",
        options: ["27", "29", "31", "33"],
        correctAnswer: "31",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If x = 3 and y = 4, find (x + y)² – (x – y)².",
        options: ["12", "20", "48", "28"],
        correctAnswer: "48",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "The average of 7, 12, 18, and x is 15. Find x.",
        options: ["21", "22", "23", "24"],
        correctAnswer: "23",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "The ratio of two numbers is 4:5. If their sum is 72, the larger number is:",
        options: ["36", "40", "45", "50"],
        correctAnswer: "40",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "A sum of Rs. 6000 amounts to Rs. 7200 in 2 years at simple interest. The rate is:",
        options: ["8%", "9%", "10%", "12%"],
        correctAnswer: "10%",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "A can complete a work in 12 days and B in 18 days. Together, they complete it in:",
        options: ["7.2 days", "7.5 days", "8 days", "8.5 days"],
        correctAnswer: "7.2 days",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "√81 + √0.81 equals:",
        options: ["9.9", "9.81", "9.5", "10"],
        correctAnswer: "9.9",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If SP is twice the CP, profit % is:",
        options: ["50%", "75%", "80%", "100%"],
        correctAnswer: "100%",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Mean of first 10 odd natural numbers:",
        options: ["9", "10", "11", "12"],
        correctAnswer: "10",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "A man spends 2/5 of income on rent, 30% on food, saves Rs. 6000. Total income:",
        options: ["15,000", "16,000", "18,000", "20,000"],
        correctAnswer: "20,000",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Unit digit of 7¹⁷³ is:",
        options: ["1", "3", "7", "9"],
        correctAnswer: "7",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Mixture of milk and water is 5:1. Adding 6 L water to 30 L mixture gives ratio:",
        options: ["5:2", "5:3", "3:1", "2:1"],
        correctAnswer: "5:2",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If 1/x + 1/y = 1/6 and x = 12, y =:",
        options: ["8", "10", "12", "15"],
        correctAnswer: "12",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If x² – 7x + 10 = 0, sum of roots:",
        options: ["7", "10", "–7", "–10"],
        correctAnswer: "7",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Solve: (x – 3)/4 = (5 – x)/6",
        options: ["3.8", "4.8", "5", "6"],
        correctAnswer: "3.8",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "If log₁₀2 = 0.3010, log₁₀80 = ?",
        options: ["1.903", "1.902", "1.905", "1.901"],
        correctAnswer: "1.903",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "SI on Rs. 12000 at 6% for 9 months:",
        options: ["540", "560", "5400", "600"],
        correctAnswer: "540",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "x varies inversely with y. x = 8 when y = 5. Find y when x = 10.",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        category: "Quantitative Aptitude",
        program: "BBA"
      },
      {
        question: "Find the missing term: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "46"],
        correctAnswer: "42",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "In a certain code, CAT = 24 and DOG = 26. What will BAT be?",
        options: ["21", "22", "23", "24"],
        correctAnswer: "23",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which of the following is different from the rest?",
        options: ["Square", "Triangle", "Rectangle", "Circle"],
        correctAnswer: "Circle",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "If A = 1, B = 2, …, Z = 26, then the value of the word “MATH” is:",
        options: ["51", "52", "53", "54"],
        correctAnswer: "52",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Ramesh walks 3 km north, then 4 km east. How far is he from the starting point?",
        options: ["5 km", "6 km", "7 km", "4 km"],
        correctAnswer: "5 km",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Arrange the words in dictionary order: Mango, Man, Manner, Many",
        options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "3, 2, 4, 1"],
        correctAnswer: "2, 1, 3, 4",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Syllogism: All roses are flowers. Some flowers are red. Conclusion: I. Some roses are red. II. All flowers are roses.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correctAnswer: "Neither follows",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which number should replace the question mark? 8, 16, 32, 64, ?",
        options: ["96", "108", "128", "256"],
        correctAnswer: "128",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "A man is facing south. He turns 90° clockwise, then 180° anticlockwise. Which direction is he facing now?",
        options: ["North", "South", "West", "East"],
        correctAnswer: "East",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Odd one out:",
        options: ["64", "27", "125", "82"],
        correctAnswer: "82",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which pair is related in the same way as: Book : Read :: Pen : ?",
        options: ["Write", "Ink", "Paper", "Draw"],
        correctAnswer: "Write",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "If ‘+’ means ‘×’, ‘–’ means ‘÷’, ‘×’ means ‘+’, and ‘÷’ means ‘–’, then 8 + 2 – 4 × 3 ÷ 5 = ?",
        options: ["15", "17", "19", "21"],
        correctAnswer: "19",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "In a certain code language, 'COLD' is written as 'DPME'. How is 'WARM' written in that code?",
        options: ["XBSN", "XARN", "XBQN", "XASM"],
        correctAnswer: "XBSN",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Choose the correct mirror image of “PQE4”",
        options: ["EP4Q", "4EQP", "EQ4P", "Q4EP"],
        correctAnswer: "4EQP",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Complete the series: A, D, I, P, ?",
        options: ["U", "Y", "W", "X"],
        correctAnswer: "Y",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which number is wrong in the sequence? 7, 14, 28, 56, 126, 224",
        options: ["14", "28", "126", "224"],
        correctAnswer: "126",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Rahul’s mother is the sister of Sunita’s father. Sunita’s father is the husband of Meena. How is Meena related to Rahul?",
        options: ["Aunt", "Mother", "Sister", "Cousin"],
        correctAnswer: "Aunt",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Identify the missing figure in the pattern: (figure-based)",
        options: ["1", "2", "3", "4"],
        correctAnswer: "1",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Statement: All pens are pencils. All pencils are erasers. Conclusion: I. All pens are erasers. II. All erasers are pens.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correctAnswer: "Only I follows",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "What comes next? 2, 3, 5, 9, 17, ?",
        options: ["25", "33", "31", "29"],
        correctAnswer: "31",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which word does not belong with the others?",
        options: ["Apple", "Banana", "Grape", "Carrot"],
        correctAnswer: "Carrot",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Find the odd one out:",
        options: ["Dog", "Cat", "Rabbit", "Elephant"],
        correctAnswer: "Elephant",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which number should come next in the series? 2, 4, 8, 16, ___",
        options: ["20", "32", "64", "128"],
        correctAnswer: "32",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Which letter is as far from D as Q is from J?",
        options: ["L", "M", "N", "O"],
        correctAnswer: "N",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "If A is the sister of B, B is the brother of C, and C is the son of D, how is D related to A?",
        options: ["Mother", "Father", "Grandmother", "Grandfather"],
        correctAnswer: "Father",
        category: "Logical Reasoning",
        program: "BBA"
      },
      {
        question: "Who is known as the 'Father of Computer'?",
        options: ["Charles Babbage", "Alan Turing", "John von Neumann", "Bill Gates"],
        correctAnswer: "Charles Babbage",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Mount Everest lies in which district of Nepal?",
        options: ["Solukhumbu", "Dolakha", "Taplejung", "Sankhuwasabha"],
        correctAnswer: "Solukhumbu",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which planet is known as the “Red Planet”?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Who invented the telephone?",
        options: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Michael Faraday"],
        correctAnswer: "Alexander Graham Bell",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which is the largest organ in the human body?",
        options: ["Heart", "Skin", "Liver", "Lungs"],
        correctAnswer: "Skin",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctAnswer: "Nile",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Who is known as the 'Light of Asia'?",
        options: ["Mahatma Gandhi", "Gautam Buddha", "Confucius", "Dalai Lama"],
        correctAnswer: "Gautam Buddha",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which one is the smallest continent?",
        options: ["Europe", "Africa", "Australia", "Antarctica"],
        correctAnswer: "Australia",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "“Silicon Valley” in the USA is famous for:",
        options: ["Gold mining", "Information Technology", "Agriculture", "Automobiles"],
        correctAnswer: "Information Technology",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Lionel Messi plays for which country’s national team?",
        options: ["Spain", "Argentina", "Brazil", "Portugal"],
        correctAnswer: "Argentina",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "The 2022 FIFA World Cup was hosted by:",
        options: ["Russia", "Brazil", "Qatar", "Germany"],
        correctAnswer: "Qatar",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "In networking, IP stands for:",
        options: ["Internet Process", "Internal Protocol", "Internet Protocol", "Integrated Program"],
        correctAnswer: "Internet Protocol",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which of the following is NOT a programming language?",
        options: ["Python", "Java", "HTML", "C++"],
        correctAnswer: "HTML",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which of the following is NOT an operating system?",
        options: ["Android", "Windows", "Oracle", "Linux"],
        correctAnswer: "Oracle",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which technology is used in cryptocurrency like Bitcoin?",
        options: ["Cloud computing", "Blockchain", "Big Data", "Artificial Intelligence"],
        correctAnswer: "Blockchain",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which key is used to refresh a webpage in Windows?",
        options: ["F2", "F5", "Ctrl + R", "Both b and c"],
        correctAnswer: "Both b and c",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which is the most common data transmission medium for internet?",
        options: ["Optical fiber", "Coaxial cable", "Twisted pair", "Satellite"],
        correctAnswer: "Optical fiber",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "The term “love” is used in which sport?",
        options: ["Badminton", "Tennis", "Volleyball", "Golf"],
        correctAnswer: "Tennis",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which company developed the Android operating system?",
        options: ["Apple", "Google", "Microsoft", "Samsung"],
        correctAnswer: "Google",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which of the following is NOT an output device?",
        options: ["Monitor", "Printer", "Speaker", "Keyboard"],
        correctAnswer: "Keyboard",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which device connects different networks together?",
        options: ["Switch", "Router", "Hub", "Repeater"],
        correctAnswer: "Router",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which company is known for developing the Macintosh computer?",
        options: ["Microsoft", "IBM", "Apple Inc.", "Intel"],
        correctAnswer: "Apple Inc.",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "Which shortcut key is used to undo an action in Windows?",
        options: ["Ctrl + U", "Ctrl + X", "Ctrl + Z", "Ctrl + Y"],
        correctAnswer: "Ctrl + Z",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "The “brain” of the computer system is:",
        options: ["Hard Disk", "CPU", "GPU", "RAM"],
        correctAnswer: "CPU",
        category: "General Awareness",
        program: "BBA"
      },
      {
        question: "What is the area of Nepal?",
        options: ["147,516 KM2", "147,316 KM2", "147,416 KM2", "147,635 KM2"],
        correctAnswer: "147,516 KM2",
        category: "General Awareness",
        program: "BBA"
      },

      // BCSIT Questions (Same as provided document)
      {
        question: "The children _____ playing in the park.",
        options: ["is", "are", "was", "be"],
        correctAnswer: "are",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Pick the correct sentence:",
        options: [
          "He don’t like coffee.",
          "He doesn’t likes coffee.",
          "He doesn’t like coffee.",
          "He isn’t like coffee."
        ],
        correctAnswer: "He doesn’t like coffee.",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the antonym of “Lazy”:",
        options: ["Active", "Slow", "Dull", "Tired"],
        correctAnswer: "Active",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Fill in the blank: “They arrived _____ the airport in time.”",
        options: ["in", "at", "to", "on"],
        correctAnswer: "at",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Which of the following is a proper noun?",
        options: ["river", "book", "Kathmandu", "house"],
        correctAnswer: "Kathmandu",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Select the correct spelling:",
        options: ["Occured", "Occurred", "Ocurred", "Occurud"],
        correctAnswer: "Occurred",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the synonym of “Famous”:",
        options: ["Popular", "Regular", "Noisy", "Tough"],
        correctAnswer: "Popular",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Fill in the blank: “She hasn’t called me _____ Monday.”",
        options: ["from", "since", "on", "for"],
        correctAnswer: "since",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the passive voice: “They cleaned the room.”",
        options: [
          "The room was cleaned by them.",
          "The room is clean.",
          "The room cleans itself.",
          "They are cleaning the room."
        ],
        correctAnswer: "The room was cleaned by them.",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "What part of speech is the word “honestly”?",
        options: ["Noun", "Verb", "Adverb", "Adjective"],
        correctAnswer: "Adverb",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the synonym of “Happy”:",
        options: ["Sad", "Joyful", "Angry", "Cry"],
        correctAnswer: "Joyful",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Select the correctly punctuated sentence:",
        options: [
          "Do you like chocolate",
          "Do you like chocolate!",
          "Do you like chocolate.",
          "Do you like chocolate?"
        ],
        correctAnswer: "Do you like chocolate?",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Identify the adverb: “He speaks politely.”",
        options: ["He", "speaks", "politely", "none"],
        correctAnswer: "politely",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Fill in the blank: “The boy _____ playing with his toys.”",
        options: ["are", "is", "am", "be"],
        correctAnswer: "is",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Find the antonym of “Victory”:",
        options: ["Success", "Triumph", "Win", "Defeat"],
        correctAnswer: "Defeat",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the correct preposition: “The cat jumped _____ the table.”",
        options: ["on", "in", "at", "from"],
        correctAnswer: "on",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Which sentence is correct?",
        options: [
          "They has a new car.",
          "They have a new car.",
          "They having a new car.",
          "They is a new car."
        ],
        correctAnswer: "They have a new car.",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Identify the noun: “Honesty is the best policy.”",
        options: ["Honesty", "is", "the", "best"],
        correctAnswer: "Honesty",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Select the synonym for “Difficult”:",
        options: ["Easy", "Simple", "Hard", "Quick"],
        correctAnswer: "Hard",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Fill in the blank: “She _____ watching a movie now.”",
        options: ["is", "are", "am", "be"],
        correctAnswer: "is",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Choose the correct spelling:",
        options: ["Inteligent", "Intelligant", "Intelligent", "Intelliegent"],
        correctAnswer: "Intelligent",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "What part of speech is “quick” in the sentence: “She is a quick learner”?",
        options: ["Verb", "Noun", "Adjective", "Adverb"],
        correctAnswer: "Adjective",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Select the antonym of “Strong”:",
        options: ["Tough", "Weak", "Firm", "Solid"],
        correctAnswer: "Weak",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Fill in the blank: “I have lived here _____ five years.”",
        options: ["since", "from", "for", "on"],
        correctAnswer: "for",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "Which is the passive form of “She writes poems.”?",
        options: [
          "Poems wrote by her.",
          "Poems are written by her.",
          "Poems were written by her.",
          "Poems is written by her."
        ],
        correctAnswer: "Poems are written by her.",
        category: "Verbal Ability",
        program: "BCSIT"
      },
      {
        question: "What is the remainder when 257 is divided by 9?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "5",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "The sum of first 50 natural numbers is:",
        options: ["1225", "1250", "1275", "1300"],
        correctAnswer: "1275",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "A train travels 180 km in 3 hours. Its average speed in m/s is:",
        options: ["15", "16.67", "17", "18"],
        correctAnswer: "16.67",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Which of the following numbers is divisible by 11?",
        options: ["21451", "23562", "45322", "143"],
        correctAnswer: "23562",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If 3x + 5 = 17, then 5x – 2 is:",
        options: ["12", "13", "18", "15"],
        correctAnswer: "18",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "The least number which when divided by 12, 18, and 30 leaves a remainder 3 is:",
        options: ["183", "363", "543", "3630"],
        correctAnswer: "183",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "A shopkeeper marks goods at 40% above cost price and offers a discount of 10%. The profit % is:",
        options: ["26%", "27%", "28%", "30%"],
        correctAnswer: "26%",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "The sum of three consecutive odd numbers is 87. The largest number is:",
        options: ["27", "29", "31", "33"],
        correctAnswer: "31",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If x = 3 and y = 4, find (x + y)² – (x – y)².",
        options: ["12", "20", "48", "28"],
        correctAnswer: "48",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "The average of 7, 12, 18, and x is 15. Find x.",
        options: ["21", "22", "23", "24"],
        correctAnswer: "23",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "The ratio of two numbers is 4:5. If their sum is 72, the larger number is:",
        options: ["36", "40", "45", "50"],
        correctAnswer: "40",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "A sum of Rs. 6000 amounts to Rs. 7200 in 2 years at simple interest. The rate is:",
        options: ["8%", "9%", "10%", "12%"],
        correctAnswer: "10%",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "A can complete a work in 12 days and B in 18 days. Together, they complete it in:",
        options: ["7.2 days", "7.5 days", "8 days", "8.5 days"],
        correctAnswer: "7.2 days",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "√81 + √0.81 equals:",
        options: ["9.9", "9.81", "9.5", "10"],
        correctAnswer: "9.9",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If SP is twice the CP, profit % is:",
        options: ["50%", "75%", "80%", "100%"],
        correctAnswer: "100%",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Mean of first 10 odd natural numbers:",
        options: ["9", "10", "11", "12"],
        correctAnswer: "10",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "A man spends 2/5 of income on rent, 30% on food, saves Rs. 6000. Total income:",
        options: ["15,000", "16,000", "18,000", "20,000"],
        correctAnswer: "20,000",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Unit digit of 7¹⁷³ is:",
        options: ["1", "3", "7", "9"],
        correctAnswer: "7",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Mixture of milk and water is 5:1. Adding 6 L water to 30 L mixture gives ratio:",
        options: ["5:2", "5:3", "3:1", "2:1"],
        correctAnswer: "5:2",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If 1/x + 1/y = 1/6 and x = 12, y =:",
        options: ["8", "10", "12", "15"],
        correctAnswer: "12",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If x² – 7x + 10 = 0, sum of roots:",
        options: ["7", "10", "–7", "–10"],
        correctAnswer: "7",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Solve: (x – 3)/4 = (5 – x)/6",
        options: ["3.8", "4.8", "5", "6"],
        correctAnswer: "3.8",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "If log₁₀2 = 0.3010, log₁₀80 = ?",
        options: ["1.903", "1.902", "1.905", "1.901"],
        correctAnswer: "1.903",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "SI on Rs. 12000 at 6% for 9 months:",
        options: ["540", "560", "5400", "600"],
        correctAnswer: "540",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "x varies inversely with y. x = 8 when y = 5. Find y when x = 10.",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        category: "Quantitative Aptitude",
        program: "BCSIT"
      },
      {
        question: "Find the missing term: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "46"],
        correctAnswer: "42",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "In a certain code, CAT = 24 and DOG = 26. What will BAT be?",
        options: ["21", "22", "23", "24"],
        correctAnswer: "23",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which of the following is different from the rest?",
        options: ["Square", "Triangle", "Rectangle", "Circle"],
        correctAnswer: "Circle",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "If A = 1, B = 2, …, Z = 26, then the value of the word “MATH” is:",
        options: ["51", "52", "53", "54"],
        correctAnswer: "52",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Ramesh walks 3 km north, then 4 km east. How far is he from the starting point?",
        options: ["5 km", "6 km", "7 km", "4 km"],
        correctAnswer: "5 km",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Arrange the words in dictionary order: Mango, Man, Manner, Many",
        options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "3, 2, 4, 1"],
        correctAnswer: "2, 1, 3, 4",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Syllogism: All roses are flowers. Some flowers are red. Conclusion: I. Some roses are red. II. All flowers are roses.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correctAnswer: "Neither follows",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which number should replace the question mark? 8, 16, 32, 64, ?",
        options: ["96", "108", "128", "256"],
        correctAnswer: "128",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "A man is facing south. He turns 90° clockwise, then 180° anticlockwise. Which direction is he facing now?",
        options: ["North", "South", "West", "East"],
        correctAnswer: "East",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Odd one out:",
        options: ["64", "27", "125", "82"],
        correctAnswer: "82",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which pair is related in the same way as: Book : Read :: Pen : ?",
        options: ["Write", "Ink", "Paper", "Draw"],
        correctAnswer: "Write",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "If ‘+’ means ‘×’, ‘–’ means ‘÷’, ‘×’ means ‘+’, and ‘÷’ means ‘–’, then 8 + 2 – 4 × 3 ÷ 5 = ?",
        options: ["15", "17", "19", "21"],
        correctAnswer: "19",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "In a certain code language, 'COLD' is written as 'DPME'. How is 'WARM' written in that code?",
        options: ["XBSN", "XARN", "XBQN", "XASM"],
        correctAnswer: "XBSN",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Choose the correct mirror image of “PQE4”",
        options: ["EP4Q", "4EQP", "EQ4P", "Q4EP"],
        correctAnswer: "4EQP",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Complete the series: A, D, I, P, ?",
        options: ["U", "Y", "W", "X"],
        correctAnswer: "Y",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which number is wrong in the sequence? 7, 14, 28, 56, 126, 224",
        options: ["14", "28", "126", "224"],
        correctAnswer: "126",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Rahul’s mother is the sister of Sunita’s father. Sunita’s father is the husband of Meena. How is Meena related to Rahul?",
        options: ["Aunt", "Mother", "Sister", "Cousin"],
        correctAnswer: "Aunt",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Identify the missing figure in the pattern: (figure-based)",
        options: ["1", "2", "3", "4"],
        correctAnswer: "1",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Statement: All pens are pencils. All pencils are erasers. Conclusion: I. All pens are erasers. II. All erasers are pens.",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        correctAnswer: "Only I follows",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "What comes next? 2, 3, 5, 9, 17, ?",
        options: ["25", "33", "31", "29"],
        correctAnswer: "31",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which word does not belong with the others?",
        options: ["Apple", "Banana", "Grape", "Carrot"],
        correctAnswer: "Carrot",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Find the odd one out:",
        options: ["Dog", "Cat", "Rabbit", "Elephant"],
        correctAnswer: "Elephant",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which number should come next in the series? 2, 4, 8, 16, ___",
        options: ["20", "32", "64", "128"],
        correctAnswer: "32",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Which letter is as far from D as Q is from J?",
        options: ["L", "M", "N", "O"],
        correctAnswer: "N",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "If A is the sister of B, B is the brother of C, and C is the son of D, how is D related to A?",
        options: ["Mother", "Father", "Grandmother", "Grandfather"],
        correctAnswer: "Father",
        category: "Logical Reasoning",
        program: "BCSIT"
      },
      {
        question: "Who is known as the 'Father of Computer'?",
        options: ["Charles Babbage", "Alan Turing", "John von Neumann", "Bill Gates"],
        correctAnswer: "Charles Babbage",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Mount Everest lies in which district of Nepal?",
        options: ["Solukhumbu", "Dolakha", "Taplejung", "Sankhuwasabha"],
        correctAnswer: "Solukhumbu",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which planet is known as the “Red Planet”?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Who invented the telephone?",
        options: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Michael Faraday"],
        correctAnswer: "Alexander Graham Bell",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which is the largest organ in the human body?",
        options: ["Heart", "Skin", "Liver", "Lungs"],
        correctAnswer: "Skin",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctAnswer: "Nile",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Who is known as the 'Light of Asia'?",
        options: ["Mahatma Gandhi", "Gautam Buddha", "Confucius", "Dalai Lama"],
        correctAnswer: "Gautam Buddha",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which one is the smallest continent?",
        options: ["Europe", "Africa", "Australia", "Antarctica"],
        correctAnswer: "Australia",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "“Silicon Valley” in the USA is famous for:",
        options: ["Gold mining", "Information Technology", "Agriculture", "Automobiles"],
        correctAnswer: "Information Technology",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Lionel Messi plays for which country’s national team?",
        options: ["Spain", "Argentina", "Brazil", "Portugal"],
        correctAnswer: "Argentina",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "The 2022 FIFA World Cup was hosted by:",
        options: ["Russia", "Brazil", "Qatar", "Germany"],
        correctAnswer: "Qatar",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "In networking, IP stands for:",
        options: ["Internet Process", "Internal Protocol", "Internet Protocol", "Integrated Program"],
        correctAnswer: "Internet Protocol",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which of the following is NOT a programming language?",
        options: ["Python", "Java", "HTML", "C++"],
        correctAnswer: "HTML",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which of the following is NOT an operating system?",
        options: ["Android", "Windows", "Oracle", "Linux"],
        correctAnswer: "Oracle",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which technology is used in cryptocurrency like Bitcoin?",
        options: ["Cloud computing", "Blockchain", "Big Data", "Artificial Intelligence"],
        correctAnswer: "Blockchain",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which key is used to refresh a webpage in Windows?",
        options: ["F2", "F5", "Ctrl + R", "Both b and c"],
        correctAnswer: "Both b and c",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which is the most common data transmission medium for internet?",
        options: ["Optical fiber", "Coaxial cable", "Twisted pair", "Satellite"],
        correctAnswer: "Optical fiber",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "The term “love” is used in which sport?",
        options: ["Badminton", "Tennis", "Volleyball", "Golf"],
        correctAnswer: "Tennis",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which company developed the Android operating system?",
        options: ["Apple", "Google", "Microsoft", "Samsung"],
        correctAnswer: "Google",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which of the following is NOT an output device?",
        options: ["Monitor", "Printer", "Speaker", "Keyboard"],
        correctAnswer: "Keyboard",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which device connects different networks together?",
        options: ["Switch", "Router", "Hub", "Repeater"],
        correctAnswer: "Router",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which company is known for developing the Macintosh computer?",
        options: ["Microsoft", "IBM", "Apple Inc.", "Intel"],
        correctAnswer: "Apple Inc.",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "Which shortcut key is used to undo an action in Windows?",
        options: ["Ctrl + U", "Ctrl + X", "Ctrl + Z", "Ctrl + Y"],
        correctAnswer: "Ctrl + Z",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "The “brain” of the computer system is:",
        options: ["Hard Disk", "CPU", "GPU", "RAM"],
        correctAnswer: "CPU",
        category: "General Awareness",
        program: "BCSIT"
      },
      {
        question: "What is the area of Nepal?",
        options: ["147,516 KM2", "147,316 KM2", "147,416 KM2", "147,635 KM2"],
        correctAnswer: "147,516 KM2",
        category: "General Awareness",
        program: "BCSIT"
      },

      // BCA Questions 

      {
        "question": "Choose the correct spelling:",
        "options": ["Accomodate", "Acommodate", "Accommodate", "Accomadate"],
        "correctAnswer": "Accommodate",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the correct synonym for 'Abundant':",
        "options": ["Scarce", "Plentiful", "Rare", "Limited"],
        "correctAnswer": "Plentiful",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the antonym of 'Generous':",
        "options": ["Kind", "Stingy", "Helpful", "Liberal"],
        "correctAnswer": "Stingy",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Fill in the blank: She is fond ___ chocolates.",
        "options": ["for", "to", "of", "with"],
        "correctAnswer": "of",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Identify the part with an error: 'He do not know the answer.'",
        "options": ["He", "do", "not know", "the answer"],
        "correctAnswer": "do",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "One word for: A person who loves books.",
        "options": ["Bibliophile", "Philatelist", "Atheist", "Pedagogue"],
        "correctAnswer": "Bibliophile",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Rearrange the sentence: is / she / not / intelligent / very",
        "options": ["She is not very intelligent.", "She is very not intelligent.", "Not she is very intelligent.", "She very is not intelligent."],
        "correctAnswer": "She is not very intelligent.",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the word closest in meaning to 'Reluctant':",
        "options": ["Eager", "Unwilling", "Happy", "Curious"],
        "correctAnswer": "Unwilling",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Correct the sentence: 'He go to school everyday.'",
        "options": ["He going to school everyday.", "He goes to school every day.", "He go to school every day.", "He went to school everyday."],
        "correctAnswer": "He goes to school every day.",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the correct article: She bought ___ apple.",
        "options": ["a", "an", "the", "no article"],
        "correctAnswer": "an",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the correct passive voice: 'They are watching a movie.'",
        "options": ["A movie is watched by them.", "A movie is being watched by them.", "A movie was being watched by them.", "A movie watched them."],
        "correctAnswer": "A movie is being watched by them.",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Identify the correct preposition: He is married ___ my cousin.",
        "options": ["to", "with", "at", "by"],
        "correctAnswer": "to",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the correct synonym of 'Brief':",
        "options": ["Short", "Long", "Detailed", "Complex"],
        "correctAnswer": "Short",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Which sentence is correct?",
        "options": ["She don’t like coffee.", "She doesn’t likes coffee.", "She doesn’t like coffee.", "She don’t likes coffee."],
        "correctAnswer": "She doesn’t like coffee.",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Fill in the blank: The sun rises ___ the east.",
        "options": ["on", "in", "at", "from"],
        "correctAnswer": "in",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Identify the error: 'Each of the students have a pen.'",
        "options": ["Each", "of the students", "have", "a pen"],
        "correctAnswer": "have",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Find the correctly spelt word:",
        "options": ["Receeve", "Receive", "Recieve", "Receve"],
        "correctAnswer": "Receive",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the antonym of 'Ancient':",
        "options": ["Old", "Modern", "Past", "Historic"],
        "correctAnswer": "Modern",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "One word for: A place where books are kept.",
        "options": ["Library", "Bookshop", "Store", "Museum"],
        "correctAnswer": "Library",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Choose the correct question tag: 'She is a teacher, ___?'",
        "options": ["isn’t she", "is she", "does she", "doesn’t she"],
        "correctAnswer": "isn’t she",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Who is a linguist?",
        "options": ["A professor", "Expert in science of language", "Expert in mathematics", "One who knows several languages"],
        "correctAnswer": "Expert in science of language",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "What is the debate about?",
        "options": ["Weakness of language", "Weakness of mathematics", "Relationship of language", "Language and mathematics"],
        "correctAnswer": "Relationship of language",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": ".... ..... behalf of the staff, Kumar read the address.",
        "options": ["in", "to", "on", "with"],
        "correctAnswer": "on",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "In case..... need, phone 0.15195568.",
        "options": ["of", "to", "on", "with"],
        "correctAnswer": "of",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "Just walk ....the station and looked for a temple.",
        "options": ["with", "past", "across", "along"],
        "correctAnswer": "past",
        "category": "Verbal Ability",
        "program": "BCA"
      },
      {
        "question": "If x^2 - 5x + 6 = 0, then the roots are:",
        "options": ["2, 3", "-2, -3", "1, 6", "-1, -6"],
        "correctAnswer": "2, 3",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The HCF of 72 and 108 is:",
        "options": ["18", "36", "24", "12"],
        "correctAnswer": "36",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The LCM of 18 and 24 is:",
        "options": ["36", "72", "144", "48"],
        "correctAnswer": "72",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The value of (64)^(2/3) is:",
        "options": ["16", "32", "8", "4"],
        "correctAnswer": "16",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The 12th term of AP: 5, 9, 13… is:",
        "options": ["45", "49", "53", "57"],
        "correctAnswer": "49",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The sum of first 20 natural numbers is:",
        "options": ["190", "200", "210", "220"],
        "correctAnswer": "210",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "If the average of 5 numbers is 18, their sum is:",
        "options": ["90", "95", "100", "85"],
        "correctAnswer": "90",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "A sum of Rs. 2000 is borrowed at 10% per annum simple interest. The interest after 2 years is:",
        "options": ["200", "300", "400", "500"],
        "correctAnswer": "400",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The area of a triangle with base 12 cm and height 8 cm is:",
        "options": ["48 cm²", "96 cm²", "72 cm²", "36 cm²"],
        "correctAnswer": "48 cm²",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The area of a circle of radius 7 cm is:",
        "options": ["154 cm²", "144 cm²", "147 cm²", "176 cm²"],
        "correctAnswer": "154 cm²",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The volume of a sphere of radius 7 cm is:",
        "options": ["1436 cm³", "1448 cm³", "1540 cm³", "1472 cm³"],
        "correctAnswer": "1540 cm³",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "The total surface area of a cube of side 6 cm is:",
        "options": ["144 cm²", "216 cm²", "256 cm²", "288 cm²"],
        "correctAnswer": "216 cm²",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "A can complete a work in 12 days and B in 18 days. Together, they complete it in:",
        "options": ["7.2 days", "7.5 days", "8 days", "8.5 days"],
        "correctAnswer": "7.5 days",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "√81 + √0.81 equals:",
        "options": ["9.9", "9.81", "9.5", "10"],
        "correctAnswer": "9.9",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "If SP is twice the CP, profit % is:",
        "options": ["50%", "75%", "80%", "100%"],
        "correctAnswer": "100%",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "Mean of first 10 odd natural numbers:",
        "options": ["9", "10", "11", "12"],
        "correctAnswer": "10",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "A man spends 2/5 of income on rent, 30% on food, saves Rs. 6000. Total income:",
        "options": ["15,000", "16,000", "18,000", "20,000"],
        "correctAnswer": "18,000",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "Unit digit of 7¹⁷³ is:",
        "options": ["1", "3", "7", "9"],
        "correctAnswer": "7",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "Mixture of milk and water is 5:1. Adding 6 L water to 30 L mixture gives ratio:",
        "options": ["5:2", "5:3", "3:1", "2:1"],
        "correctAnswer": "5:2",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "If 1/x + 1/y = 1/6 and x = 12, y =:",
        "options": ["8", "10", "12", "15"],
        "correctAnswer": "10",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "If x² – 7x + 10 = 0, sum of roots:",
        "options": ["7", "10", "–7", "–10"],
        "correctAnswer": "7",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "Solve: (x – 3)/4 = (5 – x)/6",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "If log₁₀2 = 0.3010, log₁₀80 = ?",
        "options": ["1.903", "1.902", "1.905", "1.901"],
        "correctAnswer": "1.903",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "SI on Rs. 12000 at 6% for 9 months:",
        "options": ["540", "560", "5400", "600"],
        "correctAnswer": "540",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "x varies inversely with y. x = 8 when y = 5. Find y when x = 10.",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4",
        "category": "Quantitative Aptitude",
        "program": "BCA"
      },
      {
        "question": "7, 14, 28, 56, ?",
        "options": ["84", "100", "112", "128"],
        "correctAnswer": "112",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A, D, H, M, S, ?",
        "options": ["X", "Y", "Z", "W"],
        "correctAnswer": "X",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "If CAT = 3120, DOG = 4157, then BAT = ?",
        "options": ["4110", "2140", "3120", "2120"],
        "correctAnswer": "2120",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Statements: All pens are books. All books are papers. Conclusion: All pens are papers.",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Tree : Forest :: Star : ?",
        "options": ["Moon", "Sky", "Planet", "Cloud"],
        "correctAnswer": "Sky",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Doctor : Hospital :: Teacher : ?",
        "options": ["School", "Class", "University", "College"],
        "correctAnswer": "School",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Pointing to a photograph, John says, “He is my father’s only son.” Who is in the photograph?",
        "options": ["John’s son", "John’s father", "John", "John’s uncle"],
        "correctAnswer": "John",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A woman introduces a man as the son of the brother of her mother. How is the man related to the woman?",
        "options": ["Cousin", "Brother", "Uncle", "Nephew"],
        "correctAnswer": "Cousin",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A man walks 5 km north, then turns right and walks 3 km. Which direction is he facing now?",
        "options": ["West", "East", "North", "South"],
        "correctAnswer": "East",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A person walks 4 km east, then 3 km south, then 4 km west. How far is he from the starting point?",
        "options": ["3 km", "4 km", "5 km", "6 km"],
        "correctAnswer": "3 km",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "If 1 January 2023 was a Sunday, what day was 1 March 2023?",
        "options": ["Thursday", "Wednesday", "Friday", "Saturday"],
        "correctAnswer": "Wednesday",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Find the odd one out: 2, 3, 5, 9, 7",
        "options": ["2", "3", "5", "9"],
        "correctAnswer": "9",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A father is three times as old as his son. Five years ago, he was four times as old as his son. Find their present ages.",
        "options": ["30 & 10", "36 & 12", "27 & 9", "15 & 45"],
        "correctAnswer": "15 & 45",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Four friends – A, B, C, D – are sitting in a row. A is to the right of B, D is to the left of C, B is at one end. Who sits in the middle?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Pointing to a boy, Rahul said, “He is the son of my mother’s brother.” How is the boy related to Rahul?",
        "options": ["Brother", "Cousin", "Nephew", "Uncle"],
        "correctAnswer": "Cousin",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A coin is tossed twice. What is the probability of getting two heads?",
        "options": ["1/4", "1/2", "1/3", "1/8"],
        "correctAnswer": "1/4",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "1, 4, 9, 16, 25, ?",
        "options": ["40", "30", "28", "36"],
        "correctAnswer": "36",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "2, 6, 12, 20, 30, ?",
        "options": ["40", "42", "44", "46"],
        "correctAnswer": "42",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Statement: All engineers are intelligent. Conclusion: Some intelligent people are engineers.",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "Statement: Some apples are mangoes. All mangoes are fruits. Conclusion: Some fruits are apples.",
        "options": ["False", "True"],
        "correctAnswer": "True",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "An article is sold for $720 after giving a 20% discount on the marked price. What is the marked price?",
        "options": ["$800", "$850", "$900", "$750"],
        "correctAnswer": "$800",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "If two typists can type two pages in two minutes, how many typists are needed to type 18 pages in six minutes?",
        "options": ["6", "4", "3", "9"],
        "correctAnswer": "3",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "If the cost of 5 pens is Rs. 75, what is the cost of 8 pens?",
        "options": ["Rs. 120", "Rs. 125", "Rs. 130", "Rs. 135"],
        "correctAnswer": "Rs. 120",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "If a train runs at 60 km/h, how long will it take to cover 180 km?",
        "options": ["3 hours", "2.5 hours", "4 hours", "3.5 hours"],
        "correctAnswer": "3 hours",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "A man walks 10 km north, turns right and walks 5 km, then turns right again and walks 10 km. How far is he from the starting point?",
        "options": ["0 km", "10 km", "15 km", "5 km"],
        "correctAnswer": "5 km",
        "category": "Logical Reasoning",
        "program": "BCA"
      },
      {
        "question": "In which year did Prithvi Narayan Shah unify Nepal?",
        "options": ["1743 AD", "1768 AD", "1775 AD", "1790 AD"],
        "correctAnswer": "1768 AD",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which article of the Constitution of Nepal declares Nepal as a secular state?",
        "options": ["Article 3", "Article 4", "Article 6", "Article 7"],
        "correctAnswer": "Article 3",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the deepest lake in Nepal?",
        "options": ["Rara Lake", "Shey-Phoksundo Lake", "Tilicho Lake", "Gosaikunda"],
        "correctAnswer": "Shey-Phoksundo Lake",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Who wrote the national anthem of Nepal, “Sayaun Thunga Phoolka”?",
        "options": ["Byakul Maila", "Madhav Prasad Ghimire", "Laxmi Prasad Devkota", "Amber Gurung"],
        "correctAnswer": "Byakul Maila",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the largest district of Nepal by area?",
        "options": ["Dolpa", "Humla", "Taplejung", "Mustang"],
        "correctAnswer": "Dolpa",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The Sugauli Treaty between Nepal and the British East India Company was signed in which year?",
        "options": ["1814 AD", "1816 AD", "1820 AD", "1830 AD"],
        "correctAnswer": "1816 AD",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the only UNESCO World Heritage site in Nepal that is entirely natural?",
        "options": ["Chitwan National Park", "Sagarmatha National Park", "Lumbini", "Pashupatinath"],
        "correctAnswer": "Chitwan National Park",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Who was the first woman Deputy Prime Minister of Nepal?",
        "options": ["Sushila Karki", "Shailaja Acharya", "Bidhya Devi Bhandari", "Onsari Gharti Magar"],
        "correctAnswer": "Shailaja Acharya",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The Kalapani dispute is related to which two countries?",
        "options": ["Nepal & India", "Nepal & China", "Nepal & Bhutan", "Nepal & Pakistan"],
        "correctAnswer": "Nepal & India",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which river is called the 'Sorrow of Bihar' but originates in Nepal?",
        "options": ["Koshi", "Gandaki", "Bagmati", "Mahakali"],
        "correctAnswer": "Koshi",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The Parliament of Nepal is known as:",
        "options": ["Rashtriya Sabha", "Federal Parliament", "Pratinidhi Sabha", "Rastriya Panchayat"],
        "correctAnswer": "Federal Parliament",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Who was the last King of Nepal?",
        "options": ["King Birendra", "King Dipendra", "King Gyanendra", "King Mahendra"],
        "correctAnswer": "King Gyanendra",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the smallest district of Nepal by area?",
        "options": ["Bhaktapur", "Lalitpur", "Mustang", "Manang"],
        "correctAnswer": "Bhaktapur",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The Kathmandu-Birgunj railway during Rana rule was called:",
        "options": ["Koshi Railway", "Nepal Government Railway", "Terai Express", "Himalayan Railway"],
        "correctAnswer": "Nepal Government Railway",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the largest hydropower project currently in operation in Nepal?",
        "options": ["Upper Tamakoshi", "Kulekhani", "Chilime", "Marsyangdi"],
        "correctAnswer": "Upper Tamakoshi",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which country was the first to grant women the right to vote?",
        "options": ["USA", "Finland", "New Zealand", "Switzerland"],
        "correctAnswer": "New Zealand",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The “Treaty of Versailles” officially ended which war?",
        "options": ["World War I", "World War II", "Crimean War", "Cold War"],
        "correctAnswer": "World War I",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which is the deepest ocean in the world?",
        "options": ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Southern Ocean"],
        "correctAnswer": "Pacific Ocean",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The G7 group of nations does NOT include which of the following countries?",
        "options": ["Germany", "Russia", "Canada", "Italy"],
        "correctAnswer": "Russia",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which country has the most official languages recognized in its constitution?",
        "options": ["Switzerland", "South Africa", "India", "Canada"],
        "correctAnswer": "South Africa",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which type of software controls the overall operation of a computer system?",
        "options": ["Utility Software", "System Software", "Firmware", "Application Software"],
        "correctAnswer": "System Software",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "The term 'phishing' is related to:",
        "options": ["Data encryption", "Email Fraud", "Network Topology", "File Compression"],
        "correctAnswer": "Email Fraud",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "In IPv6, how many bits are used for an address?",
        "options": ["32 bits", "64 bits", "128 bits", "256 bits"],
        "correctAnswer": "128 bits",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "Which key combination is used to permanently delete a file without sending it to the recycle bin in Windows?",
        "options": ["Shift + Delete", "Ctrl + Delete", "Alt + Delete", "Delete + Esc"],
        "correctAnswer": "Shift + Delete",
        "category": "General Awareness",
        "program": "BCA"
      },
      {
        "question": "What is the binary equivalent of the decimal number 13?",
        "options": ["1011", "1101", "1110", "1001"],
        "correctAnswer": "1101",
        "category": "General Awareness",
        "program": "BCA"
      }
    ];

    await Question.insertMany(questions);
    console.log("Questions seeded successfully!");
  } catch (err) {
    console.error("Error seeding questions:", err.message);
  }
};

module.exports = seedQuestions;