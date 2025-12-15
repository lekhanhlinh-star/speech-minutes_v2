// src/pages/MeetingStatusPage.tsx

"use client"

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Button,
  IconButton,
} from "@chakra-ui/react"
import { FiCheckCircle, FiXCircle, FiWifiOff, FiLoader, FiRefreshCw } from "react-icons/fi"
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import { Header } from "@/components/Header"
import { useNavigate } from "react-router-dom"
import { useColorModeValue } from "@/components/ui/color-mode"
import { getAudioList } from "@/api"

// Hook tùy chỉnh cho smart polling
const useSmartPolling = () => {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPolling, setIsPolling] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const lastFetchRef = useRef<number>(0)
  const lastDataRef = useRef<string>('') // Để so sánh data có thay đổi không

  const fetchMeetings = useCallback(async (isPollingCall = false) => {
    // Tránh gọi API quá thường xuyên (debounce)
    const now = Date.now()
    if (isPollingCall && now - lastFetchRef.current < 5000) {
      return
    }
    lastFetchRef.current = now

    // Chỉ show loading cho lần fetch đầu tiên hoặc manual refresh
    if (!isPollingCall) setLoading(true)
    
    try {
      const res = await getAudioList();
      if (res.ok) {
        const data = await res.json();
        
        // So sánh data mới với data cũ để tránh re-render không cần thiết
        const dataString = JSON.stringify(data);
        if (isPollingCall && dataString === lastDataRef.current) {
          // Data không thay đổi, không cần update state
          return;
        }
        lastDataRef.current = dataString;

        // Map API data to meeting structure
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          // Normalize status for display and filter
          let status = "Completed";
          if (item.status) {
            const s = item.status.toLowerCase();
            if (s === "processing") status = "Processing";
            else if (s === "failed") status = "Failed";
            else if (s === "connection failed") status = "Connection Failed";
            else if (s === "completed") status = "Completed";
            else status = item.status;
          }
          return {
            id: item.audio_id || item.id,
            title: item.filename,
            date: item.upload_time ? new Date(item.upload_time).toLocaleString() : '',
            status,
            avatar: item.filename ? item.filename[0].toUpperCase() : "A",
            tag: item.tag || "",
          };
        });
        
        // Chỉ update state khi có thay đổi thực sự
        setMeetings(prevMeetings => {
          const prevString = JSON.stringify(prevMeetings);
          const newString = JSON.stringify(mapped);
          if (prevString === newString) {
            return prevMeetings; // Không thay đổi, tránh re-render
          }
          return mapped;
        });
        
        setRetryCount(0); // Reset retry count on success
        
        // Kiểm tra xem có meeting nào đang processing không
        const hasProcessing = mapped.some((meeting: any) => meeting.status === "Processing");
        setIsPolling(prev => prev !== hasProcessing ? hasProcessing : prev); // Chỉ update khi thay đổi
        
      } else if (res.status === 404) {
        // 404 means no files exist yet - show empty state instead of error
        setMeetings([]);
        setRetryCount(0);
        setIsPolling(false);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Fetch meetings failed", err);
      
      // Handle 404 errors gracefully (no files exist yet)
      if (err instanceof Error && err.message.includes('404')) {
        setMeetings([]);
        setRetryCount(0);
        setIsPolling(false);
        if (!isPollingCall) setLoading(false);
        return;
      }
      
      setRetryCount(prev => prev + 1);
      
      // Nếu là polling call và gặp lỗi, thử lại với exponential backoff
      if (isPollingCall && retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s
        setTimeout(() => fetchMeetings(true), delay);
      } else if (!isPollingCall) {
        setMeetings([]);
        setIsPolling(false);
      }
    } finally {
      // Chỉ tắt loading cho manual calls
      if (!isPollingCall) setLoading(false);
    }
  }, [retryCount]);

  // Smart polling effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isPolling) {
      // Adaptive polling interval: tăng dần nếu không có thay đổi
      const baseInterval = 10000; // 10 seconds
      const adaptiveInterval = Math.min(baseInterval * (1 + retryCount * 0.5), 60000); // Max 60s
      
      intervalRef.current = setInterval(() => {
        fetchMeetings(true);
      }, adaptiveInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, retryCount, fetchMeetings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { meetings, loading, isPolling, fetchMeetings, retryCount };
}



