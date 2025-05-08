import { Router } from 'express';
import { body } from 'express-validator';
import { SongRepository } from '../db/repositories/song.repository';
import { authenticateJWT, checkRoles } from '../middlewares/auth';
import { SongService } from '../services/song.servoces';
import { SongController } from '../controllers/song.controller';

const router = Router();

const songService = new SongService(new SongRepository());
const songsController = new SongController(songService);

// Validation for creating a song
const validateSong = [
  body('title').notEmpty().withMessage('Title is required'),
  body('artist_id').notEmpty().withMessage('Artist ID is required'),
  body('genre').optional().isString().withMessage('Genre must be a string'),
  body('album_name').optional().isString().withMessage('album name must be a string'),

];

// Routes
router.route('/')
  .post(authenticateJWT, checkRoles('super_admin', 'artist_manager', "artist"), validateSong, songsController.createSong.bind(songsController)); // Create a new song

router.route('/:id')
  .get(authenticateJWT, songsController.getSongById.bind(songsController)) // Get single song
  .patch(authenticateJWT, checkRoles('super_admin', 'artist_manager', "artist"), validateSong, songsController.updateSong.bind(songsController)) // Update song
  .delete(authenticateJWT, checkRoles('super_admin', "artist"), songsController.deleteSong.bind(songsController)); // Delete song

router.route("/artist/:artistId").get(authenticateJWT, checkRoles('super_admin', 'artist_manager',"artist"), songsController.getSongByArtistId.bind(songsController))
export default router;
