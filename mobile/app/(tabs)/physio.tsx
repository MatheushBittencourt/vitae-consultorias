import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function PhysioScreen() {
  const [activeTab, setActiveTab] = useState<'treatment' | 'exercises' | 'history'>('treatment');

  const treatmentPlan = {
    name: 'Reabilitação de Joelho',
    condition: 'Condromalácia Patelar Grau II',
    progress: 75,
    sessionsCompleted: 9,
    totalSessions: 12,
    nextSession: '2026-01-28',
    physiotherapist: 'Dr. Carlos Mendes',
  };

  const homeExercises = [
    { id: 1, name: 'Alongamento de Quadríceps', sets: 3, duration: '30s cada lado', frequency: '2x ao dia' },
    { id: 2, name: 'Fortalecimento de VMO', sets: 3, reps: '15 repetições', frequency: '1x ao dia' },
    { id: 3, name: 'Ponte de Glúteo', sets: 3, reps: '12 repetições', frequency: '1x ao dia' },
    { id: 4, name: 'Propriocepção Unipodal', sets: 3, duration: '30 segundos', frequency: '1x ao dia' },
  ];

  const painHistory = [
    { date: '22/01', level: 3 },
    { date: '19/01', level: 4 },
    { date: '15/01', level: 5 },
    { date: '12/01', level: 6 },
    { date: '08/01', level: 7 },
  ];

  const getPainColor = (level: number) => {
    if (level <= 3) return colors.success.DEFAULT;
    if (level <= 6) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fisioterapia</Text>
          <Text style={styles.subtitle}>{treatmentPlan.name}</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.conditionText}>{treatmentPlan.condition}</Text>
              <Text style={styles.physioText}>Com {treatmentPlan.physiotherapist}</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>{treatmentPlan.progress}%</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${treatmentPlan.progress}%` }]} />
          </View>
          
          <View style={styles.sessionInfo}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
            <Text style={styles.sessionText}>
              {treatmentPlan.sessionsCompleted} de {treatmentPlan.totalSessions} sessões concluídas
            </Text>
          </View>
          
          <TouchableOpacity style={styles.nextSessionButton}>
            <Ionicons name="calendar" size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.nextSessionText}>
              Próxima sessão: {new Date(treatmentPlan.nextSession).toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['treatment', 'exercises', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'treatment' ? 'Tratamento' : tab === 'exercises' ? 'Exercícios' : 'Evolução'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'treatment' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.info.DEFAULT} />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Sobre o Tratamento</Text>
                <Text style={styles.infoCardText}>
                  Protocolo de fortalecimento muscular e propriocepção para recuperação da condromalácia patelar.
                  Frequência: 2x por semana. Duração estimada: 12 semanas.
                </Text>
              </View>
            </View>

            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color={colors.warning.DEFAULT} />
              <View style={styles.infoCardContent}>
                <Text style={styles.warningCardTitle}>Precauções</Text>
                <Text style={styles.infoCardText}>
                  Evitar agachamentos profundos, saltos e corrida até liberação médica. Usar gelo após exercícios se houver inchaço.
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'exercises' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Exercícios para Casa</Text>
            {homeExercises.map((exercise) => (
              <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{exercise.id}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseDetail}>
                      {exercise.sets}x {exercise.reps || exercise.duration}
                    </Text>
                    <Text style={styles.exerciseFrequency}>{exercise.frequency}</Text>
                  </View>
                </View>
                <Ionicons name="play-circle" size={28} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Evolução da Dor</Text>
            <View style={styles.painChart}>
              {painHistory.map((entry, index) => (
                <View key={index} style={styles.painEntry}>
                  <View 
                    style={[
                      styles.painBar,
                      { 
                        height: entry.level * 15,
                        backgroundColor: getPainColor(entry.level)
                      }
                    ]} 
                  />
                  <Text style={styles.painLevel}>{entry.level}</Text>
                  <Text style={styles.painDate}>{entry.date}</Text>
                </View>
              ))}
            </View>
            <View style={styles.painLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success.DEFAULT }]} />
                <Text style={styles.legendText}>Baixa (1-3)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning.DEFAULT }]} />
                <Text style={styles.legendText}>Moderada (4-6)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error.DEFAULT }]} />
                <Text style={styles.legendText}>Alta (7-10)</Text>
              </View>
            </View>
          </View>
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
  progressCard: {
    backgroundColor: colors.primary.DEFAULT + '15',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  conditionText: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  physioText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.DEFAULT,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sessionText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  nextSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.DEFAULT,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  nextSessionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  tabActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  tabContent: {},
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info.light,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoCardText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.warning.light,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  warningCardTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
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
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  exerciseDetail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  exerciseFrequency: {
    fontSize: fontSize.sm,
    color: colors.primary.dark,
    fontWeight: '600',
  },
  painChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  painEntry: {
    alignItems: 'center',
  },
  painBar: {
    width: 32,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  painLevel: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  painDate: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  painLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
});
