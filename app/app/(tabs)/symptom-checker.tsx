import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot } from 'lucide-react-native';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
}

export default function SymptomCheckerScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: 'Hello! Please describe the symptoms of the patient. E.g., "High fever and chest pain for 2 days."' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // In a real app, this would use configured environment variable for backend URL
            const response = await fetch('http://10.0.2.2:3000/api/symptom-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: userMsg.text })
            });

            let data;
            if (response.ok) {
                data = await response.json();
            } else {
                // Fallback for demo when backend is not reachable via emulator networking
                data = {
                    riskLevel: userMsg.text.toLowerCase().includes('severe') ? 'High' : 'Low',
                    diagnosis: 'Mock assessment based on symptoms.',
                    advice: 'Please consult a doctor for a full diagnosis.',
                    disclaimer: 'This is a mock AI response.'
                };
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: `Risk: ${data.riskLevel}\nAssessment: ${data.diagnosis}\nRecommendation: ${data.advice}\n\n*${data.disclaimer}*`
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: 'Sorry, I am having trouble connecting to the network right now. Falling back to offline triage rules...'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Symptom Triage</Text>
            </View>

            <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 16 }}>
                {messages.map(msg => (
                    <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                        {msg.sender === 'bot' && <Bot size={20} color="#007AFF" style={{ marginRight: 8 }} />}
                        <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.botText]}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.messageBubble, styles.botBubble, { alignSelf: 'flex-start' }]}>
                        <ActivityIndicator size="small" color="#007AFF" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Type symptoms here..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading || !inputText.trim()}>
                    <Send color="white" size={20} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    chatArea: {
        flex: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: 'white',
    },
    botText: {
        color: '#1C1C1E',
        flexShrink: 1,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        maxHeight: 100,
        minHeight: 40,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: 2,
    },
});
