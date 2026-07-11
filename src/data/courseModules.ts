export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Assignment = {
  title: string;
  description: string;
  tasks: string[];
};

export type Lesson = {
  id: string;
  title: string;
  type: "video" | "text";
  duration: string;
  content: string;
  videoUrl?: string;
  quiz?: { title: string; questions: QuizQuestion[] };
  assignment?: Assignment;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type CourseData = {
  title: string;
  modules: Module[];
};

export const COURSE_MODULES: Record<string, CourseData> = {
  "web-dev": {
    title: "Full-Stack Web Development",
    modules: [
      {
        id: "m1", title: "HTML & CSS Fundamentals",
        lessons: [
          {
            id: "l1", title: "Introduction to HTML", type: "text", duration: "15 min",
            content: "HTML (HyperText Markup Language) is the standard markup language for creating web pages. In this lesson, you'll learn the basic structure of an HTML document, including tags, elements, and attributes.\n\n## Key Concepts\n- Document structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)\n- Common tags: headings, paragraphs, links, images\n- Semantic HTML5 elements\n- Forms and input types",
            quiz: {
              title: "HTML Basics Quiz",
              questions: [
                { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctIndex: 0, explanation: "HTML stands for HyperText Markup Language." },
                { question: "Which tag is used for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correctIndex: 2, explanation: "<h1> defines the largest heading, <h6> the smallest." },
                { question: "Which element is a semantic HTML5 element?", options: ["<div>", "<span>", "<article>", "<b>"], correctIndex: 2, explanation: "<article> is a semantic element that clearly describes its meaning." },
              ],
            },
          },
          {
            id: "l2", title: "CSS Styling Basics", type: "video", duration: "25 min",
            content: "Learn the fundamentals of CSS including selectors, properties, the box model, and responsive design principles.",
            videoUrl: "https://www.youtube.com/embed/1PnVor36_40",
            quiz: {
              title: "CSS Fundamentals Quiz",
              questions: [
                { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correctIndex: 1, explanation: "CSS stands for Cascading Style Sheets." },
                { question: "Which property changes text color?", options: ["font-color", "text-color", "color", "foreground"], correctIndex: 2, explanation: "The 'color' property sets the text color in CSS." },
              ],
            },
          },
          {
            id: "l3", title: "Flexbox & Grid Layout", type: "text", duration: "20 min",
            content: "Modern CSS layout techniques using Flexbox and CSS Grid.\n\n## Flexbox\nFlexbox is designed for one-dimensional layouts. Use `display: flex` on a container to align items along a single axis.\n\n## CSS Grid\nCSS Grid is for two-dimensional layouts. Use `display: grid` to create complex page layouts with rows and columns.\n\n## When to Use Which\n- Flexbox: Navigation bars, card rows, centering content\n- Grid: Full page layouts, dashboards, image galleries",
            assignment: {
              title: "Build a Responsive Layout",
              description: "Create a responsive webpage layout using Flexbox and CSS Grid.",
              tasks: [
                "Create a navigation bar using Flexbox with logo, links, and a CTA button",
                "Build a 3-column grid layout for a portfolio section that stacks on mobile",
                "Add a footer with evenly spaced columns using Flexbox",
              ],
            },
          },
        ],
      },
      {
        id: "m2", title: "JavaScript & TypeScript",
        lessons: [
          {
            id: "l4", title: "JavaScript Essentials", type: "video", duration: "30 min",
            content: "Core JavaScript concepts including variables, functions, arrays, objects, and ES6+ features.",
            videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
            quiz: {
              title: "JavaScript Quiz",
              questions: [
                { question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "function", "dim"], correctIndex: 1, explanation: "'let' declares a block-scoped variable, unlike 'var' which is function-scoped." },
                { question: "What does '===' check?", options: ["Value only", "Type only", "Value and type", "Reference"], correctIndex: 2, explanation: "'===' checks both value and type (strict equality)." },
                { question: "Which is NOT an ES6 feature?", options: ["Arrow functions", "Template literals", "goto statements", "Destructuring"], correctIndex: 2, explanation: "JavaScript does not have goto statements as an ES6 feature." },
              ],
            },
          },
          {
            id: "l5", title: "TypeScript for Beginners", type: "text", duration: "25 min",
            content: "TypeScript adds static typing to JavaScript, helping catch errors early.\n\n## Why TypeScript?\n- Type safety at compile time\n- Better IDE support and autocomplete\n- Easier refactoring of large codebases\n\n## Basic Types\n```typescript\nlet name: string = 'John';\nlet age: number = 25;\nlet isActive: boolean = true;\nlet items: string[] = ['a', 'b'];\n```",
            quiz: {
              title: "TypeScript Quiz",
              questions: [
                { question: "TypeScript is a superset of which language?", options: ["Python", "Java", "JavaScript", "C#"], correctIndex: 2, explanation: "TypeScript is a typed superset of JavaScript." },
                { question: "What does 'string[]' represent?", options: ["A single string", "An array of strings", "A string function", "A string object"], correctIndex: 1, explanation: "'string[]' represents an array of strings in TypeScript." },
              ],
            },
          },
          {
            id: "l6", title: "Async Programming", type: "text", duration: "20 min",
            content: "Understanding Promises, async/await, and handling asynchronous operations in JavaScript.\n\n## Promises\nA Promise represents a value that may not be available yet.\n\n## Async/Await\nSyntactic sugar over Promises that makes async code look synchronous.\n\n```javascript\nasync function fetchData() {\n  const response = await fetch('/api/data');\n  const data = await response.json();\n  return data;\n}\n```",
            assignment: {
              title: "Async API Project",
              description: "Build a small project that fetches and displays data from a public API.",
              tasks: [
                "Choose a public API (e.g., JSONPlaceholder, PokéAPI)",
                "Write an async function to fetch data and handle errors with try/catch",
                "Display the results in a formatted list on a webpage",
                "Add a loading state and error message UI",
              ],
            },
          },
        ],
      },
      {
        id: "m3", title: "React & Frontend Frameworks",
        lessons: [
          {
            id: "l7", title: "React Components & JSX", type: "video", duration: "35 min",
            content: "Build reusable UI components with React and JSX syntax.",
            videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
            quiz: {
              title: "React Basics Quiz",
              questions: [
                { question: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"], correctIndex: 0, explanation: "JSX stands for JavaScript XML." },
                { question: "How do you pass data to a child component?", options: ["state", "props", "context", "refs"], correctIndex: 1, explanation: "Props (properties) are used to pass data from parent to child components." },
              ],
            },
          },
          {
            id: "l8", title: "State Management & Hooks", type: "text", duration: "30 min",
            content: "React Hooks revolutionized how we manage state and side effects.\n\n## useState\nManage local component state.\n\n## useEffect\nHandle side effects like API calls, subscriptions.\n\n## Custom Hooks\nExtract reusable logic into custom hooks for cleaner code.",
            assignment: {
              title: "Build a React App",
              description: "Create a complete React application using hooks and component composition.",
              tasks: [
                "Build a todo app with useState for managing the list",
                "Use useEffect to persist todos in localStorage",
                "Create a custom hook 'useTodos' that encapsulates the logic",
                "Add filtering (all, active, completed) with proper state management",
              ],
            },
          },
        ],
      },
    ],
  },
  "mobile-dev": {
    title: "Mobile App Development",
    modules: [
      {
        id: "m1", title: "React Native Basics",
        lessons: [
          { id: "l1", title: "Getting Started with React Native", type: "text", duration: "20 min", content: "React Native lets you build mobile apps using JavaScript and React.\n\n## Setup\n- Install Node.js and npm\n- Use Expo CLI for quick setup\n- Understanding the project structure\n\n## Core Components\n- View, Text, Image, ScrollView\n- TouchableOpacity, FlatList\n- StyleSheet API",
            quiz: { title: "React Native Quiz", questions: [
              { question: "What language does React Native use?", options: ["Swift", "Kotlin", "JavaScript", "Dart"], correctIndex: 2, explanation: "React Native uses JavaScript (and optionally TypeScript)." },
              { question: "Which CLI simplifies React Native setup?", options: ["npm CLI", "Expo CLI", "Yarn CLI", "React CLI"], correctIndex: 1, explanation: "Expo CLI provides a streamlined way to start React Native projects." },
            ]},
          },
          { id: "l2", title: "Navigation in React Native", type: "video", duration: "25 min", content: "Learn to implement stack, tab, and drawer navigation in React Native apps.", videoUrl: "https://www.youtube.com/embed/gPaBicMaib4",
            assignment: { title: "Navigation App", description: "Build a multi-screen React Native app with navigation.", tasks: ["Create 3 screens with stack navigation", "Add a bottom tab navigator", "Pass parameters between screens"] },
          },
        ],
      },
      {
        id: "m2", title: "Flutter Development",
        lessons: [
          { id: "l3", title: "Dart Programming Language", type: "text", duration: "25 min", content: "Dart is the language behind Flutter.\n\n## Key Features\n- Strong typing with type inference\n- Null safety\n- Async programming with Future and Stream\n- Object-oriented with mixins",
            quiz: { title: "Dart Quiz", questions: [
              { question: "Dart supports null safety by default.", options: ["True", "False"], correctIndex: 0, explanation: "Dart has sound null safety built into the language." },
            ]},
          },
          { id: "l4", title: "Building Flutter Widgets", type: "video", duration: "30 min", content: "Everything in Flutter is a widget. Learn to compose widgets to build beautiful UIs.", videoUrl: "https://www.youtube.com/embed/1ukSR1GRtMU",
            assignment: { title: "Flutter UI Challenge", description: "Build a Flutter UI from a design mockup.", tasks: ["Recreate a login screen with form validation", "Add custom theming and fonts", "Implement responsive layout for tablets"] },
          },
        ],
      },
    ],
  },
  "cloud-eng": {
    title: "Cloud Engineering & DevOps",
    modules: [
      { id: "m1", title: "Cloud Fundamentals", lessons: [
        { id: "l1", title: "Introduction to Cloud Computing", type: "text", duration: "20 min", content: "Cloud computing delivers computing services over the internet.\n\n## Service Models\n- **IaaS**: Virtual machines, storage, networking\n- **PaaS**: Application platforms, databases\n- **SaaS**: Ready-to-use software\n\n## Major Providers\n- AWS, Azure, Google Cloud",
          quiz: { title: "Cloud Quiz", questions: [
            { question: "Which is NOT a cloud service model?", options: ["IaaS", "PaaS", "SaaS", "DaaS"], correctIndex: 3, explanation: "The three main models are IaaS, PaaS, and SaaS." },
            { question: "AWS stands for?", options: ["Amazon Web Services", "Advanced Web Systems", "Amazon Work Suite", "Application Web Services"], correctIndex: 0, explanation: "AWS stands for Amazon Web Services." },
          ]},
        },
        { id: "l2", title: "AWS Core Services", type: "video", duration: "35 min", content: "Overview of essential AWS services: EC2, S3, RDS, Lambda, and more.", videoUrl: "https://www.youtube.com/embed/ulprqHHWlng",
          assignment: { title: "Cloud Architecture Design", description: "Design a cloud architecture for a web application.", tasks: ["Draw a diagram showing compute, storage, and database layers", "Choose appropriate AWS services for each layer", "Explain your scaling strategy"] },
        },
      ]},
      { id: "m2", title: "Docker & Kubernetes", lessons: [
        { id: "l3", title: "Containerization with Docker", type: "text", duration: "25 min", content: "Docker packages applications with their dependencies into containers.\n\n## Key Concepts\n- Images vs Containers\n- Dockerfile syntax\n- Docker Compose for multi-container apps\n- Best practices for production",
          quiz: { title: "Docker Quiz", questions: [
            { question: "A Docker container is created from a?", options: ["Volume", "Network", "Image", "Compose file"], correctIndex: 2, explanation: "Containers are runtime instances of Docker images." },
          ]},
        },
        { id: "l4", title: "Kubernetes Orchestration", type: "video", duration: "30 min", content: "Learn to deploy, scale, and manage containerized applications with Kubernetes.", videoUrl: "https://www.youtube.com/embed/X48VuDVv0do" },
      ]},
    ],
  },
  "cybersecurity": {
    title: "Cybersecurity Fundamentals",
    modules: [
      { id: "m1", title: "Security Principles", lessons: [
        { id: "l1", title: "CIA Triad & Security Basics", type: "text", duration: "20 min", content: "The CIA Triad forms the foundation of information security.\n\n## Confidentiality\nEnsuring data is accessible only to authorized users.\n\n## Integrity\nMaintaining accuracy and completeness of data.\n\n## Availability\nEnsuring systems and data are accessible when needed.",
          quiz: { title: "Security Quiz", questions: [
            { question: "What does CIA stand for in cybersecurity?", options: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Computer Information Architecture", "Cybersecurity Intelligence Assessment"], correctIndex: 1, explanation: "CIA stands for Confidentiality, Integrity, and Availability." },
            { question: "Which ensures data hasn't been tampered with?", options: ["Confidentiality", "Integrity", "Availability", "Authentication"], correctIndex: 1, explanation: "Integrity ensures data accuracy and completeness." },
          ]},
        },
        { id: "l2", title: "Network Security Fundamentals", type: "video", duration: "30 min", content: "Understanding firewalls, VPNs, IDS/IPS, and network security architectures.", videoUrl: "https://www.youtube.com/embed/E03gh1huvW4",
          assignment: { title: "Security Audit", description: "Perform a basic security audit of a sample network.", tasks: ["Identify potential vulnerabilities in the network diagram", "Recommend firewall rules for each zone", "Write a brief incident response plan"] },
        },
      ]},
    ],
  },
  "ai-ml": {
    title: "AI & Machine Learning",
    modules: [
      { id: "m1", title: "Python for AI", lessons: [
        { id: "l1", title: "Python Programming Essentials", type: "text", duration: "25 min", content: "Python is the dominant language for AI/ML.\n\n## Key Libraries\n- **NumPy**: Numerical computing\n- **Pandas**: Data manipulation\n- **Matplotlib**: Visualization\n- **Scikit-learn**: Machine learning\n- **TensorFlow/PyTorch**: Deep learning",
          quiz: { title: "Python for AI Quiz", questions: [
            { question: "Which library is used for data manipulation?", options: ["NumPy", "Pandas", "Matplotlib", "TensorFlow"], correctIndex: 1, explanation: "Pandas is the go-to library for data manipulation and analysis." },
            { question: "Which framework is NOT for deep learning?", options: ["TensorFlow", "PyTorch", "Scikit-learn", "Keras"], correctIndex: 2, explanation: "Scikit-learn is for traditional ML, not deep learning." },
          ]},
        },
        { id: "l2", title: "Data Preprocessing & Analysis", type: "video", duration: "30 min", content: "Learn to clean, transform, and analyze data using Pandas and NumPy.", videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
          assignment: { title: "Data Analysis Project", description: "Analyze a real-world dataset using Python.", tasks: ["Load and clean a CSV dataset using Pandas", "Handle missing values and outliers", "Create at least 3 visualizations", "Write a summary of your findings"] },
        },
      ]},
      { id: "m2", title: "Machine Learning Foundations", lessons: [
        { id: "l3", title: "Supervised vs Unsupervised Learning", type: "text", duration: "25 min", content: "## Supervised Learning\nTraining with labeled data. Examples: classification, regression.\n\n## Unsupervised Learning\nFinding patterns in unlabeled data. Examples: clustering, dimensionality reduction.\n\n## Key Algorithms\n- Linear/Logistic Regression\n- Decision Trees & Random Forests\n- K-Means Clustering\n- Neural Networks",
          quiz: { title: "ML Foundations Quiz", questions: [
            { question: "Classification is an example of?", options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Transfer learning"], correctIndex: 0, explanation: "Classification uses labeled data, making it supervised learning." },
            { question: "K-Means is used for?", options: ["Regression", "Classification", "Clustering", "Encoding"], correctIndex: 2, explanation: "K-Means is an unsupervised clustering algorithm." },
          ]},
        },
        { id: "l4", title: "Building Your First Neural Network", type: "video", duration: "35 min", content: "Step-by-step guide to building, training, and evaluating a neural network with TensorFlow.", videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
          assignment: { title: "Neural Network Project", description: "Build and train a neural network on a dataset.", tasks: ["Choose a dataset (e.g., MNIST, Iris)", "Design a neural network architecture", "Train the model and evaluate accuracy", "Experiment with hyperparameters and document results"] },
        },
      ]},
    ],
  },
  "it-support": {
    title: "IT Support & Administration",
    modules: [
      { id: "m1", title: "Hardware & Troubleshooting", lessons: [
        { id: "l1", title: "Computer Hardware Basics", type: "text", duration: "20 min", content: "Understanding computer components and their roles.\n\n## Core Components\n- **CPU**: The brain of the computer\n- **RAM**: Temporary working memory\n- **Storage**: HDDs, SSDs, NVMe\n- **Motherboard**: Connects all components\n- **PSU**: Power supply unit",
          quiz: { title: "Hardware Quiz", questions: [
            { question: "What component is considered the 'brain' of a computer?", options: ["RAM", "CPU", "GPU", "PSU"], correctIndex: 1, explanation: "The CPU (Central Processing Unit) processes instructions and is called the brain." },
            { question: "Which storage type is fastest?", options: ["HDD", "SSD", "NVMe", "USB Flash"], correctIndex: 2, explanation: "NVMe drives use PCIe and are significantly faster than SATA SSDs." },
          ]},
        },
        { id: "l2", title: "Troubleshooting Methodology", type: "video", duration: "25 min", content: "Learn the CompTIA troubleshooting methodology for systematic problem resolution.", videoUrl: "https://www.youtube.com/embed/AkAmyMnOdL4",
          assignment: { title: "Troubleshooting Scenarios", description: "Apply the troubleshooting methodology to common IT issues.", tasks: ["Document a step-by-step troubleshooting process for a PC that won't boot", "Diagnose a network connectivity issue using the OSI model", "Create a troubleshooting flowchart for a slow computer"] },
        },
      ]},
    ],
  },
};
