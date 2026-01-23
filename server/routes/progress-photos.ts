/**
 * Rotas para Fotos de Progresso
 * 
 * Upload, compactação e gerenciamento de fotos de evolução dos pacientes.
 * As imagens são compactadas automaticamente no upload para economizar espaço.
 */

import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// ===========================================
// SECURITY: Tipos para autenticação
// ===========================================
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    consultancyId?: number;
  };
}

// ===========================================
// SECURITY: Sanitização de erros
// ===========================================
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const sanitizeError = (error: unknown, isProduction: boolean): string => {
  if (!isProduction && error instanceof Error) {
    return error.message;
  }
  return 'Erro interno do servidor';
};

// ===========================================
// Configurações de upload
// ===========================================
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/progress-photos';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limite original
const COMPRESSION_QUALITY = 80; // Qualidade JPEG após compressão (0-100)
const MAX_WIDTH = 1920; // Largura máxima após redimensionamento
const MAX_HEIGHT = 1920; // Altura máxima após redimensionamento
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Categorias válidas
const VALID_CATEGORIES = ['frente', 'costas', 'lateral_esquerda', 'lateral_direita', 'outro'];

export function createProgressPhotosRoutes(pool: Pool): Router {
  const router = Router();

  // Garantir que o diretório de upload existe
  const ensureUploadDir = () => {
    const fullPath = path.resolve(UPLOAD_DIR);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  };

  /**
   * Listar fotos de um atleta
   */
  router.get('/:athleteId', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      const { category, startDate, endDate } = req.query;
      
      let query = `
        SELECT pp.*, u.name as uploaded_by_name
        FROM progress_photos pp
        JOIN users u ON pp.uploaded_by = u.id
        WHERE pp.athlete_id = ?
      `;
      const params: any[] = [athleteId];
      
      if (category && VALID_CATEGORIES.includes(category as string)) {
        query += ' AND pp.category = ?';
        params.push(category);
      }
      
      if (startDate) {
        query += ' AND pp.photo_date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND pp.photo_date <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY pp.photo_date DESC, pp.created_at DESC';
      
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Buscar foto específica
   */
  router.get('/photo/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT pp.*, u.name as uploaded_by_name
         FROM progress_photos pp
         JOIN users u ON pp.uploaded_by = u.id
         WHERE pp.id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Foto não encontrada' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching photo:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Upload de foto com compactação
   * Aceita multipart/form-data com campo 'photo'
   */
  router.post('/upload', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uploadDir = ensureUploadDir();
      
      // Verificar se há arquivo no body (base64)
      const { 
        athlete_id, 
        photo_date, 
        category = 'frente', 
        weight, 
        body_fat_percentage, 
        notes,
        image_data, // Base64 da imagem
        original_filename,
        mime_type = 'image/jpeg'
      } = req.body;
      
      if (!athlete_id || !image_data) {
        return res.status(400).json({ error: 'athlete_id e image_data são obrigatórios' });
      }
      
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Categoria inválida' });
      }
      
      // Decodificar base64
      const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
      const originalBuffer = Buffer.from(base64Data, 'base64');
      const originalSize = originalBuffer.length;
      
      if (originalSize > MAX_FILE_SIZE) {
        return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB' });
      }
      
      // Gerar nome único para o arquivo
      const fileId = randomUUID();
      const filename = `${fileId}.jpg`;
      const filePath = path.join(uploadDir, filename);
      
      let compressedBuffer: Buffer;
      let width: number = 0;
      let height: number = 0;
      
      try {
        // Tentar usar sharp para compactação
        const sharp = (await import('sharp')).default;
        
        const image = sharp(originalBuffer);
        const metadata = await image.metadata();
        
        // Redimensionar se necessário mantendo proporção
        let resizeOptions: { width?: number; height?: number } = {};
        if (metadata.width && metadata.height) {
          if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
            if (metadata.width > metadata.height) {
              resizeOptions.width = MAX_WIDTH;
            } else {
              resizeOptions.height = MAX_HEIGHT;
            }
          }
        }
        
        // Comprimir para JPEG com qualidade reduzida
        const processedImage = Object.keys(resizeOptions).length > 0
          ? image.resize(resizeOptions)
          : image;
        
        compressedBuffer = await processedImage
          .jpeg({ quality: COMPRESSION_QUALITY, mozjpeg: true })
          .toBuffer();
        
        // Obter dimensões finais
        const finalMetadata = await sharp(compressedBuffer).metadata();
        width = finalMetadata.width || 0;
        height = finalMetadata.height || 0;
        
      } catch (sharpError) {
        console.warn('Sharp não disponível, salvando sem compactação:', sharpError);
        // Fallback: salvar sem compactação
        compressedBuffer = originalBuffer;
      }
      
      // Salvar arquivo
      fs.writeFileSync(filePath, compressedBuffer);
      
      const finalSize = compressedBuffer.length;
      const compressionRatio = Math.round((1 - finalSize / originalSize) * 100);
      
      // Salvar no banco
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO progress_photos 
         (athlete_id, uploaded_by, photo_date, category, filename, original_filename, 
          file_path, file_size, original_size, mime_type, width, height, 
          weight, body_fat_percentage, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          athlete_id,
          req.user?.userId || 1,
          photo_date || new Date().toISOString().split('T')[0],
          category,
          filename,
          original_filename || 'photo.jpg',
          `/uploads/progress-photos/${filename}`,
          finalSize,
          originalSize,
          'image/jpeg',
          width,
          height,
          weight || null,
          body_fat_percentage || null,
          notes || null
        ]
      );
      
      res.status(201).json({
        id: result.insertId,
        message: 'Foto enviada com sucesso',
        filename,
        file_path: `/uploads/progress-photos/${filename}`,
        original_size: originalSize,
        compressed_size: finalSize,
        compression_ratio: `${compressionRatio}%`,
        dimensions: { width, height }
      });
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Atualizar metadados da foto
   */
  router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { photo_date, category, weight, body_fat_percentage, notes } = req.body;
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (photo_date) {
        updates.push('photo_date = ?');
        values.push(photo_date);
      }
      
      if (category && VALID_CATEGORIES.includes(category)) {
        updates.push('category = ?');
        values.push(category);
      }
      
      if (weight !== undefined) {
        updates.push('weight = ?');
        values.push(weight || null);
      }
      
      if (body_fat_percentage !== undefined) {
        updates.push('body_fat_percentage = ?');
        values.push(body_fat_percentage || null);
      }
      
      if (notes !== undefined) {
        updates.push('notes = ?');
        values.push(notes);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE progress_photos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      res.json({ message: 'Foto atualizada' });
    } catch (error) {
      console.error('Error updating photo:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Excluir foto
   */
  router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar info do arquivo antes de deletar
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT filename FROM progress_photos WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Foto não encontrada' });
      }
      
      const filename = rows[0].filename;
      const filePath = path.resolve(UPLOAD_DIR, filename);
      
      // Deletar do banco
      await pool.query('DELETE FROM progress_photos WHERE id = ?', [id]);
      
      // Deletar arquivo físico
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json({ message: 'Foto excluída' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Estatísticas de fotos de um atleta
   */
  router.get('/:athleteId/stats', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           COUNT(*) as total_photos,
           SUM(file_size) as total_size,
           SUM(original_size) as original_total_size,
           MIN(photo_date) as first_photo_date,
           MAX(photo_date) as last_photo_date,
           COUNT(DISTINCT category) as categories_used
         FROM progress_photos
         WHERE athlete_id = ?`,
        [athleteId]
      );
      
      const stats = rows[0];
      const savedBytes = (stats.original_total_size || 0) - (stats.total_size || 0);
      const savingsPercent = stats.original_total_size 
        ? Math.round((savedBytes / stats.original_total_size) * 100) 
        : 0;
      
      res.json({
        total_photos: stats.total_photos || 0,
        total_size_mb: Math.round((stats.total_size || 0) / 1024 / 1024 * 100) / 100,
        space_saved_mb: Math.round(savedBytes / 1024 / 1024 * 100) / 100,
        compression_savings: `${savingsPercent}%`,
        first_photo_date: stats.first_photo_date,
        last_photo_date: stats.last_photo_date,
        categories_used: stats.categories_used || 0
      });
    } catch (error) {
      console.error('Error fetching photo stats:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  return router;
}
