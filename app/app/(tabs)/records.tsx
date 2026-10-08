import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, User, Plus, FileText } from 'lucide-react-native';

// Mock Data
const INITIAL_PATIENTS = [
    { id: 'PT-1001', name: 'Ramesh Kumar', age: 45, gender: 'M', village: 'Rampur', lastVisit: '2023-10-25' },
    { id: 'PT-1002', name: 'Sita Devi', age: 32, gender: 'F', village: 'Rampur', lastVisit: '2023-10-26' },
    { id: 'PT-1003', name: 'Arjun Singh', age: 12, gender: 'M', village: 'Sitapur', lastVisit: '2023-10-20' },
    { id: 'PT-1004', name: 'Meena Kumari', age: 28, gender: 'F', village: 'Sitapur', lastVisit: '2023-10-22' },
];

export default function RecordsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState(INITIAL_PATIENTS);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPatientCard = ({ item }: { item: typeof INITIAL_PATIENTS[0] }) => (
        <TouchableOpacity style={styles.patientCard}>
            <View style={styles.patientHeader}>
                <View style={styles.patientAvatar}>
                    <User color="#007AFF" size={24} />
                </View>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{item.name}</Text>
                    <Text style={styles.patientId}>{item.id} • {item.age} yrs • {item.gender}</Text>
                </View>
            </View>
            <View style={styles.patientDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Village:</Text>
                    <Text style={styles.detailValue}>{item.village}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Visit:</Text>
                    <Text style={styles.detailValue}>{item.lastVisit}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                    <FileText color="#007AFF" size={16} />
                    <Text style={styles.actionText}>View History</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Patient Records</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Plus color="white" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Search color="#8E8E93" size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or ID (e.g. PT-1001)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredPatients}
                keyExtractor={item => item.id}
                renderItem={renderPatientCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No patients found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E5EA',
        margin: 16,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    patientCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    patientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5F1FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    patientId: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    patientDetails: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    detailValue: {
        fontSize: 14,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    actionButtons: {
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: 6,
        color: '#007AFF',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
    }
});
