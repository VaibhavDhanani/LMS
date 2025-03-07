import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  headline :{
    type: String,
  },
  biography : {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isInstructor: {
    type: Boolean,
    default: false,
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  createdCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  isVerified: {
    type: mongoose.Schema.Types.Boolean,
    default: false,
  },
  profilePicture: {
    type: String, // Store a URL or a file path
    default: '',
  },
});

const User = mongoose.model('User', userSchema);
export default User;
