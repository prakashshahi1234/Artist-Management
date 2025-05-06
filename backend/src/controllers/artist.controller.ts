import { Request, Response } from 'express';
import { ArtistService } from '../services/artist.services';
import {Parser} from 'json2csv'
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

export class ArtistController {
  constructor(private artistService: ArtistService) {}


  

  async getAllArtists(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;

      const artists = await this.artistService.getAllArtists(limit, offset);
      const total = await this.artistService.countAllArtist();

      res.status(200).json({
        success: true,
        data: artists,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          perPage: limit,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch artists',
      });
    }
  }

  async getArtistById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const artist = await this.artistService.getArtistById(parseInt(id));

      if (!artist) {
         res.status(404).json({
          success: false,
          message: 'Artist not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: artist,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch artist',
      });
    }
  }

  async updateArtist(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      if(data?.dob){
        data.dob = new Date(data?.dob)
       }

      const updated = await this.artistService.updateArtist(parseInt(id), data);

      res.status(200).json({
        success: true,
        message: 'Artist updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to update artist',
      });
    }
  }

  async deleteArtist(req: Request, res: Response) {
    try {
      const { id } = req.params;
    
      await this.artistService.deleteArtist(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Artist deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to delete artist',
      });
    }
  }


  async downloadArtistsCSV(req: Request, res: Response) {
    try {
      const artists = await this.artistService.getAllArtists(); // Make sure this gets all without limit/offset
  
      if (!artists || artists.length === 0) {
         res.status(404).json({
          success: false,
          message: 'No artists found to export',
        });
        return;
      }
  
      const fields = Object.keys(artists[0]); // Dynamic field detection
      const parser = new Parser({ fields });
      const csv = parser.parse(artists);
  
      res.header('Content-Type', 'text/csv');
      res.attachment('artists.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to export artists to CSV',
      });
    }
  }


  async importArtists(req: Request, res: Response) {
    try {
        // @ts-ignore
      const file = req.file
      if (!file) {
         res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const filePath = path.join(__dirname, '../../uploads', file?.filename);
      const artists: any[] = [];

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            console.log(row)
            if (row.name) {
              artists.push({
                name: row.name,
                dob: row.dob ? new Date(row.dob) : null,
                gender: row.gender || null,
                address: row.address || null,
                first_release_year: row.first_release_year ? parseInt(row.first_release_year) : null,
                no_of_album_released: row.no_of_album_released ? parseInt(row.no_of_album_released) : 0,
                user_id: (row.user_id) || null,
              });
            }
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      let successCount = 0;
      let failureCount = 0;

      for (const artistData of artists) {
        try {
          await this.artistService.createArtist(artistData);
          successCount++;
        } catch (err) {
            console.log(err)
          failureCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Import completed: ${successCount} succeeded, ${failureCount} failed.`,
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to import artists from CSV',
      });
    }
  }
  
}
