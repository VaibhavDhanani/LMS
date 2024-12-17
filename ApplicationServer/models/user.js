import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  //   likedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  //   unlikedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
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