// Tạo component con được memoized cho meeting item
const MeetingItem = memo(({ meeting, navigate, borderColor, textColor }: any) => (
  <Flex
    key={meeting.id || meeting.title}
    align="center"
    justify="space-between"
    p={{ base: 3, md: 4 }}
    bg={useColorModeValue("gray.50", "gray.700")}
    borderRadius="lg"
    borderWidth="1px"
    borderColor={meeting.status === "Processing" ? useColorModeValue("blue.200", "blue.500") : borderColor}
    _hover={meeting.status === "Completed" ? { bg: useColorModeValue("gray.100", "gray.600"), boxShadow: "md" } : {}}
    width="100%"
    cursor={meeting.status === "Completed" ? "pointer" : "not-allowed"}
    transition="all 0.15s"
    onClick={meeting.status === "Completed" ? () => navigate(`/meeting/${meeting.id}`) : undefined}
    opacity={meeting.status === "Completed" ? 1 : 0.7}
    pointerEvents={meeting.status === "Completed" ? "auto" : "none"}
    direction={{ base: "column", sm: "row" }}
    gap={{ base: 3, sm: 4 }}
    // Highlight processing meetings
    boxShadow={meeting.status === "Processing" ? "0 0 0 2px rgba(66, 153, 225, 0.3)" : undefined}
  >
    <HStack gap={{ base: 3, md: 4 }} flex={1} w="100%">
      {/* Avatar */}
      <Box
        bg="blue.500"
        color="white"
        borderRadius="full"
        boxSize={{ base: "28px", md: "32px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight="bold"
        fontSize={{ base: "xs", md: "sm" }}
        flexShrink={0}
      >
        {meeting.avatar}
      </Box>
      {/* Meeting info */}
      <Box flex={1} minW={0}>
        <Text 
          fontWeight="medium" 
          fontSize={{ base: "sm", md: "md" }}
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: window.innerWidth < 768 ? 2 : 1,
          }}
        >
          {meeting.title}
        </Text>
        <Text 
          fontSize={{ base: "xs", md: "sm" }} 
          color={textColor}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {meeting.date}
        </Text>
      </Box>
    </HStack>

    {/* Status and tag - Mobile responsive */}
    <HStack gap={{ base: 2, md: 4 }} flexShrink={0}>
      {/* Status badge */}
      <Badge
        colorScheme={meeting.status === "Completed" ? "green" : meeting.status === "Processing" ? "yellow" : "red"}
        variant="subtle"
        fontSize={{ base: "xs", md: "sm" }}
        px={{ base: 2, md: 3 }}
        py={1}
        borderRadius="md"
        display="flex"
        alignItems="center"
        gap={1}
      >
        {meeting.status === "Completed" && <Icon as={FiCheckCircle} boxSize={{ base: 3, md: 4 }} />}
        {meeting.status === "Processing" && <Icon as={FiLoader} boxSize={{ base: 3, md: 4 }} className="spin" />}
        {meeting.status === "Failed" && <Icon as={FiXCircle} boxSize={{ base: 3, md: 4 }} />}
        {meeting.status === "Connection Failed" && <Icon as={FiWifiOff} boxSize={{ base: 3, md: 4 }} />}
        {["Completed","Processing","Failed","Connection Failed"].includes(meeting.status) ? null : <Icon as={FiCheckCircle} boxSize={{ base: 3, md: 4 }} />}
        <Text display={{ base: "none", sm: "inline" }}>{meeting.status}</Text>
      </Badge>

      {/* Tag notification */}
      {meeting.tag && (
        <Badge
          colorScheme="purple"
          variant="subtle"
          fontSize="xs"
          py={1}
          px={2}
          borderRadius="md"
          display={{ base: "none", md: "flex" }}
        >
          {meeting.tag}
        </Badge>
      )}
    </HStack>
  </Flex>
))

