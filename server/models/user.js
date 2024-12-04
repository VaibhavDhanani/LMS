import mongoose from "mongoose";

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
  isTeacher:{
    type: Boolean,
    default: false,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
//   likedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], 
//   unlikedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  isVerified: { 
    type: mongoose.Schema.Types.Boolean,
    default: false,
  } ,
  profilePicture: {
    type: String, // Store a URL or a file path
    default: '',
  },
  
});

const User = mongoose.model('User', userSchema);
export default User;
