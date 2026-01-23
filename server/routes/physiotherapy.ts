import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// ===========================================
// Tipos
// ===========================================
interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

interface PhysioEvaluation extends RowDataPacket {
  id: number;
  athlete_id: number;
  physio_id: number;
  evaluation_date: string;
  chief_complaint: string;
  pain_location: string;
  pain_scale_eva: number;
  physio_diagnosis: string;
}

interface PhysioTreatmentPlan extends RowDataPacket {
  id: number;
  athlete_id: number;
  name: string;
  condition_treated: string;
  status: string;
  start_date: string;
  completed_sessions: number;
  total_sessions: number;
}

interface PhysioExercise extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  category: string;
  body_region: string;
  difficulty: string;
}

// ===========================================
// Função para criar as rotas
// ===========================================
export function createPhysiotherapyRoutes(pool: Pool) {
  const router = Router();

  // =========================================
  // AVALIAÇÕES FISIOTERAPÊUTICAS
  // =========================================
  
  // Listar avaliações de um atleta
  router.get('/evaluations/:athleteId', async (req: AuthRequest, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [evaluations] = await pool.query<PhysioEvaluation[]>(
        `SELECT pe.*, u.name as physio_name
         FROM physio_evaluations pe
         JOIN users u ON pe.physio_id = u.id
         WHERE pe.athlete_id = ?
         ORDER BY pe.evaluation_date DESC`,
        [athleteId]
      );
      
      res.json(evaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
  });

  // Obter uma avaliação específica
  router.get('/evaluation/:id', async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const [evaluations] = await pool.query<PhysioEvaluation[]>(
        `SELECT pe.*, u.name as physio_name
         FROM physio_evaluations pe
         JOIN users u ON pe.physio_id = u.id
         WHERE pe.id = ?`,
        [id]
      );
      
      if (evaluations.length === 0) {
        return res.status(404).json({ error: 'Avaliação não encontrada' });
      }
      
      res.json(evaluations[0]);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      res.status(500).json({ error: 'Erro ao buscar avaliação' });
    }
  });

  // Criar nova avaliação
  router.post('/evaluations', async (req: AuthRequest, res: Response) => {
    try {
      const {
        athlete_id,
        evaluation_date,
        chief_complaint,
        pain_location,
        pain_onset,
        pain_duration,
        pain_type,
        pain_triggers,
        pain_relief,
        previous_treatments,
        medical_history,
        medications,
        surgeries,
        lifestyle,
        posture_assessment,
        gait_analysis,
        range_of_motion,
        muscle_strength,
        special_tests,
        palpation_findings,
        neurological_exam,
        pain_scale_eva,
        functional_score,
        physio_diagnosis,
        icd_code,
        prognosis,
        short_term_goals,
        long_term_goals,
        notes
      } = req.body;

      const physio_id = req.user?.userId;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO physio_evaluations (
          athlete_id, physio_id, evaluation_date, chief_complaint, pain_location,
          pain_onset, pain_duration, pain_type, pain_triggers, pain_relief,
          previous_treatments, medical_history, medications, surgeries, lifestyle,
          posture_assessment, gait_analysis, range_of_motion, muscle_strength, special_tests,
          palpation_findings, neurological_exam, pain_scale_eva, functional_score,
          physio_diagnosis, icd_code, prognosis, short_term_goals, long_term_goals, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          athlete_id, physio_id, evaluation_date || new Date(), chief_complaint, pain_location,
          pain_onset, pain_duration, pain_type, pain_triggers, pain_relief,
          previous_treatments, medical_history, medications, surgeries, lifestyle,
          posture_assessment, gait_analysis, JSON.stringify(range_of_motion), JSON.stringify(muscle_strength), JSON.stringify(special_tests),
          palpation_findings, neurological_exam, pain_scale_eva, functional_score,
          physio_diagnosis, icd_code, prognosis, short_term_goals, long_term_goals, notes
        ]
      );

      res.status(201).json({ id: result.insertId, message: 'Avaliação criada com sucesso' });
    } catch (error) {
      console.error('Error creating evaluation:', error);
      res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
  });

  // Atualizar avaliação
  router.put('/evaluations/:id', async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const fields = req.body;
      
      // Construir query dinamicamente
      const updates: string[] = [];
      const values: any[] = [];
      
      const allowedFields = [
        'chief_complaint', 'pain_location', 'pain_onset', 'pain_duration', 'pain_type',
        'pain_triggers', 'pain_relief', 'previous_treatments', 'medical_history', 'medications',
        'surgeries', 'lifestyle', 'posture_assessment', 'gait_analysis', 'range_of_motion',
        'muscle_strength', 'special_tests', 'palpation_findings', 'neurological_exam',
        'pain_scale_eva', 'functional_score', 'physio_diagnosis', 'icd_code', 'prognosis',
        'short_term_goals', 'long_term_goals', 'notes'
      ];
      
      for (const field of allowedFields) {
        if (fields[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(typeof fields[field] === 'object' ? JSON.stringify(fields[field]) : fields[field]);
        }
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE physio_evaluations SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      res.json({ message: 'Avaliação atualizada com sucesso' });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      res.status(500).json({ error: 'Erro ao atualizar avaliação' });
    }
  });

  // =========================================
  // PROTOCOLOS DE TRATAMENTO
  // =========================================
  
  // Listar protocolos de um atleta
  router.get('/treatment-plans/:athleteId', async (req: AuthRequest, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [plans] = await pool.query<PhysioTreatmentPlan[]>(
        `SELECT ptp.*, u.name as physio_name,
         (SELECT COUNT(*) FROM rehab_sessions rs WHERE rs.treatment_plan_id = ptp.id) as sessions_count
         FROM physio_treatment_plans ptp
         JOIN users u ON ptp.physio_id = u.id
         WHERE ptp.athlete_id = ?
         ORDER BY ptp.start_date DESC`,
        [athleteId]
      );
      
      res.json(plans);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      res.status(500).json({ error: 'Erro ao buscar protocolos' });
    }
  });

  // Listar todos os protocolos ativos da consultoria
  router.get('/treatment-plans', async (req: AuthRequest, res: Response) => {
    try {
      const { consultancy_id, status } = req.query;
      
      let query = `
        SELECT ptp.*, u.name as physio_name, a.id as athlete_id,
               usr.name as patient_name, usr.email as patient_email
        FROM physio_treatment_plans ptp
        JOIN users u ON ptp.physio_id = u.id
        JOIN athletes a ON ptp.athlete_id = a.id
        JOIN users usr ON a.user_id = usr.id
        WHERE a.consultancy_id = ?
      `;
      const params: any[] = [consultancy_id];
      
      if (status) {
        query += ' AND ptp.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY ptp.start_date DESC';
      
      const [plans] = await pool.query<PhysioTreatmentPlan[]>(query, params);
      
      res.json(plans);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      res.status(500).json({ error: 'Erro ao buscar protocolos' });
    }
  });

  // Criar protocolo de tratamento
  router.post('/treatment-plans', async (req: AuthRequest, res: Response) => {
    try {
      const {
        athlete_id,
        evaluation_id,
        name,
        condition_treated,
        start_date,
        estimated_end_date,
        frequency,
        total_sessions,
        techniques,
        home_exercises,
        precautions
      } = req.body;

      const physio_id = req.user?.userId;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO physio_treatment_plans (
          athlete_id, physio_id, evaluation_id, name, condition_treated,
          start_date, estimated_end_date, frequency, total_sessions,
          techniques, home_exercises, precautions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          athlete_id, physio_id, evaluation_id, name, condition_treated,
          start_date || new Date(), estimated_end_date, frequency, total_sessions,
          JSON.stringify(techniques), JSON.stringify(home_exercises), precautions
        ]
      );

      res.status(201).json({ id: result.insertId, message: 'Protocolo criado com sucesso' });
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      res.status(500).json({ error: 'Erro ao criar protocolo' });
    }
  });

  // Atualizar protocolo
  router.put('/treatment-plans/:id', async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, completed_sessions, discharge_notes, actual_end_date, ...otherFields } = req.body;
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (status) { updates.push('status = ?'); values.push(status); }
      if (completed_sessions !== undefined) { updates.push('completed_sessions = ?'); values.push(completed_sessions); }
      if (discharge_notes) { updates.push('discharge_notes = ?'); values.push(discharge_notes); }
      if (actual_end_date) { updates.push('actual_end_date = ?'); values.push(actual_end_date); }
      
      const textFields = ['name', 'condition_treated', 'frequency', 'total_sessions', 'precautions'];
      for (const field of textFields) {
        if (otherFields[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(otherFields[field]);
        }
      }
      
      if (otherFields.techniques) { updates.push('techniques = ?'); values.push(JSON.stringify(otherFields.techniques)); }
      if (otherFields.home_exercises) { updates.push('home_exercises = ?'); values.push(JSON.stringify(otherFields.home_exercises)); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE physio_treatment_plans SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      res.json({ message: 'Protocolo atualizado com sucesso' });
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      res.status(500).json({ error: 'Erro ao atualizar protocolo' });
    }
  });

  // =========================================
  // SESSÕES
  // =========================================
  
  // Listar sessões de um atleta ou protocolo
  router.get('/sessions/:athleteId', async (req: AuthRequest, res: Response) => {
    try {
      const { athleteId } = req.params;
      const { treatment_plan_id } = req.query;
      
      let query = `
        SELECT rs.*, u.name as physio_name
        FROM rehab_sessions rs
        JOIN users u ON rs.physio_id = u.id
        WHERE rs.athlete_id = ?
      `;
      const params: any[] = [athleteId];
      
      if (treatment_plan_id) {
        query += ' AND rs.treatment_plan_id = ?';
        params.push(treatment_plan_id);
      }
      
      query += ' ORDER BY rs.session_date DESC';
      
      const [sessions] = await pool.query(query, params);
      
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Erro ao buscar sessões' });
    }
  });

  // Criar sessão
  router.post('/sessions', async (req: AuthRequest, res: Response) => {
    try {
      const {
        athlete_id,
        treatment_plan_id,
        session_date,
        duration_minutes,
        injury_description,
        treatment,
        exercises,
        progress_notes,
        pain_before,
        pain_after,
        techniques_applied,
        patient_feedback,
        therapist_notes,
        next_session,
        status
      } = req.body;

      const physio_id = req.user?.userId;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO rehab_sessions (
          athlete_id, physio_id, treatment_plan_id, session_date, duration_minutes,
          injury_description, treatment, exercises, progress_notes,
          pain_before, pain_after, techniques_applied, patient_feedback, therapist_notes,
          next_session, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          athlete_id, physio_id, treatment_plan_id, session_date || new Date(), duration_minutes || 50,
          injury_description, treatment, exercises, progress_notes,
          pain_before, pain_after, techniques_applied, patient_feedback, therapist_notes,
          next_session, status || 'scheduled'
        ]
      );

      // Atualizar contador de sessões do protocolo
      if (treatment_plan_id && status === 'completed') {
        await pool.query(
          'UPDATE physio_treatment_plans SET completed_sessions = completed_sessions + 1 WHERE id = ?',
          [treatment_plan_id]
        );
      }

      res.status(201).json({ id: result.insertId, message: 'Sessão criada com sucesso' });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Erro ao criar sessão' });
    }
  });

  // Atualizar sessão
  router.put('/sessions/:id', async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const fields = req.body;
      
      // Buscar sessão atual para verificar mudança de status
      const [currentSession] = await pool.query<RowDataPacket[]>(
        'SELECT status, treatment_plan_id FROM rehab_sessions WHERE id = ?',
        [id]
      );
      
      const wasCompleted = currentSession[0]?.status === 'completed';
      const willBeCompleted = fields.status === 'completed';
      
      const updates: string[] = [];
      const values: any[] = [];
      
      const allowedFields = [
        'session_date', 'duration_minutes', 'injury_description', 'treatment', 'exercises',
        'progress_notes', 'pain_before', 'pain_after', 'techniques_applied',
        'patient_feedback', 'therapist_notes', 'next_session', 'status'
      ];
      
      for (const field of allowedFields) {
        if (fields[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(fields[field]);
        }
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE rehab_sessions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      // Atualizar contador se status mudou para completed
      if (!wasCompleted && willBeCompleted && currentSession[0]?.treatment_plan_id) {
        await pool.query(
          'UPDATE physio_treatment_plans SET completed_sessions = completed_sessions + 1 WHERE id = ?',
          [currentSession[0].treatment_plan_id]
        );
      }
      
      res.json({ message: 'Sessão atualizada com sucesso' });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: 'Erro ao atualizar sessão' });
    }
  });

  // =========================================
  // EVOLUÇÃO DO PACIENTE
  // =========================================
  
  // Listar evolução
  router.get('/progress/:athleteId', async (req: AuthRequest, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [progress] = await pool.query(
        `SELECT * FROM physio_progress
         WHERE athlete_id = ?
         ORDER BY record_date DESC`,
        [athleteId]
      );
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: 'Erro ao buscar evolução' });
    }
  });

  // Registrar evolução
  router.post('/progress', async (req: AuthRequest, res: Response) => {
    try {
      const {
        athlete_id,
        treatment_plan_id,
        record_date,
        pain_level,
        mobility_score,
        strength_score,
        functional_score,
        rom_data,
        notes
      } = req.body;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO physio_progress (
          athlete_id, treatment_plan_id, record_date, pain_level,
          mobility_score, strength_score, functional_score, rom_data, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          athlete_id, treatment_plan_id, record_date || new Date(),
          pain_level, mobility_score, strength_score, functional_score,
          JSON.stringify(rom_data), notes
        ]
      );

      res.status(201).json({ id: result.insertId, message: 'Evolução registrada' });
    } catch (error) {
      console.error('Error creating progress:', error);
      res.status(500).json({ error: 'Erro ao registrar evolução' });
    }
  });

  // =========================================
  // BIBLIOTECA DE EXERCÍCIOS TERAPÊUTICOS
  // =========================================
  
  // Listar exercícios
  router.get('/exercises', async (req: AuthRequest, res: Response) => {
    try {
      const { consultancy_id, category, body_region } = req.query;
      
      let query = `
        SELECT * FROM physio_exercises
        WHERE is_active = TRUE AND (consultancy_id IS NULL OR consultancy_id = ?)
      `;
      const params: any[] = [consultancy_id || 0];
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      if (body_region) {
        query += ' AND body_region LIKE ?';
        params.push(`%${body_region}%`);
      }
      
      query += ' ORDER BY name';
      
      const [exercises] = await pool.query<PhysioExercise[]>(query, params);
      
      res.json(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ error: 'Erro ao buscar exercícios' });
    }
  });

  // Criar exercício
  router.post('/exercises', async (req: AuthRequest, res: Response) => {
    try {
      const {
        consultancy_id,
        name,
        description,
        instructions,
        category,
        body_region,
        difficulty,
        video_url,
        image_url,
        contraindications
      } = req.body;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO physio_exercises (
          consultancy_id, name, description, instructions, category,
          body_region, difficulty, video_url, image_url, contraindications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          consultancy_id || null, name, description, instructions, category || 'other',
          body_region, difficulty || 'medium', video_url, image_url, contraindications
        ]
      );

      res.status(201).json({ id: result.insertId, message: 'Exercício criado' });
    } catch (error) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ error: 'Erro ao criar exercício' });
    }
  });

  // =========================================
  // EXERCÍCIOS PRESCRITOS
  // =========================================
  
  // Listar exercícios prescritos de um protocolo
  router.get('/prescribed/:treatmentPlanId', async (req: AuthRequest, res: Response) => {
    try {
      const { treatmentPlanId } = req.params;
      
      const [exercises] = await pool.query(
        `SELECT ppe.*, pe.name as exercise_name, pe.description, pe.video_url, pe.image_url
         FROM physio_prescribed_exercises ppe
         LEFT JOIN physio_exercises pe ON ppe.exercise_id = pe.id
         WHERE ppe.treatment_plan_id = ?
         ORDER BY ppe.order_index`,
        [treatmentPlanId]
      );
      
      res.json(exercises);
    } catch (error) {
      console.error('Error fetching prescribed exercises:', error);
      res.status(500).json({ error: 'Erro ao buscar exercícios prescritos' });
    }
  });

  // Prescrever exercício
  router.post('/prescribed', async (req: AuthRequest, res: Response) => {
    try {
      const {
        treatment_plan_id,
        exercise_id,
        custom_name,
        custom_instructions,
        sets,
        reps,
        hold_time,
        frequency,
        notes,
        order_index,
        is_home_exercise
      } = req.body;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO physio_prescribed_exercises (
          treatment_plan_id, exercise_id, custom_name, custom_instructions,
          sets, reps, hold_time, frequency, notes, order_index, is_home_exercise
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          treatment_plan_id, exercise_id || null, custom_name, custom_instructions,
          sets, reps, hold_time, frequency, notes, order_index || 0, is_home_exercise || false
        ]
      );

      res.status(201).json({ id: result.insertId, message: 'Exercício prescrito' });
    } catch (error) {
      console.error('Error prescribing exercise:', error);
      res.status(500).json({ error: 'Erro ao prescrever exercício' });
    }
  });

  // =========================================
  // DOCUMENTOS
  // =========================================
  
  // Listar documentos de um atleta
  router.get('/documents/:athleteId', async (req: AuthRequest, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [documents] = await pool.query(
        `SELECT pd.*, u.name as uploaded_by_name
         FROM physio_documents pd
         JOIN users u ON pd.uploaded_by = u.id
         WHERE pd.athlete_id = ?
         ORDER BY pd.created_at DESC`,
        [athleteId]
      );
      
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
  });

  // =========================================
  // ESTATÍSTICAS
  // =========================================
  
  router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
      const { consultancy_id } = req.query;
      
      // Protocolos ativos
      const [activePlans] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM physio_treatment_plans ptp
         JOIN athletes a ON ptp.athlete_id = a.id
         WHERE a.consultancy_id = ? AND ptp.status = 'active'`,
        [consultancy_id]
      );
      
      // Total de pacientes em tratamento
      const [patients] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT ptp.athlete_id) as count FROM physio_treatment_plans ptp
         JOIN athletes a ON ptp.athlete_id = a.id
         WHERE a.consultancy_id = ? AND ptp.status = 'active'`,
        [consultancy_id]
      );
      
      // Sessões esta semana
      const [sessionsThisWeek] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM rehab_sessions rs
         JOIN athletes a ON rs.athlete_id = a.id
         WHERE a.consultancy_id = ? 
         AND YEARWEEK(rs.session_date, 1) = YEARWEEK(CURDATE(), 1)`,
        [consultancy_id]
      );
      
      // Protocolos concluídos este mês
      const [completedThisMonth] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM physio_treatment_plans ptp
         JOIN athletes a ON ptp.athlete_id = a.id
         WHERE a.consultancy_id = ? AND ptp.status = 'completed'
         AND MONTH(ptp.actual_end_date) = MONTH(CURDATE())
         AND YEAR(ptp.actual_end_date) = YEAR(CURDATE())`,
        [consultancy_id]
      );
      
      res.json({
        active_plans: activePlans[0]?.count || 0,
        patients_in_treatment: patients[0]?.count || 0,
        sessions_this_week: sessionsThisWeek[0]?.count || 0,
        completed_this_month: completedThisMonth[0]?.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  return router;
}