export default function MeetingStatusPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Sử dụng smart polling hook
  const { meetings, loading, isPolling, fetchMeetings, retryCount } = useSmartPolling();

  // Memoize filtered và sorted meetings để tránh re-render không cần thiết
  const displayMeetings = useMemo(() => {
    return meetings
      .filter(meeting =>
        statusFilter === "All Status" ? true : meeting.status === statusFilter
      )
      .sort((a, b) => {
        // Sắp xếp: Processing lên đầu, sau đó theo thời gian
        if (a.status === "Processing" && b.status !== "Processing") return -1;
        if (b.status === "Processing" && a.status !== "Processing") return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [meetings, statusFilter]);

  // Initial fetch
  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  // Cập nhật thời gian last update khi meetings thay đổi (nhưng không gây re-render)
  useEffect(() => {
    if (meetings.length > 0) {
      setLastUpdate(new Date())
    }
  }, [meetings])

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.600", "gray.300")

  // Thêm hàm refresh thủ công
  const handleRefresh = useCallback(() => {
    fetchMeetings(false); // false = not a polling call, will show loading
  }, [fetchMeetings]);

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header và Sidebar */}
  <Header />

      {/* Nội dung chính */}
      <Box
        ml={{ base: 0, md: "220px" }}
        pt={{ base: 16, md: 10 }}
        px={{ base: 4, md: 8 }}
        pb={10}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH={{ base: "calc(100vh - 64px)", md: "calc(100vh - 64px)" }}
      >
        {/* Tiêu đề trang với nút refresh */}
        <Flex align="center" justify="space-between" w="100%" mb={6}>
          <Text fontSize="xl" fontWeight="medium">
            Meeting Status
          </Text>
          <IconButton
            aria-label="Refresh"
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            loading={loading}
            colorScheme="blue"
          >
            <Icon as={FiRefreshCw} />
          </IconButton>
        </Flex>

        {/* Filter bar - Mobile responsive */}
        <Flex 
          align={{ base: "stretch", md: "center" }} 
          justify={{ base: "stretch", md: "space-between" }} 
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
          mb={6} 
          w="100%"
        >
          <Box>
            <label htmlFor="status-filter" style={{ fontWeight: 500, marginRight: 8, fontSize: "0.9rem" }}>Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                fontSize: '0.9rem',
                minWidth: 140,
                outline: 'none',
                width: window.innerWidth < 768 ? '100%' : 'auto',
              }}
            >
              <option>All Status</option>
              <option>Processing</option>
              <option>Completed</option>
              <option>Failed</option>
              <option>Connection Failed</option>
            </select>
          </Box>
          <Text 
            fontSize={{ base: "sm", md: "sm" }} 
            color={textColor} 
            cursor="pointer"
            alignSelf={{ base: "flex-end", md: "auto" }}
            display={{ base: "none", md: "block" }}
          >
            Feedback
          </Text>
        </Flex>

        {/* Date range với last update */}
        <Flex align="center" justify="space-between" w="100%" mb={4}>
          <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
            Oct 26 - Nov 1
          </Text>
          {lastUpdate && (
            <Text fontSize="xs" color={textColor}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Flex>

        {/* Meeting list - Mobile responsive */}
        <VStack align="stretch" gap={{ base: 3, md: 4 }}>
          {/* Hiển thị trạng thái polling thông minh */}
          {isPolling && (
            <HStack 
              gap={2} 
              p={3} 
              bg={useColorModeValue("blue.50", "blue.900")} 
              borderRadius="md"
              justify="center"
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "blue.700")}
            >
              <Icon as={FiLoader} className="spin" color="blue.500" />
              <Text fontSize="sm" color={useColorModeValue("blue.700", "blue.300")}>
                Auto-updating status... {retryCount > 0 && `(Retry ${retryCount}/3)`}
              </Text>
              <Text fontSize="xs" color={useColorModeValue("blue.600", "blue.400")}>
                • Processing meetings will update automatically
              </Text>
            </HStack>
          )}
          
          {/* Hiển thị thông tin kết nối nếu có lỗi */}
          {retryCount > 0 && !isPolling && (
            <HStack 
              gap={2} 
              p={3} 
              bg={useColorModeValue("orange.50", "orange.900")} 
              borderRadius="md"
              justify="center"
              border="1px solid"
              borderColor={useColorModeValue("orange.200", "orange.700")}
            >
              <Icon as={FiWifiOff} color="orange.500" />
              <Text fontSize="sm" color={useColorModeValue("orange.700", "orange.300")}>
                Connection issues detected. Last update may not be current.
              </Text>
              <Button size="xs" colorScheme="orange" variant="outline" onClick={handleRefresh}>
                Retry
              </Button>
            </HStack>
          )}
          
          {loading ? (
            <Text>Loading...</Text>
          ) : displayMeetings.length === 0 ? (
            <VStack gap={4} py={8} align="center">
              <Text color={textColor} fontSize="lg">No meetings found</Text>
              <Text color={textColor} fontSize="sm" textAlign="center">
                {statusFilter === "All Status" 
                  ? "Upload your first audio file to get started with meeting transcriptions and summaries."
                  : `No meetings with status "${statusFilter}". Try changing the filter or upload a new file.`
                }
              </Text>
              <Button colorScheme="purple" size="sm" onClick={() => navigate('/upload')}>
                Upload Audio File
              </Button>
            </VStack>
          ) : (
            displayMeetings.map((meeting) => (
              <MeetingItem
                key={meeting.id || meeting.title}
                meeting={meeting}
                navigate={navigate}
                borderColor={borderColor}
                textColor={textColor}
              />
            ))
          )}
        </VStack>

        {/* Footer chatbot */}
        {/* <Box mt={10} p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg" textAlign="center">
          <HStack justify="center" gap={2}>
            <Icon as={FiCalendar} color="purple.500" boxSize={4} />
            <Text fontSize="sm">Ask anything from your meetings...</Text>
            <Icon as={FiArrowRight} color="purple.500" boxSize={4} />
          </HStack>
        </Box> */}
      </Box>
    </Box>
  )
}