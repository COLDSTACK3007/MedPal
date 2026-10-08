import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneOff, MicOff, VideoOff, CameraReverse } from 'lucide-react-native';

export default function TelemedicineScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cameraView}>
                {/* Mock remote video feed */}
                <View style={styles.doctorVideoPlaceholder}>
                    <Text style={styles.connectingText}>Waiting for Dr. Sharma (Pediatrician)...</Text>
                </View>

                {/* Mock local video picture-in-picture */}
                <View style={styles.localVideoPlaceholder}>
                    <Text style={styles.localConnectingText}>You</Text>
                </View>
            </View>

            <View style={styles.controlsBar}>
                <TouchableOpacity style={styles.controlButton}>
                    <MicOff color="white" size={24} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                    <VideoOff color="white" size={24} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                    <CameraReverse color="white" size={24} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
                    <PhoneOff color="white" size={24} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
    },
    cameraView: {
        flex: 1,
        position: 'relative',
    },
    doctorVideoPlaceholder: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectingText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    localVideoPlaceholder: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 100,
        height: 150,
        backgroundColor: '#3A3A3C',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    localConnectingText: {
        color: 'white',
        fontSize: 14,
    },
    controlsBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 24,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingBottom: 40,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3A3A3C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCallButton: {
        backgroundColor: '#FF3B30',
    }
});
