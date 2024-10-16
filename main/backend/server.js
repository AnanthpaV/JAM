const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Place = require('./models/Place');
const User = require('./models/User');
const Booking = require('./models/Booking');
const ImageDownloader = require('image-downloader');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

function getUserDataFromToken(req){
    return new Promise((resolve,reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    })
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const newName = `photo_${Date.now()}${ext}`;
        cb(null, newName);
    }
});

const upload = multer({ storage });

const formatToTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const userData = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.json({
            userData: {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userData = await User.findOne({ email });
        if (userData) {
            const passwordMatch = bcrypt.compareSync(password, userData.password);
            if (passwordMatch) {
                jwt.sign({ email: userData.email, id: userData._id }, jwtSecret, {}, (error, token) => {
                    if (error) throw error;

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                    }).json(userData);
                });
            } else {
                res.status(400).json('Password is incorrect');
            }
        } else {
            res.status(404).json('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});
// Booking Routes Implementation
app.get('/bookings/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id).populate('place');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
});

// POST to cancel a booking (updates status to 'Cancelled')
app.post('/bookings/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update the booking's status to 'Cancelled'
        booking.status = 'Cancelled';
        await booking.save(); // Make sure to save the update

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

// GET all bookings for the logged-in user
app.get('/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromToken(req);
        const bookings = await Booking.find({ user: userData.id }).populate('place');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// POST to create a new booking
app.post('/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromToken(req);
        const { place, checkIn, checkOut, name, guests, phone, price } = req.body;

        // Create and save a new booking
        const booking = await Booking.create({
            place,
            checkIn,
            checkOut,
            name,
            guests,
            phone,
            price,
            user: userData.id,
            status: 'Pending', // Default status on creation
        });

        res.json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Booking creation failed', error: error.message });
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out' });
});

app.post('/places', (req, res) => {
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

    // Ensure checkIn and checkOut are full Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;

        const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn: checkInDate, // Store the full Date object
            checkOut: checkOutDate, // Store the full Date object
            maxGuests,
            price,
        });

        res.json(placeDoc);
    });
});


app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Place.find({ owner: id }));
    });
});

app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    const place = await Place.findById(id);

    if (place) {
        const formattedCheckIn = formatToTime(place.checkIn);
        const formattedCheckOut = formatToTime(place.checkOut);

        res.json({
            ...place.toObject(),
            checkIn: formattedCheckIn,
            checkOut: formattedCheckOut,
        });
    } else {
        res.status(404).json({ message: 'Place not found' });
    }
});

app.put('/places/:id', async (req, res) => {
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    const { id } = req.params;

    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userData = jwt.verify(token, jwtSecret);

        const placeDoc = await Place.findById(id);
        if (!placeDoc) {
            return res.status(404).json({ message: "Place not found" });
        }

        if (placeDoc.owner.toString() !== userData.id) {
            return res.status(403).json({ message: "Forbidden: You are not the owner" });
        }

        if (!title || !address || !description || !checkIn || !checkOut || !maxGuests || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate checkIn and checkOut are valid date-time strings (not just HH:mm format)
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate.getTime())) {
            return res.status(400).json({ message: "Invalid checkIn date" });
        }

        if (isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: "Invalid checkOut date" });
        }

        // Prepare the data to update
        const updateData = {
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn: checkInDate, // Store the full Date object
            checkOut: checkOutDate, // Store the full Date object
            maxGuests,
            price
        };

        const updatedPlace = await Place.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPlace) {
            return res.status(404).json({ message: "Failed to update place" });
        }

        res.json(updatedPlace);
    } catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ message: "Error updating place", error: error.message });
    }
});
app.get('/places/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid place ID format' });
    }

    try {
        const place = await Place.findById(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.json(place);
    } catch (error) {
        console.error('Error fetching place:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/places', async (req, res) => {
    res.json(await Place.find());
});

app.post('/upload', upload.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        for (let i = 0; i < req.files.length; i++) {
            const { path: tempPath, originalname } = req.files[i];
            const ext = path.extname(originalname);
            const baseName = 'photo_' + Date.now();
            const newPath = path.join(__dirname, 'uploads', baseName + ext);

            fs.renameSync(tempPath, newPath);

            uploadedFiles.push(path.basename(newPath));
        }

        const fileUrls = uploadedFiles.map(file => `http://localhost:3000/uploads/${file}`);

        res.json(fileUrls);
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ message: 'Photo upload failed' });
    }
});

app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const destPath = path.join(__dirname, 'uploads', newName);

    try {
        await ImageDownloader.image({
            url: link,
            dest: destPath,
        });

        const fullUrl = `http://localhost:3000/uploads/${newName}`;
        res.json(fullUrl);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ message: 'Image download failed' });
    }
});

/* app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromToken(req);
    try {
      const { place, checkIn, checkOut, name, guests, phone, price } = req.body;
      const booking = await Booking.create({
        place, checkIn, checkOut, name, guests, phone, price,user:userData.id,
      });
      res.json(booking);
    } catch (err) {
      console.error('Error creating booking:', err);
      res.status(500).json({ message: 'Booking creation failed' });
    }
}); */


app.get('/api/search', async (req, res) => {
    const { query, checkIn, checkOut, guests } = req.query;
    try {
        const regex = new RegExp(query, 'i'); // Case-insensitive regex for searching
        const places = await Place.find({
            $or: [
                { title: regex },
                { address: regex },
                { description: regex }
            ],
            maxGuests: { $gte: parseInt(guests) || 1 }
        }).limit(10);

        // Assuming you have implemented this logic in `isAvailable`
        const availablePlaces = places.filter(place => isAvailable(place, checkIn, checkOut));

        const formattedResults = availablePlaces.map(place => ({
            id: place._id,
            title: place.title,
            address: place.address,
            photo: place.photos[0] || null,
            price: place.price,
            rating: place.rating || Math.floor(Math.random() * 5) + 1
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ message: 'An error occurred during search' });
    }
});



app.get('/api/nearby', async (req, res) => {
    const { address } = req.query;
    try {
        const nearbyPlaces = await Place.find({
            address: { $regex: new RegExp(address.split(',')[0], 'i') }
        }).limit(5);

        const formattedResults = nearbyPlaces.map(place => ({
            id: place._id,
            title: place.title,
            address: place.address,
            photo: place.photos[0] || null,
            price: place.price,
            rating: place.rating || Math.floor(Math.random() * 5) + 1
        }));
        res.json(formattedResults);
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        res.status(500).json({ message: 'An error occurred while fetching nearby places' });
    }
});

function isAvailable(place, checkIn, checkOut) {
    return true;
}

app.get('/bookings',async (req,res)=>{
    const userData = await getUserDataFromToken(req);
    res.json(await Booking.find({user:userData.id}).populate('place'))
});
app.get('/test', (req, res) => {
    res.send('Hello world');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
