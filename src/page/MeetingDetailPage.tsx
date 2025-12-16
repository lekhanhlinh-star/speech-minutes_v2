"use client"

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Input,
  InputGroup,
  IconButton,
  Badge,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react"
import { FiRotateCcw, FiRotateCw, FiPlay, FiPause, FiDownload, FiCopy } from "react-icons/fi"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTranscriptByAudioId, getSummaryByAudioId, getAudioList } from "@/api"
import { useColorModeValue } from "@/components/ui/color-mode"
// import { ChatBubble } from "@/components/ChatBubble"

export default function MeetingDetailPage() {
  // State for resizable summary pane (desktop only)
  const [summaryWidth, setSummaryWidth] = useState(340);
  const minSummaryWidth = 240;
  const maxSummaryWidth = 600;
  const isDraggingRef = useRef(false);
  
  // Mobile breakpoint
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Mouse event handlers for resizing (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip on mobile
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const container = document.getElementById('resizable-sections');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let newWidth = e.clientX - rect.left;
      newWidth = Math.max(minSummaryWidth, Math.min(maxSummaryWidth, newWidth));
      setSummaryWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile]);

  const { meetingId = '' } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>({
    id: '',
    title: '',
    duration: '',
    speakers: [],
  });
  const [transcript, setTranscript] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  // State for selected transcript segment
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  // Refs for transcript segments
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scroll to active segment when audioCurrent changes
  useEffect(() => {
    if (!transcript || transcript.length === 0) return;
    const idx = transcript.findIndex(
      (line: any) => typeof line.start === 'number' && typeof line.end === 'number' && audioCurrent >= line.start && audioCurrent < line.end
    );
    if (idx !== -1 && segmentRefs.current[idx]) {
      segmentRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [audioCurrent, transcript]);

  // Play segment audio from start to end
  useEffect(() => {
    if (selectedSegment == null || !transcript[selectedSegment]) return;
    const seg = transcript[selectedSegment];
    if (typeof seg.start !== 'number' || typeof seg.end !== 'number') return;
    const audio = document.getElementById('real-audio') as HTMLAudioElement | null;
    if (!audio) return;
    audio.currentTime = seg.start;
    audio.play();
    setIsPlaying(true);
    // Pause at segment end
    const onTimeUpdate = () => {
      if (audio.currentTime >= seg.end) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    // Clean up
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [selectedSegment, transcript, setIsPlaying]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Hàm xử lý khi click vào thanh progress
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioUrl) return
    const audio = document.getElementById('real-audio') as HTMLAudioElement
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * audio.duration
    setAudioCurrent(percent * audio.duration)
  }

  // Theo dõi trạng thái play/pause của audio
  useEffect(() => {
    const audio = document.getElementById('real-audio') as HTMLAudioElement|null;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTime = () => setAudioCurrent(audio.currentTime);
    const handleLoaded = () => setAudioDuration(audio.duration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('loadedmetadata', handleLoaded);
    // init duration if already loaded
    if (!isNaN(audio.duration)) setAudioDuration(audio.duration);
    // set playbackRate
    audio.playbackRate = audioSpeed;
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [audioUrl, audioSpeed]);

  const fetchMeeting = async () => {
    setLoading(true);
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      if (meetingId) {
        // Lấy transcript và summary từ API
        const data = await getTranscriptByAudioId(meetingId);
        setTranscript(data[0]?.segments || []);
        // Lấy speakers từ transcript nếu có
        const speakers = Array.from(new Set((data[0]?.segments || []).map((seg: any) => seg.speaker))).map((name, idx) => ({ name, color: ["blue.500","green.500","purple.500","orange.500","red.500"][idx % 5] }));
        setMeeting({
          id: meetingId,
          title: data[0]?.audio_name || '',
          duration: '', // duration sẽ lấy từ audio metadata
          speakers,
        });
        const summaryData = await getSummaryByAudioId(meetingId);
        setSummary(summaryData.summary ? summaryData.summary : summaryData);
        // Lấy audioUrl từ getAudioList
        const audioListRes = await getAudioList();
        if (audioListRes.ok) {
          const audioList = await audioListRes.json();
          const found = audioList.find((item: any) => item.audio_id === meetingId);
          if (found && found.s3_url) setAudioUrl(found.s3_url);
          else setAudioUrl(null);
        } else {
          setAudioUrl(null);
        }
      } else {
        setMeeting({ id: '', title: '', duration: '', speakers: [] });
        setTranscript([]);
        setSummary({ summary: '', agendas: [], action_items: [] });
        setAudioUrl(null);
      }
    } catch (err) {
      console.error("Fetch meeting detail failed", err);
      setMeeting({ id: '', title: '', duration: '', speakers: [] });
      setTranscript([]);
      setSummaryError("Không lấy được summary từ API");
      setSummary({ summary: '', agendas: [], action_items: [] });
      setAudioUrl(null);
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  } 

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const mutedTextColor = useColorModeValue("gray.500", "gray.400")
  const accentColor = useColorModeValue("purple.500", "purple.400")

  // Enhanced loading state
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Box
          ml={{ base: 0, md: "220px" }}
          pt={{ base: 16, md: 10 }}
          px={{ base: 4, md: 8 }}
          pb={10}
        >
          <VStack gap={6} align="stretch">
            {/* Loading skeleton for header */}
            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={6}
              boxShadow="sm"
            >
              <HStack justify="space-between" mb={4}>
                <Box h="8" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" w="200px" />
                <Box h="8" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" w="80px" />
              </HStack>
              <HStack gap={4}>
                <Box h="6" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" w="100px" />
                <Box h="6" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" w="120px" />
              </HStack>
            </Box>
            
            {/* Loading skeleton for content */}
            <HStack gap={4} align="stretch" h="400px">
              <Box
                bg={cardBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={6}
                flex={1}
                boxShadow="sm"
              >
                <VStack gap={4} align="stretch">
                  {[...Array(5)].map((_, i) => (
                    <Box key={i} h="4" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" />
                  ))}
                </VStack>
              </Box>
              <Box
                bg={cardBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={6}
                w="300px"
                boxShadow="sm"
              >
                <VStack gap={4} align="stretch">
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} h="4" bg={useColorModeValue("gray.200", "gray.700")} borderRadius="md" />
                  ))}
                </VStack>
              </Box>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Enhanced error state
  if (!meeting || !meetingId) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Box
          ml={{ base: 0, md: "220px" }}
          pt={{ base: 16, md: 10 }}
          px={{ base: 4, md: 8 }}
          pb={10}
        >
          <Flex direction="column" align="center" justify="center" h="60vh">
            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={8}
              boxShadow="lg"
              textAlign="center"
              maxW="400px"
            >
              <Text fontSize="6xl" mb={4}>🔍</Text>
              <Text fontSize="xl" fontWeight="bold" mb={2}>Meeting Not Found</Text>
              <Text color={mutedTextColor} mb={6}>
                The meeting you're looking for doesn't exist or has been removed.
              </Text>
              <Button
                colorScheme="purple"
                onClick={() => navigate('/')}
                size="lg"
                borderRadius="full"
              >
                Go Back Home
              </Button>
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Main Content */}
      <Box
        ml={{ base: 0, md: "220px" }}
        pt={{ base: 16, md: 10 }}
        px={{ base: 4, md: 8 }}
        pb={10}
      >
        {/* Enhanced Header Section */}
     

        {/* Main content - Enhanced Responsive layout */}
        {isMobile ? (
          /* Mobile Layout - Simplified */
          <VStack gap={6} align="stretch" w="100%">
            {/* Transcript Section (Mobile) */}
            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              pt={10}
              borderColor={borderColor}
              overflow="hidden"
              boxShadow="sm"
            >
              <Box bg={useColorModeValue("gray.50", "gray.900")} px={4} py={3}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                    📝 Transcript
                  </Text>
                  <Badge colorScheme="purple" borderRadius="full" px={3}>
                    {transcript?.length || 0} segments
                  </Badge>
                </HStack>
              </Box>
                
              <Box p={{ base: 4, md: 6 }}>
                <VStack align="stretch" gap={4}>
                  {/* Search bar */}
                  {/* <InputGroup>
                    <Input
                      placeholder="Search transcript..."
                      size="sm"
                      borderRadius="full"
                      bg={useColorModeValue("gray.50", "gray.800")}
                      border="none"
                      _focus={{ 
                        bg: useColorModeValue("white", "gray.700"),
                        boxShadow: "0 0 0 2px rgba(128, 90, 213, 0.2)"
                      }}
                    />
                  </InputGroup> */}
                  
                  {/* Enhanced transcript list */}
                  <Box maxH="60vh" overflowY="auto" css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: useColorModeValue('#f1f1f1', '#2d2d2d'),
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: useColorModeValue('#888', '#555'),
                      borderRadius: '2px',
                    },
                  }}>
                    <VStack align="stretch" gap={3}>
                      {transcript && transcript.length > 0 ? transcript.map((line: any, index: number) => {
                        const speaker = meeting.speakers.find((s: any) => s.name === line.speaker);
                        let timeLabel = '';
                        if (typeof line.start === 'number' && typeof line.end === 'number') {
                          timeLabel = `${formatTime(line.start)} - ${formatTime(line.end)}`;
                        } else if (line.time) {
                          timeLabel = line.time;
                        }
                        const isActive = (typeof line.start === 'number' && typeof line.end === 'number' && audioCurrent >= line.start && audioCurrent < line.end);
                        const isSelected = selectedSegment === index;
                        return (
                          <Box
                            key={index}
                            ref={(el: HTMLDivElement | null) => { segmentRefs.current[index] = el; }}
                            onClick={() => setSelectedSegment(index)}
                            cursor="pointer"
                            bg={isSelected || isActive ? useColorModeValue('purple.50', 'purple.900') : 'transparent'}
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor={isSelected || isActive ? useColorModeValue('purple.200', 'purple.700') : 'transparent'}
                            transition="all 0.2s ease"
                            _hover={{ 
                              bg: isSelected || isActive ? useColorModeValue('purple.100', 'purple.800') : useColorModeValue('gray.50', 'gray.700'),
                              borderColor: useColorModeValue('purple.300', 'purple.600'),
                              transform: 'translateY(-1px)',
                              boxShadow: 'sm'
                            }}
                            p={4}
                          >
                            <VStack align="stretch" gap={2}>
                              <HStack justify="space-between">
                                {line.speaker && (
                                  <Badge 
                                    colorScheme={speaker?.color?.replace(".500", "") || "gray"} 
                                    borderRadius="full" 
                                    px={3} 
                                    py={1} 
                                    fontSize="xs"
                                    fontWeight="medium"
                                  >
                                    {line.speaker}
                                  </Badge>
                                )}
                                <HStack gap={2}>
                                  <Text fontSize="xs" color={mutedTextColor}>{timeLabel}</Text>
                                  {isActive && (
                                    <Box
                                      w={2}
                                      h={2}
                                      bg="green.400"
                                      borderRadius="full"
                                      animation="pulse 2s infinite"
                                    />
                                  )}
                                </HStack>
                              </HStack>
                              <Text fontSize="sm" lineHeight="tall" color={textColor}>
                                {line.text}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      }) : (
                        <Flex direction="column" align="center" justify="center" py={12}>
                          <Text fontSize="4xl" mb={4}>📝</Text>
                          <Text fontSize="lg" fontWeight="medium" mb={2}>No transcript available</Text>
                          <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                            The transcript will appear here once the audio is processed.
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </Box>

            {/* Summary Section (Mobile - Collapsible) */}
            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={{ base: 4, md: 6 }}
              maxH="40vh"
              overflowY="auto"
              boxShadow="sm"
            >
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color={accentColor}>📋 Summary</Text>
                  <IconButton aria-label="Copy link" size="sm" variant="ghost" colorScheme="gray">
                    <Icon as={FiCopy} />
                  </IconButton>
                </HStack>

                {summaryLoading ? (
                  <Flex align="center" gap={3} py={8}>
                    <Spinner size="sm" color="purple.500" />
                    <Text>Loading summary...</Text>
                  </Flex>
                ) : summaryError ? (
                  <Text color="red.500">{summaryError}</Text>
                ) : summary ? (
                  <>
                    {summary.summary && (
                      <Box>
                        <Text fontWeight="bold" fontSize="md" mb={2}>📝 Summary</Text>
                        <Text fontSize="sm" color={textColor}>{summary.summary}</Text>
                      </Box>
                    )}
                    {Array.isArray(summary.agendas) && summary.agendas.length > 0 && (
                      <Box>
                        <Text fontWeight="bold" fontSize="md" mb={2}>🗂️ Agendas</Text>
                        {summary.agendas.map((agenda: any, idx: number) => (
                          <Box key={idx} mb={2}>
                            <Text fontWeight="medium" mb={1} fontSize="sm">{agenda.speaker || agenda.name || agenda.title || `Agenda ${idx+1}`}</Text>
                            <VStack align="stretch" gap={1}>
                              {Array.isArray(agenda.points) ? agenda.points.map((pt: string, i: number) => (
                                <Text key={i} fontSize="xs" color={textColor}>• {pt}</Text>
                              )) : <Text fontSize="xs" color={textColor}>{agenda.points}</Text>}
                            </VStack>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {Array.isArray(summary.action_items) && summary.action_items.length > 0 && (
                      <Box>
                        <Text fontWeight="bold" fontSize="md" mb={2}>✅ Action Items</Text>
                        <VStack align="stretch" gap={1}>
                          {summary.action_items.map((item: any, idx: number) => (
                            <Text key={idx} fontSize="xs" color={textColor}>- {item.task || item.description || JSON.stringify(item)}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </>
                ) : (
                  <Flex direction="column" align="center" justify="center" py={8}>
                    <Text fontSize="4xl" mb={4}>📋</Text>
                    <Text fontSize="lg" fontWeight="medium" mb={2}>No summary available</Text>
                    <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                      The summary will appear here once the audio is processed.
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>
          </VStack>
        ) : (
          /* Desktop Layout - Resizable horizontal layout */
          <Flex
            id="resizable-sections"
            gap={0}
            align="stretch"
            style={{ width: '100%', minHeight: '400px', position: 'relative', userSelect: isDraggingRef.current ? 'none' : undefined }}
          >
            {/* Left column: Summary */}
            <Box
              id="summary-pane"
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={6}
              height="calc(100vh - 200px)"
              overflowY="auto"
              boxShadow="sm"
              style={{ width: summaryWidth, minWidth: minSummaryWidth, maxWidth: maxSummaryWidth, flexShrink: 0, transition: isDraggingRef.current ? 'none' : 'width 0.15s' }}
            >
              <VStack align="stretch" gap={6}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color={accentColor}>📋 Summary</Text>
                  <IconButton aria-label="Copy link" size="sm" variant="ghost" colorScheme="gray">
                    <Icon as={FiCopy} />
                  </IconButton>
                </HStack>

                {summaryLoading ? (
                  <Flex align="center" gap={3} py={8}>
                    <Spinner size="sm" color="purple.500" />
                    <Text>Loading summary...</Text>
                  </Flex>
                ) : summaryError ? (
                  <Text color="red.500">{summaryError}</Text>
                ) : summary ? (
                  <>
                    {summary.summary && (
                      <Box mb={4}>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>📝 Summary</Text>
                        <Text fontSize="md" color={textColor}>{summary.summary}</Text>
                      </Box>
                    )}
                    {Array.isArray(summary.agendas) && summary.agendas.length > 0 && (
                      <Box mb={4}>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>🗂️ Agendas</Text>
                        {summary.agendas.map((agenda: any, idx: number) => (
                          <Box key={idx} mb={2}>
                            <Text fontWeight="medium" mb={1}>{agenda.speaker || agenda.name || agenda.title || `Agenda ${idx+1}`}</Text>
                            <VStack align="stretch" gap={1}>
                              {Array.isArray(agenda.points) ? agenda.points.map((pt: string, i: number) => (
                                <Text key={i} fontSize="sm" color={textColor}>• {pt}</Text>
                              )) : <Text fontSize="sm" color={textColor}>{agenda.points}</Text>}
                            </VStack>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {Array.isArray(summary.action_items) && summary.action_items.length > 0 && (
                      <Box mb={4}>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>✅ Action Items</Text>
                        <VStack align="stretch" gap={1}>
                          {summary.action_items.map((item: any, idx: number) => (
                            <Text key={idx} fontSize="sm" color={textColor}>- {item.task || item.description || JSON.stringify(item)}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </>
                ) : (
                  <Flex direction="column" align="center" justify="center" py={8}>
                    <Text fontSize="4xl" mb={4}>📋</Text>
                    <Text fontSize="lg" fontWeight="medium" mb={2}>No summary available</Text>
                    <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                      The summary will appear here once the audio is processed.
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>

            {/* Divider handle (draggable) - Desktop only */}
            <Box
              width="8px"
              cursor="col-resize"
              bg={useColorModeValue('gray.100', 'gray.600')}
              _hover={{ bg: useColorModeValue('purple.200', 'purple.700') }}
              transition="background 0.2s"
              borderRadius="full"
              mx={1}
              style={{ userSelect: 'none', zIndex: 10 }}
              onMouseDown={() => { isDraggingRef.current = true; }}
            />
            
            {/* Right column: Transcript */}
            <Box
              flex={1}
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={6}
              height="calc(100vh - 200px)"
              overflowY="auto"
              minWidth={0}
              boxShadow="sm"
            >
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                    📝 Transcript
                  </Text>
                  <Badge colorScheme="purple" borderRadius="full" px={3}>
                    {transcript?.length || 0} segments
                  </Badge>
                </HStack>

                <InputGroup>
                  <Input
                    placeholder="Search transcript..."
                    size="sm"
                    borderRadius="full"
                    bg={useColorModeValue("gray.50", "gray.800")}
                    border="none"
                    _focus={{ 
                      bg: useColorModeValue("white", "gray.700"),
                      boxShadow: "0 0 0 2px rgba(128, 90, 213, 0.2)"
                    }}
                  />
                </InputGroup>

                <VStack align="stretch" gap={4}>
                  {transcript && transcript.length > 0 ? transcript.map((line: any, index: number) => {
                    const speaker = meeting.speakers.find((s: any) => s.name === line.speaker);
                    let timeLabel = '';
                    if (typeof line.start === 'number' && typeof line.end === 'number') {
                      timeLabel = `${formatTime(line.start)} - ${formatTime(line.end)}`;
                    } else if (line.time) {
                      timeLabel = line.time;
                    }
                    const isActive = (typeof line.start === 'number' && typeof line.end === 'number' && audioCurrent >= line.start && audioCurrent < line.end);
                    const isSelected = selectedSegment === index;
                    return (
                      <Box
                        key={index}
                        ref={(el: HTMLDivElement | null) => { segmentRefs.current[index] = el; }}
                        onClick={() => setSelectedSegment(index)}
                        cursor="pointer"
                        bg={isSelected || isActive ? useColorModeValue('purple.50', 'purple.900') : 'transparent'}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={isSelected || isActive ? useColorModeValue('purple.200', 'purple.700') : 'transparent'}
                        transition="all 0.2s ease"
                        _hover={{ 
                          bg: isSelected || isActive ? useColorModeValue('purple.100', 'purple.800') : useColorModeValue('gray.50', 'gray.700'),
                          borderColor: useColorModeValue('purple.300', 'purple.600'),
                          transform: 'translateY(-1px)',
                          boxShadow: 'sm'
                        }}
                        p={4}
                      >
                        <VStack align="stretch" gap={2}>
                          <HStack justify="space-between">
                            {line.speaker && (
                              <Badge 
                                colorScheme={speaker?.color?.replace(".500", "") || "gray"} 
                                borderRadius="full" 
                                px={3} 
                                py={1} 
                                fontSize="xs"
                                fontWeight="medium"
                              >
                                {line.speaker}
                              </Badge>
                            )}
                            <HStack gap={2}>
                              <Text fontSize="xs" color={mutedTextColor}>{timeLabel}</Text>
                              {isActive && (
                                <Box
                                  w={2}
                                  h={2}
                                  bg="green.400"
                                  borderRadius="full"
                                  animation="pulse 2s infinite"
                                />
                              )}
                            </HStack>
                          </HStack>
                          <Text fontSize="sm" lineHeight="tall" color={textColor}>
                            {line.text}
                          </Text>
                        </VStack>
                      </Box>
                    );
                  }) : (
                    <Flex direction="column" align="center" justify="center" py={12}>
                      <Text fontSize="4xl" mb={4}>📝</Text>
                      <Text fontSize="lg" fontWeight="medium" mb={2}>No transcript available</Text>
                      <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                        The transcript will appear here once the audio is processed.
                      </Text>
                    </Flex>
                  )}
                </VStack>
              </VStack>
            </Box>
          </Flex>
        )}

        {/* Enhanced Audio Player */}
        <Box
          mt={6}
          width="100%"
          maxWidth="100%"
          bg={cardBg}
          boxShadow="xl"
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          position={{ base: "sticky", lg: "static" }}
          bottom={{ base: 0, lg: "auto" }}
          zIndex={{ base: 100, lg: "auto" }}
          background="linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)"
        >
          <audio id="real-audio" src={audioUrl || undefined} style={{ display: 'none' }} preload="auto" />

          {/* Progress Bar Section */}
          <Flex direction="column" align="stretch" width="100%" mb={{ base: 2, md: 3 }}> 
            <Box
              width="100%"
              height="20px" // Giảm từ 24px xuống 20px
              position="relative"
              display="flex"
              alignItems="center"
              onClick={handleProgressClick} 
              style={{ cursor: 'pointer' }}
            >
              {/* Track */}
              <Box
                position="absolute"
                left={0}
                top="50%"
                transform="translateY(-50%)"
                width="100%"
                height="6px"
                bg={useColorModeValue("gray.200", "gray.700")}
                borderRadius="full"
                zIndex={1}
              />
              {/* Progress fill */}
              <Box
                position="absolute"
                left={0}
                top="50%"
                transform="translateY(-50%)"
                height="6px"
                width={`${(audioCurrent / audioDuration) * 100 || 0}%`}
                bg="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                borderRadius="full"
                zIndex={2}
                transition="width 0.1s ease-out"
              />
              {/* Thumb */}
              <Box
                position="absolute"
                top="50%"
                left={`calc(${(audioCurrent / audioDuration) * 100 || 0}% - 10px)`} // Giảm offset
                transform="translateY(-50%)"
                width="20px" // Giảm từ 24px xuống 20px
                height="20px" // Giảm từ 24px xuống 20px
                bg="white"
                border="2px solid #805ad5" // Giảm border từ 3px xuống 2px
                borderRadius="full"
                boxShadow="0 2px 6px rgba(128,90,213,0.3)" // Giảm shadow
                zIndex={3}
                pointerEvents="none"
                display={audioDuration > 0 ? 'block' : 'none'}
                _hover={{
                  transform: "translateY(-50%) scale(1.1)"
                }}
                transition="transform 0.2s"
              />
            </Box>
            <HStack justify="space-between" width="100%" mt={2}>
              <Text fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="medium">
                {formatTime(audioCurrent)}
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} color={textColor} fontWeight="medium">
                {formatTime(audioDuration) || meeting.duration}
              </Text>
            </HStack>
          </Flex>

          {/* Control Buttons */}
          <Box width="100%" px={2}> {/* Add container with padding */}
            <HStack 
              gap={{ base: 1, md: 3 }} 
              flexWrap="wrap" 
              justify="center" 
              py={1}
              align="center"
              width="100%"
            > 
              <Button 
                size={{ base: "xs", md: "sm" }} // Giảm size
                variant="ghost" 
                aria-label="Speed" 
                onClick={() => {
                  setAudioSpeed(prev => {
                    const next = prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1;
                    const audio = document.getElementById('real-audio') as HTMLAudioElement|null;
                    if (audio) audio.playbackRate = next;
                    return next;
                  });
                }}
                borderRadius="full"
                _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
              >
                {audioSpeed}x
              </Button>
              <IconButton 
                aria-label="Rewind" 
                size={{ base: "xs", md: "sm" }} // Giảm size
                variant="ghost" 
                colorScheme="gray" 
                borderRadius="full"
                onClick={() => {
                  const audio = document.getElementById('real-audio') as HTMLAudioElement|null;
                  if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
                }} 
                disabled={!audioUrl}
                _hover={{ bg: useColorModeValue("gray.100", "gray.700"), transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                <Icon as={FiRotateCcw} />
              </IconButton>
              <IconButton 
                aria-label={isPlaying ? "Pause" : "Play"} 
                size={{ base: "md", md: "lg" }} // Giảm size từ lg,xl xuống md,lg
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white" 
                borderRadius="full" 
                _hover={{ 
                  bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  transform: "scale(1.05)",
                  boxShadow: "xl"
                }}
                _active={{
                  transform: "scale(0.95)"
                }}
                transition="all 0.2s"
                onClick={() => {
                  const audio = document.getElementById('real-audio') as HTMLAudioElement|null;
                  if (audio) {
                    if (audio.paused) {
                      audio.play();
                    } else {
                      audio.pause();
                    }
                  }
                }}
                disabled={!audioUrl}
                boxShadow="lg"
              >
                <Icon as={isPlaying ? FiPause : FiPlay} boxSize={{ base: 4, md: 5 }} />
              </IconButton>
              <IconButton 
                aria-label="Forward" 
                size={{ base: "xs", md: "sm" }} // Giảm size
                variant="ghost" 
                colorScheme="gray" 
                borderRadius="full"
                onClick={() => {
                  const audio = document.getElementById('real-audio') as HTMLAudioElement|null;
                  if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                }} 
                disabled={!audioUrl}
                _hover={{ bg: useColorModeValue("gray.100", "gray.700"), transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                <Icon as={FiRotateCw} />
              </IconButton>
              {audioUrl ? (
                <a href={audioUrl} download style={{ display: 'inline-block' }}>
                  <IconButton
                    size={{ base: "xs", md: "sm" }} // Giảm size
                    variant="ghost"
                    colorScheme="gray"
                    borderRadius="full"
                    aria-label="Download"
                    _hover={{ bg: useColorModeValue("gray.100", "gray.700"), transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiDownload} />
                  </IconButton>
                </a>
              ) : (
                <IconButton
                  size={{ base: "xs", md: "sm" }} // Giảm size
                  variant="ghost"
                  colorScheme="gray"
                  borderRadius="full"
                  aria-label="Download"
                  disabled
                >
                  <Icon as={FiDownload} />
                </IconButton>
              )}
            </HStack>
          </Box> {/* Changed from Flex to Box */}
        </Box>
      </Box>

      {/* Floating Chat Bubble */}
      {/* <ChatBubble meetingId={meetingId} meetingTitle={meeting.title} /> */}
    </Box>
  )
}