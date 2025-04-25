import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bio: String,
  imageUrl: String,
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
