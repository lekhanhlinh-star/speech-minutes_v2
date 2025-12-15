import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Badge,
  Flex,
  Stack,
  Input,
} from '@chakra-ui/react';
import { 
  FaMicrophone, 
  FaStop, 
  FaPlay, 
  FaPause, 
  FaUpload,
  FaTrash,
  FaDownload 
} from 'react-icons/fa';
import { uploadAudioFile } from '../api';
import { toaster } from '../components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function RecordingPage() {
  const navigate = useNavigate();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  
  const [language, setLanguage] = useState('zh');
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hotwordInput, setHotwordInput] = useState('');
  const [hotwords, setHotwords] = useState<string[]>([]);

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordingState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
          isPaused: false,
        }));
        
        // Show processing modal after recording stops
        setShowModal(true);
      };

      mediaRecorder.start(1000); // Collect data every second
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      }));

      // Start duration timer
      intervalRef.current = window.setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      toaster.create({
        title: 'Recording Started',
        description: 'Your audio is being recorded',
        type: 'info',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toaster.create({
        title: 'Recording Error',
        description: 'Failed to access microphone. Please check permissions.',
        type: 'error',
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = window.setInterval(() => {
          setRecordingState(prev => ({
            ...prev,
            duration: prev.duration + 1,
          }));
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      setRecordingState(prev => ({
        ...prev,
        isPaused: !prev.isPaused,
      }));
    }
  };

  // Upload audio file
  const handleUpload = async () => {
    if (!recordingState.audioBlob) return;

    setIsUploading(true);
    try {
      const file = new File([recordingState.audioBlob], `recording_${Date.now()}.webm`, {
        type: 'audio/webm',
      });

      const response = await uploadAudioFile(file, language, false, hotwords.length ? hotwords : null);
      
      if (response.ok) {
        toaster.create({
          title: 'Upload Successful',
          description: 'Your recording has been uploaded and is being processed',
          type: 'success',
        });
        
        setShowModal(false);
        navigate('/meeting-status'); // Navigate to meetings page
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toaster.create({
        title: 'Upload Failed',
        description: 'Failed to upload recording. Please try again.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addHotword = () => {
    const hw = hotwordInput.trim();
    if (!hw) return;
    setHotwords(prev => [...prev, hw]);
    setHotwordInput('');
  };

  const removeHotword = (index: number) => {
    setHotwords(prev => prev.filter((_, i) => i !== index));
  };

  // Clear recording
  const clearRecording = () => {
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl);
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    });
    
    setShowModal(false);
  };

  // Download recording
  const downloadRecording = () => {
    if (recordingState.audioUrl) {
      const a = document.createElement('a');
      a.href = recordingState.audioUrl;
      a.download = `recording_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingState.audioUrl) {
        URL.revokeObjectURL(recordingState.audioUrl);
      }
    };
  }, []);

  return (
    <Layout fullWidth bg="gradient-to-br from-blue-50 to-purple-50">
      <Box
        display="flex"
        justifyContent="center"
        w="100%"
        px={{ base: 4, md: 6 }}
        py={6}
      >
        <Box maxW="800px" w="100%">
          <Stack gap={8}>
          {/* Header with gradient */}
        <Box textAlign="center">
          <Box
            display="inline-block"
            p={4}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
            color="white"
            mb={4}
            shadow="lg"
          >
            <Text fontSize="3xl">🎙️</Text>
          </Box>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.800" mb={2}>
            Audio Recorder
          </Text>
          <Text fontSize="lg" color="gray.600">
            Record high-quality audio for transcription and analysis
          </Text>
        </Box>

        {/* Recording Status Card */}
        <Box 
          p={8} 
          bg="white" 
          borderRadius="2xl" 
          shadow="xl" 
          border="1px solid" 
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          {/* Animated background */}
          {recordingState.isRecording && !recordingState.isPaused && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="linear-gradient(45deg, transparent 0%, red.50 50%, transparent 100%)"
              animation="pulse 2s infinite"
              opacity={0.3}
            />
          )}
          
          <Stack gap={6} align="center" position="relative">
            {/* Status Badge with animation */}
            <Badge 
              colorPalette={recordingState.isRecording ? 'red' : 'blue'} 
              size="lg"
              px={6}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              shadow="md"
              animation={recordingState.isRecording && !recordingState.isPaused ? "pulse 1.5s infinite" : "none"}
            >
              {recordingState.isRecording 
                ? (recordingState.isPaused ? '⏸️ PAUSED' : '🔴 RECORDING') 
                : '🎯 READY TO RECORD'
              }
            </Badge>

            {/* Duration Display with glow effect */}
            <Box textAlign="center">
              <Text 
                fontSize={{ base: "4xl", md: "5xl" }} 
                fontWeight="mono" 
                color={recordingState.isRecording ? "red.500" : "blue.500"}
                textShadow={recordingState.isRecording ? "0 0 20px rgba(239, 68, 68, 0.3)" : "none"}
                transition="all 0.3s"
              >
                {formatDuration(recordingState.duration)}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Duration
              </Text>
            </Box>

            {/* Recording Progress with animation */}
            {recordingState.isRecording && (
              <Box w="100%" maxW="400px">
                <Box 
                  h="6" 
                  bg="gray.100" 
                  borderRadius="full" 
                  overflow="hidden"
                  shadow="inner"
                >
                  <Box 
                    h="100%" 
                    bg="linear-gradient(90deg, #ef4444, #dc2626)"
                    w={`${(recordingState.duration % 10) * 10}%`}
                    borderRadius="full"
                    transition="width 0.3s ease"
                    shadow="md"
                  />
                </Box>
                <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                  Recording in progress...
                </Text>
              </Box>
            )}

            {/* Language Selection with modern styling */}
            {!recordingState.isRecording && (
              <Box w="100%" maxW="300px">
                <Text mb={3} fontSize="sm" fontWeight="semibold" color="gray.700">
                  🌍 Recording Language:
                </Text>
                <Box position="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <option value="en">English</option>
                    <option value="zh">Chinese</option>
                  </select>
                </Box>
              </Box>
            )}

            {/* Control Buttons with modern styling */}
            <Flex gap={4} wrap="wrap" justify="center">
              {!recordingState.isRecording ? (
                <Button
                  colorPalette="red"
                  size="lg"
                  onClick={startRecording}
                  disabled={recordingState.audioBlob !== null}
                  bg="linear-gradient(135deg, #ef4444, #dc2626)"
                  color="white"
                  px={8}
                  py={6}
                  borderRadius="xl"
                  fontWeight="bold"
                  shadow="lg"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    shadow: 'xl',
                    bg: "linear-gradient(135deg, #dc2626, #b91c1c)"
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  <FaMicrophone style={{ marginRight: '8px' }} />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    colorPalette={recordingState.isPaused ? 'green' : 'orange'}
                    size="lg"
                    onClick={togglePauseRecording}
                    bg={recordingState.isPaused 
                      ? "linear-gradient(135deg, #22c55e, #16a34a)" 
                      : "linear-gradient(135deg, #f59e0b, #d97706)"
                    }
                    color="white"
                    px={6}
                    py={6}
                    borderRadius="xl"
                    fontWeight="bold"
                    shadow="lg"
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      shadow: 'xl'
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                  >
                    {recordingState.isPaused ? <FaPlay /> : <FaPause />}
                    <Text ml={2}>
                      {recordingState.isPaused ? 'Resume' : 'Pause'}
                    </Text>
                  </Button>
                  <Button
                    colorPalette="gray"
                    size="lg"
                    onClick={stopRecording}
                    bg="linear-gradient(135deg, #6b7280, #4b5563)"
                    color="white"
                    px={6}
                    py={6}
                    borderRadius="xl"
                    fontWeight="bold"
                    shadow="lg"
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      shadow: 'xl',
                      bg: "linear-gradient(135deg, #4b5563, #374151)"
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                  >
                    <FaStop style={{ marginRight: '8px' }} />
                    Stop
                  </Button>
                </>
              )}
            </Flex>
          </Stack>
        </Box>

        {/* Audio Preview with modern styling */}
        {recordingState.audioUrl && (
          <Box 
            p={6} 
            bg="white" 
            borderRadius="2xl" 
            shadow="lg" 
            border="1px solid" 
            borderColor="blue.100"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative gradient */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              h="2"
              bg="linear-gradient(90deg, #3b82f6, #8b5cf6)"
            />
            
            <Stack gap={5} align="center" pt={2}>
              <Flex align="center" gap={3}>
                <Box
                  p={2}
                  bg="blue.100"
                  borderRadius="lg"
                  color="blue.600"
                >
                  <Text fontSize="xl">🎵</Text>
                </Box>
                <Text fontWeight="bold" color="blue.800" fontSize="lg">
                  Recording Preview
                </Text>
                <Badge colorPalette="blue" size="sm">
                  {formatDuration(recordingState.duration)}
                </Badge>
              </Flex>
              
              <Box w="100%" maxW="400px">
                <audio 
                  controls 
                  src={recordingState.audioUrl || undefined}
                  style={{ 
                    width: '100%',
                    borderRadius: '12px',
                    outline: 'none'
                  }}
                />
              </Box>
              
              <Flex gap={4}>
                <Button
                  colorPalette="blue"
                  onClick={downloadRecording}
                  size="sm"
                  borderRadius="lg"
                  px={4}
                  fontWeight="semibold"
                  _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  <FaDownload style={{ marginRight: '6px' }} />
                  Download
                </Button>
                <Button
                  colorPalette="red"
                  variant="outline"
                  onClick={clearRecording}
                  size="sm"
                  borderRadius="lg"
                  px={4}
                  fontWeight="semibold"
                  _hover={{ 
                    transform: 'translateY(-1px)', 
                    shadow: 'md',
                    bg: 'red.50'
                  }}
                  transition="all 0.2s"
                >
                  <FaTrash style={{ marginRight: '6px' }} />
                  Delete
                </Button>
              </Flex>
            </Stack>
          </Box>
        )}

        {/* Tips Section with modern styling */}
        <Box 
          p={6} 
          bg="white" 
          borderRadius="2xl" 
          shadow="lg" 
          border="1px solid" 
          borderColor="green.100"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative gradient */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            h="2"
            bg="linear-gradient(90deg, #22c55e, #10b981)"
          />
          
          <Stack gap={4} pt={2}>
            <Flex align="center" gap={3}>
              <Box
                p={2}
                bg="green.100"
                borderRadius="lg"
                color="green.600"
              >
                <Text fontSize="xl">💡</Text>
              </Box>
              <Text fontWeight="bold" color="green.800" fontSize="lg">
                Recording Tips
              </Text>
            </Flex>
            
            <Stack gap={3} pl={4}>
              <Flex align="start" gap={3}>
                <Box mt={1}>
                  <Text color="green.500" fontSize="sm">•</Text>
                </Box>
                <Text fontSize="sm" color="gray.700" lineHeight="relaxed">
                  <Text as="span" fontWeight="semibold">Quiet Environment:</Text> Ensure you're in a noise-free space for best results
                </Text>
              </Flex>
              <Flex align="start" gap={3}>
                <Box mt={1}>
                  <Text color="green.500" fontSize="sm">•</Text>
                </Box>
                <Text fontSize="sm" color="gray.700" lineHeight="relaxed">
                  <Text as="span" fontWeight="semibold">Clear Speech:</Text> Speak at a normal pace and enunciate clearly
                </Text>
              </Flex>
              <Flex align="start" gap={3}>
                <Box mt={1}>
                  <Text color="green.500" fontSize="sm">•</Text>
                </Box>
                <Text fontSize="sm" color="gray.700" lineHeight="relaxed">
                  <Text as="span" fontWeight="semibold">AI Processing:</Text> Your recording will be automatically transcribed and summarized
                </Text>
              </Flex>
            </Stack>
          </Stack>
        </Box>

      {/* Processing Modal with modern styling */}
      {showModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="blackAlpha.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
          backdropFilter="blur(8px)"
        >
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            maxW="500px"
            w="90%"
            mx={4}
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative header */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              h="3"
              bg="linear-gradient(90deg, #22c55e, #10b981)"
            />
            
            <Stack gap={6} pt={2}>
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={3}>
                  <Box
                    p={3}
                    bg="green.100"
                    borderRadius="xl"
                    color="green.600"
                  >
                    <Text fontSize="2xl">🎉</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      Recording Complete!
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Ready for processing
                    </Text>
                  </Box>
                </Flex>
                <Badge colorPalette="green" size="lg" px={3} py={1} borderRadius="lg">
                  {formatDuration(recordingState.duration)}
                </Badge>
              </Flex>
              
              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text color="gray.700" lineHeight="relaxed">
                  Would you like to process this recording for <Text as="span" fontWeight="semibold" color="blue.600">transcription</Text> and <Text as="span" fontWeight="semibold" color="purple.600">AI summary</Text>?
                </Text>
              </Box>
              
              {recordingState.audioUrl && (
                <Box p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <Text fontSize="sm" mb={3} fontWeight="semibold" color="blue.800">
                    🎵 Preview Your Recording:
                  </Text>
                  <audio 
                    controls 
                    src={recordingState.audioUrl || undefined}
                    style={{ 
                      width: '100%',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}

              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text fontSize="sm" mb={3} fontWeight="semibold" color="gray.700">
                  🌍 Processing Language:
                </Text>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                </select>
              </Box>

              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text fontSize="sm" mb={3} fontWeight="semibold" color="gray.700">
                  🔎 Hotwords (optional):
                </Text>
                <Flex gap={2} align="center">
                  <Input
                    value={hotwordInput}
                    onChange={(e) => setHotwordInput(e.target.value)}
                    placeholder="Type a hotword and press Add or Enter"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHotword(); } }}
                    size="md"
                  />
                  <Button size="md" bg={"blue.500"} onClick={addHotword} borderRadius="lg">
                    Add
                  </Button>
                </Flex>

                {hotwords.length > 0 && (
                  <Flex gap={2} wrap="wrap" mt={3}>
                    {hotwords.map((hw, i) => (
                      <Box key={`${hw}-${i}`} display="flex" alignItems="center" bg="blue.50" px={3} py={1} borderRadius="lg" shadow="sm">
                        <Text fontSize="sm" color="blue.700">{hw}</Text>
                        <Button size="xs" ml={2} onClick={() => removeHotword(i)} variant="ghost" color="red.500">
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>

              <Flex gap={3} justify="flex-end" wrap="wrap">
                <Button 
                  variant="outline" 
                  onClick={clearRecording}
                  disabled={isUploading}
                  size="md"
                  borderRadius="lg"
                  px={4}
                  fontWeight="semibold"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ 
                    bg: 'gray.50',
                    borderColor: 'gray.400'
                  }}
                >
                  Discard
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadRecording}
                  disabled={isUploading}
                  size="md"
                  borderRadius="lg"
                  px={4}
                  fontWeight="semibold"
                  borderColor="blue.300"
                  color="blue.600"
                  _hover={{ 
                    bg: 'blue.50',
                    borderColor: 'blue.400'
                  }}
                >
                  <FaDownload style={{ marginRight: '8px' }} />
                  Download
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={handleUpload}
                  loading={isUploading}
                  loadingText="Processing..."
                  size="md"
                  borderRadius="lg"
                  px={6}
                  fontWeight="bold"
                  bg="linear-gradient(135deg, #3b82f6, #1d4ed8)"
                  color="white"
                  shadow="lg"
                  _hover={{ 
                    transform: 'translateY(-1px)',
                    shadow: 'xl',
                    bg: "linear-gradient(135deg, #1d4ed8, #1e40af)"
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  <FaUpload style={{ marginRight: '8px' }} />
                  Process Recording
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      )}
          </Stack>
        </Box>
      </Box>
    </Layout>
  );
}