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

interface Meal {
  id: number;
  name: string;
  time: string;
  calories: number;
  foods: { name: string; quantity: string; calories: number }[];
}

export default function NutritionScreen() {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  
  const dailyStats = {
    calories: { current: 1580, target: 2200 },
    protein: { current: 95, target: 140 },
    carbs: { current: 180, target: 250 },
    fat: { current: 52, target: 70 },
  };

  const meals: Meal[] = [
    {
      id: 1,
      name: 'Café da Manhã',
      time: '07:00',
      calories: 420,
      foods: [
        { name: 'Ovos mexidos', quantity: '3 unidades', calories: 210 },
        { name: 'Pão integral', quantity: '2 fatias', calories: 140 },
        { name: 'Banana', quantity: '1 unidade', calories: 70 },
      ],
    },
    {
      id: 2,
      name: 'Lanche da Manhã',
      time: '10:00',
      calories: 180,
      foods: [
        { name: 'Whey Protein', quantity: '1 scoop', calories: 120 },
        { name: 'Aveia', quantity: '30g', calories: 60 },
      ],
    },
    {
      id: 3,
      name: 'Almoço',
      time: '12:30',
      calories: 650,
      foods: [
        { name: 'Arroz integral', quantity: '150g', calories: 165 },
        { name: 'Feijão', quantity: '100g', calories: 95 },
        { name: 'Frango grelhado', quantity: '200g', calories: 330 },
        { name: 'Salada', quantity: '1 prato', calories: 60 },
      ],
    },
    {
      id: 4,
      name: 'Lanche da Tarde',
      time: '16:00',
      calories: 200,
      foods: [
        { name: 'Iogurte grego', quantity: '170g', calories: 120 },
        { name: 'Granola', quantity: '30g', calories: 80 },
      ],
    },
    {
      id: 5,
      name: 'Jantar',
      time: '19:30',
      calories: 130,
      foods: [
        { name: 'A definir...', quantity: '-', calories: 0 },
      ],
    },
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Minha Dieta</Text>
          <Text style={styles.subtitle}>Plano: Emagrecimento</Text>
        </View>

        {/* Daily Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Consumo de Hoje</Text>
          
          {/* Calories */}
          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesValue}>
              {dailyStats.calories.current}
            </Text>
            <Text style={styles.caloriesTarget}>
              / {dailyStats.calories.target} kcal
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage(dailyStats.calories.current, dailyStats.calories.target)}%` }
              ]} 
            />
          </View>

          {/* Macros */}
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.error.light }]}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getProgressPercentage(dailyStats.protein.current, dailyStats.protein.target)}%`,
                      backgroundColor: colors.error.DEFAULT 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.macroLabel}>Proteína</Text>
              <Text style={styles.macroValue}>{dailyStats.protein.current}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.warning.light }]}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getProgressPercentage(dailyStats.carbs.current, dailyStats.carbs.target)}%`,
                      backgroundColor: colors.warning.DEFAULT 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.macroLabel}>Carboidratos</Text>
              <Text style={styles.macroValue}>{dailyStats.carbs.current}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: colors.info.light }]}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getProgressPercentage(dailyStats.fat.current, dailyStats.fat.target)}%`,
                      backgroundColor: colors.info.DEFAULT 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.macroLabel}>Gorduras</Text>
              <Text style={styles.macroValue}>{dailyStats.fat.current}g</Text>
            </View>
          </View>
        </View>

        {/* Meals List */}
        <Text style={styles.sectionTitle}>Refeições</Text>
        {meals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={styles.mealCard}
            onPress={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
          >
            <View style={styles.mealHeader}>
              <View style={styles.mealTime}>
                <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.mealTimeText}>{meal.time}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
              <Ionicons 
                name={selectedMeal === meal.id ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.text.tertiary} 
              />
            </View>
            
            {selectedMeal === meal.id && (
              <View style={styles.mealFoods}>
                {meal.foods.map((food, idx) => (
                  <View key={idx} style={styles.foodItem}>
                    <View style={styles.foodDot} />
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodQuantity}>{food.quantity}</Text>
                    <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  caloriesValue: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.primary.DEFAULT,
  },
  caloriesTarget: {
    fontSize: fontSize.lg,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.DEFAULT,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroBar: {
    width: '100%',
    height: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  macroFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  macroLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  macroValue: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mealCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  mealTimeText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mealCalories: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  mealFoods: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.DEFAULT,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  foodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
    marginRight: spacing.sm,
  },
  foodName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  foodQuantity: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginRight: spacing.md,
  },
  foodCalories: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    width: 60,
    textAlign: 'right',
  },
});
