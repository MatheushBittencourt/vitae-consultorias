import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

interface TrainingDay {
  id: number;
  letter: string;
  name: string;
  muscles: string[];
  exerciseCount: number;
}

export default function TrainingScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Dados mockados - depois substituir por API
  const trainingDays: TrainingDay[] = [
    { id: 1, letter: 'A', name: 'Superior - Push', muscles: ['Peito', 'Ombro', 'Tríceps'], exerciseCount: 8 },
    { id: 2, letter: 'B', name: 'Inferior', muscles: ['Quadríceps', 'Glúteo', 'Panturrilha'], exerciseCount: 7 },
    { id: 3, letter: 'C', name: 'Superior - Pull', muscles: ['Costas', 'Bíceps', 'Trapézio'], exerciseCount: 8 },
    { id: 4, letter: 'D', name: 'Core & Cardio', muscles: ['Abdômen', 'Oblíquos'], exerciseCount: 6 },
  ];

  const exercises = [
    { id: 1, name: 'Supino Reto com Barra', sets: 4, reps: '8-10', load: '80kg', rest: 90 },
    { id: 2, name: 'Supino Inclinado com Halteres', sets: 3, reps: '10-12', load: '32kg', rest: 60 },
    { id: 3, name: 'Crucifixo na Máquina', sets: 3, reps: '12-15', load: '45kg', rest: 60 },
    { id: 4, name: 'Desenvolvimento com Halteres', sets: 4, reps: '8-10', load: '24kg', rest: 90 },
    { id: 5, name: 'Elevação Lateral', sets: 3, reps: '12-15', load: '10kg', rest: 45 },
    { id: 6, name: 'Tríceps Pulley', sets: 3, reps: '12-15', load: '30kg', rest: 45 },
    { id: 7, name: 'Tríceps Testa', sets: 3, reps: '10-12', load: '20kg', rest: 60 },
    { id: 8, name: 'Mergulho no Banco', sets: 3, reps: '12-15', load: 'Peso corporal', rest: 45 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meu Treino</Text>
          <Text style={styles.subtitle}>Plano: Hipertrofia Intermediário</Text>
        </View>

        {/* Days Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {trainingDays.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayCard,
                selectedDay === day.id && styles.dayCardActive
              ]}
              onPress={() => setSelectedDay(selectedDay === day.id ? null : day.id)}
            >
              <View style={[
                styles.dayLetter,
                selectedDay === day.id && styles.dayLetterActive
              ]}>
                <Text style={[
                  styles.dayLetterText,
                  selectedDay === day.id && styles.dayLetterTextActive
                ]}>
                  {day.letter}
                </Text>
              </View>
              <Text style={[
                styles.dayName,
                selectedDay === day.id && styles.dayNameActive
              ]} numberOfLines={1}>
                {day.name}
              </Text>
              <Text style={styles.dayExercises}>
                {day.exerciseCount} exercícios
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's Focus */}
        {selectedDay === null && (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Ionicons name="today" size={24} color={colors.primary.DEFAULT} />
              <Text style={styles.todayTitle}>Treino de Hoje</Text>
            </View>
            <Text style={styles.todayDescription}>
              Selecione um treino acima para ver os exercícios
            </Text>
          </View>
        )}

        {/* Exercise List */}
        {selectedDay && (
          <>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseHeaderTitle}>
                {trainingDays.find(d => d.id === selectedDay)?.name}
              </Text>
              <View style={styles.musclesRow}>
                {trainingDays.find(d => d.id === selectedDay)?.muscles.map((muscle, idx) => (
                  <View key={idx} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {exercises.map((exercise, index) => (
              <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Séries</Text>
                      <Text style={styles.detailValue}>{exercise.sets}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Reps</Text>
                      <Text style={styles.detailValue}>{exercise.reps}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Carga</Text>
                      <Text style={styles.detailValue}>{exercise.load}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Desc.</Text>
                      <Text style={styles.detailValue}>{exercise.rest}s</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="play-circle" size={32} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  daysContainer: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  dayCard: {
    width: 120,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCardActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT + '10',
  },
  dayLetter: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayLetterActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  dayLetterText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  dayLetterTextActive: {
    color: colors.text.primary,
  },
  dayName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  dayNameActive: {
    color: colors.primary.dark,
  },
  dayExercises: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  todayCard: {
    backgroundColor: colors.primary.DEFAULT + '15',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  todayTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  todayDescription: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  exerciseHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  exerciseHeaderTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muscleTag: {
    backgroundColor: colors.primary.DEFAULT + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  muscleTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary.dark,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.DEFAULT + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseNumberText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.primary.dark,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
