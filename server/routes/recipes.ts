/**
 * Rotas para Módulo de Receitas
 * 
 * Permite criar, editar e gerenciar receitas com cálculo automático de valores nutricionais.
 */

import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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
// SECURITY: Sanitização de erros para não expor stack traces
// ===========================================
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const sanitizeError = (error: unknown, isProduction: boolean): string => {
  if (!isProduction && error instanceof Error) {
    return error.message;
  }
  return 'Erro interno do servidor';
};

// ===========================================
// SECURITY: Whitelist de campos permitidos para queries dinâmicas
// ===========================================
const ALLOWED_RECIPE_FIELDS = [
  'consultancy_id', 'created_by', 'name', 'description', 'category', 'preparation_time',
  'cooking_time', 'difficulty', 'servings', 'serving_size', 'instructions', 'tips',
  'is_gluten_free', 'is_lactose_free', 'is_vegan', 'is_vegetarian', 'is_low_carb',
  'is_high_protein', 'image_url', 'is_global', 'is_public', 'total_calories',
  'total_protein', 'total_carbs', 'total_fat', 'total_fiber', 'calories_per_serving',
  'protein_per_serving', 'carbs_per_serving', 'fat_per_serving', 'fiber_per_serving'
];

// Função para filtrar apenas campos permitidos
const filterAllowedFields = (data: Record<string, any>, allowedFields: string[]): Record<string, any> => {
  const filtered: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      filtered[key] = data[key];
    }
  }
  return filtered;
};

interface Recipe {
  id?: number;
  consultancy_id: number;
  created_by: number;
  name: string;
  description?: string;
  category?: string;
  preparation_time?: number;
  cooking_time?: number;
  difficulty?: string;
  servings: number;
  serving_size?: string;
  instructions?: string;
  tips?: string;
  is_gluten_free?: boolean;
  is_lactose_free?: boolean;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_low_carb?: boolean;
  is_high_protein?: boolean;
  image_url?: string;
  is_global?: boolean;
  is_public?: boolean;
}

interface RecipeIngredient {
  id?: number;
  recipe_id: number;
  food_id?: number;
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  preparation_notes?: string;
  is_optional?: boolean;
  order_index?: number;
}

