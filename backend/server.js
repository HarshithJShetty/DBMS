const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const path = require('path');

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const BookingSchema = new mongoose.Schema({
  title: String,
  user: String,
  createdAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', UserSchema);
const ContactRequest = mongoose.model('ContactRequest', ContactSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Routes
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    // Fetch bookings for the logged-in user
    const bookings = await Booking.find({ user: email });

    res.json({ message: 'Login successful', user, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
});

app.get('/user/bookings', async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log('Fetching bookings for user:', userEmail); // Debug log
    if (!userEmail) return res.status(400).json({ message: 'User email is required' });

    const bookings = await Booking.find({ user: userEmail });
    console.log('User bookings:', bookings); // Debug log
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error); // Debug log
    res.status(500).json({ message: 'Error fetching user bookings', error });
  }
});

app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new ContactRequest({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Contact request submitted!' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact request', error });
  }
});

app.post('/book', async (req, res) => {
  try {
    const { title, userEmail } = req.body;
    if (!userEmail || !title) {
      return res.status(400).json({ message: 'Title and userEmail are required' });
    }

    const booking = new Booking({ title, user: userEmail });
    await booking.save();

    res.status(201).json({ message: 'Ticket booked successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error booking ticket', error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const availableMovies = [
  { id: 1, title: 'Movie 1' },
  { id: 2, title: 'Movie 2' },
  { id: 3, title: 'Movie 3' },
  // Add more movies as needed
];

app.get('/movies', (req, res) => {
  res.json(availableMovies);
});
