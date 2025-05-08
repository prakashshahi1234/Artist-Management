import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Song } from '../repositories/song.repotype';
import { SongService } from '../services/song.servoces';

export class SongController {
  constructor(private songService: SongService) {}

  async createSong(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    try {
      const {
        title,
        artist_id,
        album_name,
        genre,
      } = req.body;
      console.log(req.body)
      const songId = await this.songService.createSong({
        title,
        artist_id,
        album_name,
        genre,
      });

      

      res.status(201).json({
        success: true,
        message: 'Song created successfully',
        data: { id: songId },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to create song',
      });
    }
  }

  async getSongById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const song = await this.songService.getSongById(parseInt(id));

      if (!song) {
         res.status(404).json({
          success: false,
          message: 'Song not found',
        });
        return;
      }

      res.json({
        success: true,
        data: song,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch song',
      });
    }
  }


  async updateSong(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: Partial<Song> = req.body;

      const updatedSong = await this.songService.updateSong(parseInt(id), data);

      res.status(200).json({
        success: true,
        message: 'Song updated successfully',
        data: updatedSong,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to update song',
      });
    }
  }

  async deleteSong(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await this.songService.deleteSong(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Song deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to delete song',
      });
    }
  }


  async getSongByArtistId(req: Request, res: Response) {
    try {
      const { artistId } = req.params;
      const { limit = 10, page = 1 } = req.query;
      
      // Parse query parameters
      const limitParsed = parseInt(limit as string, 10);
      const pageParsed = parseInt(page as string, 10);
      
      // Calculate offset from page number
      const offsetParsed = (pageParsed - 1) * limitParsed;
      
      // Get songs using the service
      const { songs, pagination } = await this.songService.getSongsByArtist(
        parseInt(artistId),
        limitParsed,
        offsetParsed
      );
      
      // Handle empty results
      if (!songs || songs.length === 0) {
         res.status(200).json({
          success: true,
          data: [],
          pagination: {
            totalSongs: 0,
            totalPages: 0,
            currentPage: pageParsed,
            perPage: limitParsed,
          },
        });
        return;
      }
      
      // Format pagination to match frontend expectations
      const formattedPagination = {
        ...pagination,
        currentPage: pageParsed,
        perPage: limitParsed,
        // Make sure totalPages is calculated correctly
        totalPages: Math.ceil(pagination.totalPages / limitParsed)
      };
      
     
       res.json({
        success: true,
        data: songs,
        pagination: formattedPagination,
      });
      
    } catch (error: any) {
       res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch songs',
      });
    }
  }
  
  
}