export function createRecipeRoutes(pool: Pool): Router {
  const router = Router();

  // ===========================================
  // SECURITY: Helper para verificar ownership de receita
  // ===========================================
  const verifyRecipeOwnership = async (recipeId: string, req: AuthenticatedRequest): Promise<boolean> => {
    // Superadmin pode acessar qualquer receita
    if (req.user?.role === 'superadmin') {
      return true;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT consultancy_id, is_global FROM recipes WHERE id = ?',
      [recipeId]
    );

    if (rows.length === 0) {
      return false; // Receita não existe
    }

    const recipe = rows[0];

    // Receitas globais não podem ser editadas/deletadas por usuários comuns
    if (recipe.is_global) {
      return false;
    }

    // Verificar se pertence à consultoria do usuário
    return recipe.consultancy_id === req.user?.consultancyId;
  };

  /**
   * Listar receitas
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { consultancy_id, category, search, include_global } = req.query;
      
      let query = `
        SELECT r.*, u.name as created_by_name,
               (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.id) as ingredient_count
        FROM recipes r
        JOIN users u ON r.created_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (consultancy_id) {
        if (include_global === 'true') {
          query += ' AND (r.consultancy_id = ? OR r.is_global = TRUE)';
        } else {
          query += ' AND r.consultancy_id = ?';
        }
        params.push(consultancy_id);
      }
      
      if (category) {
        query += ' AND r.category = ?';
        params.push(category);
      }
      
      if (search) {
        query += ' AND r.name LIKE ?';
        params.push(`%${search}%`);
      }
      
      query += ' ORDER BY r.name';
      
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Buscar receita completa com ingredientes
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar receita
      const [recipeRows] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, u.name as created_by_name
         FROM recipes r
         JOIN users u ON r.created_by = u.id
         WHERE r.id = ?`,
        [id]
      );
      
      if (recipeRows.length === 0) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }
      
      // Buscar ingredientes
      const [ingredientRows] = await pool.query<RowDataPacket[]>(
        `SELECT ri.*, fl.name as food_library_name, fl.category as food_category
         FROM recipe_ingredients ri
         LEFT JOIN food_library fl ON ri.food_id = fl.id
         WHERE ri.recipe_id = ?
         ORDER BY ri.order_index`,
        [id]
      );
      
      // Parse instructions se for JSON
      const recipe = recipeRows[0];
      if (recipe.instructions && typeof recipe.instructions === 'string') {
        try {
          recipe.instructions = JSON.parse(recipe.instructions);
        } catch (e) {
          // Keep as string
        }
      }
      
      res.json({
        ...recipe,
        ingredients: ingredientRows
      });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Criar receita
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { ingredients, ...recipeData } = req.body;
      
      // Stringify instructions se for array
      if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
        recipeData.instructions = JSON.stringify(recipeData.instructions);
      }
      
      // Calcular valores nutricionais totais
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;
      
      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          totalCalories += Number(ing.calories) || 0;
          totalProtein += Number(ing.protein) || 0;
          totalCarbs += Number(ing.carbs) || 0;
          totalFat += Number(ing.fat) || 0;
        }
      }
      
      // Valores por porção
      const servings = recipeData.servings || 1;
      recipeData.calories_per_serving = Math.round(totalCalories / servings);
      recipeData.protein_per_serving = Math.round((totalProtein / servings) * 10) / 10;
      recipeData.carbs_per_serving = Math.round((totalCarbs / servings) * 10) / 10;
      recipeData.fat_per_serving = Math.round((totalFat / servings) * 10) / 10;
      recipeData.fiber_per_serving = Math.round((totalFiber / servings) * 10) / 10;
      
      // Inserir receita
      // SECURITY: Filtrar apenas campos permitidos
      const filteredData = filterAllowedFields(recipeData, ALLOWED_RECIPE_FIELDS);
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para inserir' });
      }
      
      const placeholders = fields.map(() => '?').join(', ');
      
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO recipes (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const recipeId = result.insertId;
      
      // Inserir ingredientes
      if (ingredients && ingredients.length > 0) {
        for (let i = 0; i < ingredients.length; i++) {
          const ing = ingredients[i];
          await pool.query(
            `INSERT INTO recipe_ingredients 
             (recipe_id, food_id, name, quantity, unit, calories, protein, carbs, fat, 
              preparation_notes, is_optional, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [recipeId, ing.food_id, ing.name, ing.quantity, ing.unit,
             ing.calories, ing.protein, ing.carbs, ing.fat,
             ing.preparation_notes, ing.is_optional || false, i]
          );
        }
      }
      
      res.status(201).json({ 
        id: recipeId, 
        message: 'Receita criada com sucesso',
        nutrition_per_serving: {
          calories: recipeData.calories_per_serving,
          protein: recipeData.protein_per_serving,
          carbs: recipeData.carbs_per_serving,
          fat: recipeData.fat_per_serving
        }
      });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Atualizar receita
   */
  router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // SECURITY: Verificar ownership da receita
      const hasAccess = await verifyRecipeOwnership(id, req);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Você não tem permissão para editar esta receita' });
      }
      
      const { ingredients, ...recipeData } = req.body;
      
      // Recalcular nutrição se ingredientes foram enviados
      if (ingredients && ingredients.length > 0) {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        
        for (const ing of ingredients) {
          totalCalories += Number(ing.calories) || 0;
          totalProtein += Number(ing.protein) || 0;
          totalCarbs += Number(ing.carbs) || 0;
          totalFat += Number(ing.fat) || 0;
        }
        
        const servings = recipeData.servings || 1;
        recipeData.calories_per_serving = Math.round(totalCalories / servings);
        recipeData.protein_per_serving = Math.round((totalProtein / servings) * 10) / 10;
        recipeData.carbs_per_serving = Math.round((totalCarbs / servings) * 10) / 10;
        recipeData.fat_per_serving = Math.round((totalFat / servings) * 10) / 10;
      }
      
      // Stringify instructions
      if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
        recipeData.instructions = JSON.stringify(recipeData.instructions);
      }
      
      // Atualizar receita
      // SECURITY: Filtrar apenas campos permitidos
      const filteredData = filterAllowedFields(recipeData, ALLOWED_RECIPE_FIELDS);
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
      }
      
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      
      await pool.query(
        `UPDATE recipes SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      // Atualizar ingredientes se enviados
      if (ingredients) {
        // Deletar ingredientes existentes
        await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
        
        // Inserir novos
        for (let i = 0; i < ingredients.length; i++) {
          const ing = ingredients[i];
          await pool.query(
            `INSERT INTO recipe_ingredients 
             (recipe_id, food_id, name, quantity, unit, calories, protein, carbs, fat, 
              preparation_notes, is_optional, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ing.food_id, ing.name, ing.quantity, ing.unit,
             ing.calories, ing.protein, ing.carbs, ing.fat,
             ing.preparation_notes, ing.is_optional || false, i]
          );
        }
      }
      
      res.json({ message: 'Receita atualizada' });
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Deletar receita
   */
  router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // SECURITY: Verificar ownership da receita
      const hasAccess = await verifyRecipeOwnership(id, req);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir esta receita' });
      }
      
      await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
      res.json({ message: 'Receita excluída' });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Duplicar receita
   */
  router.post('/:id/duplicate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { consultancy_id, created_by } = req.body;
      
      // Buscar receita original
      const [recipeRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );
      
      if (recipeRows.length === 0) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }
      
      const original = recipeRows[0];
      
      // Criar cópia
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO recipes 
         (consultancy_id, created_by, name, description, category, preparation_time, 
          cooking_time, difficulty, servings, serving_size, instructions, tips,
          calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving,
          fiber_per_serving, is_gluten_free, is_lactose_free, is_vegan, is_vegetarian,
          is_low_carb, is_high_protein, image_url, is_global, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
        [consultancy_id, created_by, `${original.name} (Cópia)`, original.description,
         original.category, original.preparation_time, original.cooking_time,
         original.difficulty, original.servings, original.serving_size,
         original.instructions, original.tips, original.calories_per_serving,
         original.protein_per_serving, original.carbs_per_serving, original.fat_per_serving,
         original.fiber_per_serving, original.is_gluten_free, original.is_lactose_free,
         original.is_vegan, original.is_vegetarian, original.is_low_carb,
         original.is_high_protein, original.image_url]
      );
      
      const newRecipeId = result.insertId;
      
      // Copiar ingredientes
      const [ingredientRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
        [id]
      );
      
      for (const ing of ingredientRows) {
        await pool.query(
          `INSERT INTO recipe_ingredients 
           (recipe_id, food_id, name, quantity, unit, calories, protein, carbs, fat, 
            preparation_notes, is_optional, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newRecipeId, ing.food_id, ing.name, ing.quantity, ing.unit,
           ing.calories, ing.protein, ing.carbs, ing.fat,
           ing.preparation_notes, ing.is_optional, ing.order_index]
        );
      }
      
      res.status(201).json({ id: newRecipeId, message: 'Receita duplicada' });
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Buscar categorias de receitas
   */
  router.get('/categories/list', async (_req: Request, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT category, COUNT(*) as count 
         FROM recipes 
         WHERE category IS NOT NULL 
         GROUP BY category 
         ORDER BY count DESC`
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  return router;
}
