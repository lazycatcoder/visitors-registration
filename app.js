const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const csrf = require('csurf');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
const port = 3000;

// Initializing Socket.IO
const server = http.createServer(app);
const io = require('./utils/socket').init(server);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Import routes
const authRoutes = require('./routes/auth.js');
const visitorsRoutes = require('./routes/visitors.js');

// Middleware to analyze and process cookies
app.use(cookieParser());
app.use(bodyParser.json());

// Apply csurf to all routes that require CSRF protection
const csrfOptions = {
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  }
};

// Middleware to configure the session session
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  }
}));

// Csurf only applies to the '/auth' route
app.use('/auth', csrf(csrfOptions));

// Setting headers to allow cross-domain requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// // Creation of middleware to limit requests to add to one ip
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 min
//   max: 200, // Maximum number of requests
//   message: 'Request limit exceeded. Try later',
// });

// // Application of middleware to each request
// app.use(limiter);

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/visitors_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB.');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handlebars settings
app.engine(
  'hbs',
  handlebars({
    extname: 'hbs',
    defaultLayout: false, // Disabling the use of the main template
  })
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Connection of static files
app.use(express.static(path.join(__dirname, 'public')));

// Parsers for processing data from forms and JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Using routes
app.use('/auth', authRoutes);
app.use('/', visitorsRoutes);

// 404 (Not Found) error handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Page not found' });
});

// Error 500 (Internal Server Error) handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});