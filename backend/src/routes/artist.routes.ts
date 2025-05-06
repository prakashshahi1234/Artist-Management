import { Router } from 'express';
import { body, param } from 'express-validator';
import { ArtistController } from '../controllers/artist.controller';
import { ArtistService } from '../services/artist.services';
import { ArtistRepository } from '../db/repositories/artist.repository';
import { authenticateJWT, checkRoles } from '../middlewares/auth';
import { upload } from '../utils/multer';

const router = Router();

// Service & Controller setup
const artistService = new ArtistService(new ArtistRepository());
const artistController = new ArtistController(artistService);



const validateArtistId = [
  param('id').isMongoId().withMessage('Invalid artist ID'),
];


router.get(
  '/',
  authenticateJWT,
  checkRoles('super_admin', 'artist_manager', 'artist'),
  artistController.getAllArtists.bind(artistController)
);

router.get(
  '/:id',
  authenticateJWT,
  checkRoles('super_admin', 'artist_manager', 'artist'),
  validateArtistId,
  artistController.getArtistById.bind(artistController)
);

router.patch(
  '/:id',
  authenticateJWT,
  checkRoles('super_admin', 'artist_manager'),
  validateArtistId,
  artistController.updateArtist.bind(artistController)
);

router.delete(
  '/:id',
  authenticateJWT,
  checkRoles('super_admin', "artist_manager"),
  validateArtistId,
  artistController.deleteArtist.bind(artistController)
);

router.route('/download/csv').get(authenticateJWT, checkRoles("super_admin", "artist_manager"),  artistController.downloadArtistsCSV.bind(artistController));
router.post('/import/csv',authenticateJWT, checkRoles("super_admin", "artist_manager"),  upload.single('file'), artistController.importArtists.bind(artistController));


export default router;
