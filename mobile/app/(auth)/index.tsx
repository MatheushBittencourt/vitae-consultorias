import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSelectRole = (role: 'professional' | 'patient') => {
    router.push({
      pathname: '/(auth)/login',
      params: { role }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={styles.logoTitle}>VITAE</Text>
          <Text style={styles.subtitle}>Consultorias em Saúde</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
          <Text style={styles.welcomeText}>
            Como você deseja acessar o aplicativo?
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          {/* Professional Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('professional')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.primary.DEFAULT }]}>
              <Ionicons name="medical" size={32} color={colors.text.primary} />
            </View>
            <Text style={styles.roleTitle}>Sou Profissional</Text>
            <Text style={styles.roleDescription}>
              Personal, nutricionista, médico ou fisioterapeuta
            </Text>
            <View style={styles.roleArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.DEFAULT} />
            </View>
          </TouchableOpacity>

          {/* Patient Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('patient')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.info.DEFAULT }]}>
              <Ionicons name="person" size={32} color={colors.text.inverse} />
            </View>
            <Text style={styles.roleTitle}>Sou Paciente</Text>
            <Text style={styles.roleDescription}>
              Acompanhe seus treinos, dieta e evolução
            </Text>
            <View style={styles.roleArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.info.DEFAULT} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sua saúde em um só lugar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoIcon: {
    width: 72,
    height: 72,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  logoTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    gap: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    paddingRight: spacing.xl,
  },
  roleArrow: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
});
