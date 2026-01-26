import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Recarregar dados
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const quickActions = [
    { icon: 'barbell', label: 'Ver Treino', color: '#84cc16', screen: 'training' },
    { icon: 'nutrition', label: 'Ver Dieta', color: '#f59e0b', screen: 'nutrition' },
    { icon: 'calendar', label: 'Agenda', color: '#3b82f6', screen: 'appointments' },
    { icon: 'chatbubble', label: 'Mensagens', color: '#8b5cf6', screen: 'messages' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Atleta'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.primary.DEFAULT }]}>
            <Ionicons name="flame" size={24} color={colors.text.primary} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Dias consecutivos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success.DEFAULT} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>85%</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Aderência</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Training */}
        <Text style={styles.sectionTitle}>Treino de Hoje</Text>
        <TouchableOpacity style={styles.trainingCard}>
          <View style={styles.trainingHeader}>
            <View style={styles.trainingDay}>
              <Text style={styles.trainingDayText}>A</Text>
            </View>
            <View style={styles.trainingInfo}>
              <Text style={styles.trainingName}>Treino A - Superior</Text>
              <Text style={styles.trainingDetails}>8 exercícios • ~60 min</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </View>
          <View style={styles.trainingMuscles}>
            <View style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>Peito</Text>
            </View>
            <View style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>Ombro</Text>
            </View>
            <View style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>Tríceps</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Upcoming Appointments */}
        <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentIcon}>
            <Ionicons name="calendar" size={20} color={colors.info.DEFAULT} />
          </View>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentTitle}>Consulta Nutricional</Text>
            <Text style={styles.appointmentDate}>Amanhã às 14:00</Text>
          </View>
        </View>
        <View style={styles.appointmentCard}>
          <View style={[styles.appointmentIcon, { backgroundColor: colors.primary.DEFAULT + '20' }]}>
            <Ionicons name="barbell" size={20} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentTitle}>Avaliação Física</Text>
            <Text style={styles.appointmentDate}>Sexta-feira às 10:00</Text>
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error.DEFAULT,
    borderWidth: 2,
    borderColor: colors.background.DEFAULT,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.primary,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  trainingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainingDay: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  trainingDayText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingName: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  trainingDetails: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  trainingMuscles: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  muscleTag: {
    backgroundColor: colors.primary.DEFAULT + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  muscleTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary.dark,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.info.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  appointmentDate: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
});
