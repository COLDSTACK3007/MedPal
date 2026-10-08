import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Activity, Users, AlertTriangle, Stethoscope } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, Dr. Singh</Text>
          <Text style={styles.subtitle}>Community Health Worker Dashboard</Text>
        </View>

        <TouchableOpacity style={styles.emergencyCard} onPress={() => alert('Emergency Alert Sent!')}>
          <AlertTriangle color="white" size={32} />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
            <Text style={styles.emergencySub}>Tap to broadcast location and need</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users color="#007AFF" size={24} />
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Activity color="#34C759" size={24} />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Cases Today</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/symptom-checker')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E5F1FF' }]}>
              <Stethoscope color="#007AFF" size={24} />
            </View>
            <Text style={styles.actionText}>Symptom Check</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/records')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F2F2F7' }]}>
              <Users color="#8E8E93" size={24} />
            </View>
            <Text style={styles.actionText}>Patient Records</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIndicator} />
            <View>
              <Text style={styles.activityTitle}>Ramesh Kumar - High Fever</Text>
              <Text style={styles.activityTime}>2 hours ago • Sync Pending offline</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIndicator, { backgroundColor: '#34C759' }]} />
            <View>
              <Text style={styles.activityTitle}>Sita Devi - Routine Checkup</Text>
              <Text style={styles.activityTime}>5 hours ago • Synced</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  emergencyCard: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyTextContainer: {
    marginLeft: 16,
  },
  emergencyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emergencySub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9500',
    marginRight: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
