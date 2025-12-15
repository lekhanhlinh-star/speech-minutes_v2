"use client"

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Textarea,
  Spinner,
  Icon,
  Badge,
  Portal,
  useDisclosure,
} from "@chakra-ui/react"
import { 
  FiMessageCircle, 
  FiSend, 
  FiCpu, 
  FiUser, 
  FiX} from "react-icons/fi"
import { useState, useRef, useEffect } from "react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { chatWithSummary } from "@/api"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBubbleProps {
  meetingId: string;
  meetingTitle?: string;
}

export function ChatBubble({ meetingId, meetingTitle }: ChatBubbleProps) {
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [isMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatScrollRef.current) {
        const scrollElement = chatScrollRef.current;
        // Simple and reliable scroll to bottom
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]); // Only trigger on messages change
  
  // Separate effect for loading state to scroll immediately
  useEffect(() => {
    if (loading && chatScrollRef.current) {
      const scrollElement = chatScrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, [loading]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !meetingId) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await chatWithSummary(meetingId, userMessage);
      
      // Handle different response structures
      let responseContent = '';
      if (typeof response.response === 'string') {
        responseContent = response.response;
      } else if (response.response && typeof response.response === 'object') {
        if (response.response.answer) {
          responseContent = response.response.answer;
        } else if (response.response.output) {
          responseContent = response.response.output;
        } else {
          responseContent = JSON.stringify(response.response);
        }
      } else {
        responseContent = 'I cannot answer this question.';
      }
      
      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatSize = () => {
    // Better mobile-optimized sizes với khoảng cách phù hợp
    return {
      width: { base: "100vw", md: "650px" }, // Full width on mobile
      height: { base: "100vh", md: "700px" }, // Giảm chiều cao trên desktop để tránh overlap
      maxWidth: { base: "100vw", md: "95vw" },
      maxHeight: { base: "100vh", md: "calc(85vh - 100px)" } // Giảm max height để có khoảng cách
    };
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Box
          position="fixed"
          bottom={{ base: "20px", md: "140px" }} // Thấp hơn trên mobile để tránh che UI
          right={{ base: 4, md: 6 }}
          zIndex={1000}
        >
          <IconButton
            onClick={onOpen}
            size="lg"
            borderRadius="full"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            aria-label="Open AI Chat"
            boxShadow="0 4px 20px rgba(102, 126, 234, 0.3)"
            border="2px solid rgba(255,255,255,0.3)"
            _hover={{ 
              transform: "scale(1.05) translateY(-2px)",
              boxShadow: "0 8px 30px rgba(102, 126, 234, 0.4)",
              bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
              borderColor: "rgba(255,255,255,0.5)"
            }}
            _active={{
              transform: "scale(0.95)"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            w={14}
            h={14}
            position="relative"
            css={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
                },
                "50%": {
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.5)"
                }
              }
            }}
          >
            <Icon as={FiMessageCircle} boxSize={6} />
            
            {/* Notification badge if there are unread messages */}
            {messages.length > 0 && (
              <Box
                position="absolute"
                top="-4px"
                right="-4px"
                w="20px"
                h="20px"
                bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                borderRadius="full"
                border="2px solid white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 8px rgba(239, 68, 68, 0.4)"
                animation="bounce 1s infinite"
              >
                <Text fontSize="xs" fontWeight="bold" color="white">
                  {messages.length > 9 ? "9+" : messages.length}
                </Text>
              </Box>
            )}
          </IconButton>
        </Box>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            bottom={{ base: "0", md: "20px" }} // Từ đáy màn hình trên mobile, cách đáy 20px trên desktop
            right={{ base: "0", md: 6 }}
            left={{ base: "0", md: "auto" }}
            top={{ base: "0", md: "auto" }}
            zIndex={1001}
            {...getChatSize()}
            bg={cardBg}
            borderRadius={{ base: "0", md: "2xl" }}
            borderWidth={{ base: "0", md: "1px" }}
            borderColor={borderColor}
            boxShadow={{ base: "none", md: "0 25px 80px rgba(102, 126, 234, 0.15), 0 10px 40px rgba(0,0,0,0.1)" }}
            overflow="hidden"
            transform={isMinimized ? "translateY(calc(100% - 60px))" : "translateY(0)"}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            backdropFilter="blur(20px)"
            border={{ base: "none", md: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            {/* Chat Header */}
            <Box
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              p={{ base: 4, md: 5 }}
              position="relative"
              overflow="hidden"
            >
              {/* Enhanced Background pattern */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={0.15}
                backgroundImage="radial-gradient(circle at 30% 40%, white 2px, transparent 2px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)"
                backgroundSize="30px 30px, 20px 20px"
              />
              
              <Flex justify="space-between" align="center" position="relative" zIndex={1}>
                <HStack gap={3}>
                  <Box
                    p={3}
                    bg="rgba(255, 255, 255, 0.25)"
                    borderRadius="xl"
                    backdropFilter="blur(20px)"
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                  >
                    <Icon as={FiCpu} boxSize={6} />
                  </Box>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                      AI Assistant
                    </Text>
                    <HStack gap={3}>
                      <Badge 
                        colorScheme="green" 
                        variant="solid" 
                        borderRadius="full" 
                        px={3} 
                        py={1}
                        fontSize="xs"
                        bg="rgba(72, 187, 120, 0.9)"
                        backdropFilter="blur(10px)"
                      >
                        ● Online
                      </Badge>
                      {meetingTitle && (
                        <Text 
                          fontSize="sm" 
                          opacity={0.9} 
                          maxW={{ base: "140px", md: "220px" }}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          fontWeight="medium"
                        >
                          📝 {meetingTitle}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                
                <IconButton
                  onClick={onClose}
                  size="lg"
                  variant="solid"
                  bg="rgba(239, 68, 68, 0.9)"
                  color="white"
                  aria-label="Close"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  border="2px solid rgba(255, 255, 255, 0.3)"
                  _hover={{ 
                    bg: "rgba(220, 38, 38, 0.95)",
                    transform: "scale(1.1) rotate(90deg)",
                    boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)"
                  }}
                  _active={{
                    transform: "scale(0.95) rotate(90deg)"
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  boxShadow="0 4px 15px rgba(239, 68, 68, 0.3)"
                >
                  <Icon as={FiX} boxSize={5} />
                </IconButton>
              </Flex>
            </Box>

            {/* Chat Messages */}
            {!isMinimized && (
              <VStack 
                align="stretch" 
                h="100%" 
                gap={0} 
                minH={0}
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: useColorModeValue(
                    "linear-gradient(135deg, rgba(247, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(237, 242, 247, 0.9) 100%)",
                    "linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.95) 50%, rgba(26, 32, 44, 0.9) 100%)"
                  ),
                  opacity: 0.8,
                  pointerEvents: "none"
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(138, 43, 226, 0.02) 0%, rgba(30, 144, 255, 0.02) 50%, rgba(138, 43, 226, 0.02) 100%)",
                  pointerEvents: "none"
                }}
              >
                <Box
                  flex={1}
                  p={4}
                  overflowY="auto"
                  ref={chatScrollRef}
                  minH={0} // Important để flex item có thể shrink
                  position="relative"
                  zIndex={1}
                  mb={{ base: 0, md: 4 }} // Thêm margin bottom trên desktop
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: useColorModeValue('#f1f1f1', '#2d2d2d'),
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: useColorModeValue('#c1c1c1', '#666'),
                      borderRadius: '4px',
                      '&:hover': {
                        background: useColorModeValue('#a8a8a8', '#777'),
                      }
                    },
                    // For Firefox
                    scrollbarWidth: 'thin',
                    scrollbarColor: useColorModeValue('#c1c1c1 #f1f1f1', '#666 #2d2d2d'),
                  }}
                >
                  {messages.length === 0 ? (
                    <VStack align="stretch" h="100%" justify="space-between">
                      {/* Compact Welcome Section */}
                      <Flex direction="column" align="center" justify="center" py={6}>
                        <Box
                          p={3}
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          borderRadius="full"
                          mb={3}
                        >
                          <Icon as={FiMessageCircle} color="white" boxSize={6} />
                        </Box>
                        <Text fontSize="md" fontWeight="medium" mb={1}>Start a conversation</Text>
                        <Text fontSize="xs" color={mutedTextColor} textAlign="center" maxW="85%">
                          Ask me anything about this meeting
                        </Text>
                      </Flex>
                      
                      {/* Quick Questions - Now integrated better */}
                      <Box 
                        flex={1}
                        p={{ base: 4, md: 5 }} 
                        borderTop="2px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        bg={useColorModeValue(
                          "linear-gradient(135deg, rgba(237, 242, 247, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)",
                          "linear-gradient(135deg, rgba(45, 55, 72, 0.8) 0%, rgba(26, 32, 44, 0.9) 100%)"
                        )}
                        position="relative"
                        zIndex={10}
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)",
                          borderRadius: "inherit",
                          pointerEvents: "none"
                        }}
                      >
                        <VStack gap={4} position="relative" zIndex={1}>
                          <HStack gap={2} justify="center" w="100%">
                            <Box
                              w="3px"
                              h="16px"
                              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              borderRadius="full"
                            />
                            <Text 
                              fontSize={{ base: "md", md: "sm" }} 
                              fontWeight="bold" 
                              color={useColorModeValue("gray.800", "white")}
                              textAlign="center"
                              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              backgroundClip="text"
                              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                            >
                              Quick Questions
                            </Text>
                            <Box
                              w="3px"
                              h="16px"
                              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              borderRadius="full"
                            />
                          </HStack>
                          
                          <VStack gap={3} align="stretch" w="100%">
                            {[
                              "What are the main action items from this meeting?",
                              "Who were the key participants and their roles?",
                              "What decisions were made during this meeting?",
                              "What are the next steps and deadlines?",
                              "Can you summarize the key discussion points?",
                              "What issues or challenges were raised?"
                            ].map((question, index) => (
                              <Box
                                key={index}
                                as="button"
                                onClick={() => setInput(question)}
                                p={{ base: 3, md: 2.5 }}
                                borderRadius="xl"
                                bg={useColorModeValue(
                                  "rgba(255, 255, 255, 0.8)",
                                  "rgba(45, 55, 72, 0.8)"
                                )}
                                backdropFilter="blur(10px)"
                                border="1px solid"
                                borderColor={useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.1)")}
                                textAlign="left"
                                fontSize={{ base: "sm", md: "xs" }}
                                color={useColorModeValue("gray.700", "gray.200")}
                                fontWeight="medium"
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                position="relative"
                                overflow="hidden"
                                _before={{
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: "-100%",
                                  width: "100%",
                                  height: "100%",
                                  background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
                                  transition: "left 0.5s ease-in-out",
                                  pointerEvents: "none"
                                }}
                                _hover={{ 
                                  bg: useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(74, 85, 104, 0.9)"),
                                  borderColor: useColorModeValue("rgba(102, 126, 234, 0.4)", "rgba(102, 126, 234, 0.3)"),
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.15)",
                                  _before: {
                                    left: "100%"
                                  }
                                }}
                                _active={{
                                  transform: "translateY(0px)",
                                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)"
                                }}
                                boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                              >
                                <HStack gap={2}>
                                  <Box
                                    w="4px"
                                    h="4px"
                                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    borderRadius="full"
                                    flexShrink={0}
                                  />
                                  <Text>{question}</Text>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        </VStack>
                      </Box>
                    </VStack>
                  ) : (
                    <VStack align="stretch" gap={6} pb={{ base: 8, md: 20 }} px={{ base: 3, md: 2 }}>
                      {messages.map((message) => (
                        <Flex
                          key={message.id}
                          justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                          align="flex-start"
                        >
                          {message.role === 'assistant' && (
                            <Box
                              w={8}
                              h={8}
                              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mr={3}
                              mt={1}
                              boxShadow="lg"
                              border="2px solid"
                              borderColor={useColorModeValue("white", "gray.700")}
                              flexShrink={0}
                            >
                              <Icon as={FiCpu} color="white" boxSize={4} />
                            </Box>
                          )}
                          
                          <Box
                            maxW={{ base: "85%", md: "80%" }} // Slightly wider on mobile
                            bg={message.role === 'user' 
                              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              : useColorModeValue(
                                  "rgba(255, 255, 255, 0.9)",
                                  "rgba(74, 85, 104, 0.9)"
                                )
                            }
                            backdropFilter="blur(10px)"
                            color={message.role === 'user' ? 'white' : textColor}
                            p={{ base: 3, md: 4 }} // Smaller padding on mobile
                            borderRadius="2xl"
                            boxShadow={message.role === 'user' 
                              ? "0 8px 25px rgba(102, 126, 234, 0.3)"
                              : "0 8px 25px rgba(0, 0, 0, 0.1)"
                            }
                            border={message.role === 'user'
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "1px solid rgba(255, 255, 255, 0.1)"
                            }
                            position="relative"
                            mb={2}
                            _before={message.role === 'user' ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)",
                              borderRadius: "inherit",
                              pointerEvents: "none"
                            } : {}}
                          >
                            <Box 
                              fontSize="sm" 
                              lineHeight="1.6" 
                              mb={2}
                              position="relative"
                              zIndex={1}
                              fontWeight={message.role === 'user' ? "medium" : "normal"}
                            >
                              {message.role === 'assistant' ? (
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Paragraph với spacing tự nhiên
                                    p: ({ children }) => (
                                      <Text mb={3} lineHeight="1.7">
                                        {children}
                                      </Text>
                                    ),
                                    
                                    // Bold và italic text
                                    strong: ({ children }) => (
                                      <Text as="span" fontWeight="bold" color={message.role === 'user' ? 'white' : useColorModeValue('gray.800', 'white')}>
                                        {children}
                                      </Text>
                                    ),
                                    em: ({ children }) => (
                                      <Text as="span" fontStyle="italic">
                                        {children}
                                      </Text>
                                    ),
                                    
                                    // Headers với kích thước phù hợp
                                    h1: ({ children }) => (
                                      <Text as="h1" fontSize="lg" fontWeight="bold" mt={4} mb={3} color={message.role === 'user' ? 'white' : useColorModeValue('gray.800', 'white')}>
                                        {children}
                                      </Text>
                                    ),
                                    h2: ({ children }) => (
                                      <Text as="h2" fontSize="md" fontWeight="bold" mt={4} mb={2} color={message.role === 'user' ? 'white' : useColorModeValue('gray.800', 'white')}>
                                        {children}
                                      </Text>
                                    ),
                                    h3: ({ children }) => (
                                      <Text as="h3" fontSize="sm" fontWeight="bold" mt={3} mb={2} color={message.role === 'user' ? 'white' : useColorModeValue('gray.800', 'white')}>
                                        {children}
                                      </Text>
                                    ),
                                    
                                    // Lists với styling đẹp
                                    ul: ({ children }) => (
                                      <Box as="ul" ml={0} mb={3} css={{
                                        '& > li': {
                                          position: 'relative',
                                          paddingLeft: '1.5em',
                                          marginBottom: '0.5em',
                                          listStyle: 'none',
                                          '&:before': {
                                            content: '"•"',
                                            color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : useColorModeValue('#667eea', '#a78bfa'),
                                            fontWeight: 'bold',
                                            fontSize: '1.1em',
                                            position: 'absolute',
                                            left: '0',
                                            top: '0'
                                          }
                                        }
                                      }}>
                                        {children}
                                      </Box>
                                    ),
                                    
                                    ol: ({ children }) => (
                                      <Box as="ol" ml={0} mb={3} css={{
                                        counterReset: 'item',
                                        '& > li': {
                                          position: 'relative',
                                          paddingLeft: '2em',
                                          marginBottom: '0.5em',
                                          listStyle: 'none',
                                          counterIncrement: 'item',
                                          '&:before': {
                                            content: 'counter(item) "."',
                                            color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : useColorModeValue('#667eea', '#a78bfa'),
                                            fontWeight: 'bold',
                                            fontSize: '0.9em',
                                            position: 'absolute',
                                            left: '0',
                                            top: '0'
                                          }
                                        }
                                      }}>
                                        {children}
                                      </Box>
                                    ),
                                    
                                    li: ({ children }) => (
                                      <Box as="li" lineHeight="1.6">
                                        {children}
                                      </Box>
                                    ),
                                    
                                    // Code blocks với styling đẹp
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <Text 
                                            as="code" 
                                            bg={message.role === 'user' 
                                              ? 'rgba(255,255,255,0.2)' 
                                              : useColorModeValue('rgba(102,126,234,0.1)', 'rgba(167,139,250,0.2)')
                                            }
                                            color={message.role === 'user' 
                                              ? 'rgba(255,255,255,0.95)' 
                                              : useColorModeValue('purple.700', 'purple.200')
                                            }
                                            px={1.5}
                                            py={0.5}
                                            borderRadius="md"
                                            fontSize="0.9em"
                                            fontFamily="mono"
                                          >
                                            {children}
                                          </Text>
                                        );
                                      }
                                      return <Text as="code">{children}</Text>;
                                    },
                                    
                                    pre: ({ children }) => (
                                      <Box 
                                        as="pre" 
                                        bg={message.role === 'user' 
                                          ? 'rgba(255,255,255,0.1)' 
                                          : useColorModeValue('rgba(247,250,252,0.8)', 'rgba(45,55,72,0.6)')
                                        }
                                        color={message.role === 'user' 
                                          ? 'rgba(255,255,255,0.9)' 
                                          : 'inherit'
                                        }
                                        p={4}
                                        borderRadius="lg"
                                        overflow="auto"
                                        mb={3}
                                        fontSize="0.85em"
                                        fontFamily="mono"
                                        border="1px solid"
                                        borderColor={message.role === 'user' 
                                          ? 'rgba(255,255,255,0.2)' 
                                          : useColorModeValue('gray.200', 'gray.600')
                                        }
                                        css={{
                                          '&::-webkit-scrollbar': {
                                            height: '6px',
                                            width: '6px'
                                          },
                                          '&::-webkit-scrollbar-thumb': {
                                            background: message.role === 'user' 
                                              ? 'rgba(255,255,255,0.3)' 
                                              : useColorModeValue('gray.400', 'gray.500'),
                                            borderRadius: '3px'
                                          }
                                        }}
                                      >
                                        {children}
                                      </Box>
                                    ),
                                    
                                    // Blockquotes với styling đẹp
                                    blockquote: ({ children }) => (
                                      <Box
                                        as="blockquote"
                                        borderLeft="4px solid"
                                        borderColor={message.role === 'user' 
                                          ? 'rgba(255,255,255,0.4)' 
                                          : useColorModeValue('#667eea', '#a78bfa')
                                        }
                                        pl={4}
                                        py={2}
                                        mb={3}
                                        bg={message.role === 'user' 
                                          ? 'rgba(255,255,255,0.05)' 
                                          : useColorModeValue('rgba(102,126,234,0.05)', 'rgba(167,139,250,0.1)')
                                        }
                                        borderRadius="md"
                                        fontStyle="italic"
                                        position="relative"
                                      >
                                        {children}
                                      </Box>
                                    ),
                                    
                                    // Table support
                                    table: ({ children }) => (
                                      <Box overflowX="auto" mb={3}>
                                        <Box as="table" w="100%" fontSize="sm" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                                          {children}
                                        </Box>
                                      </Box>
                                    ),
                                    
                                    th: ({ children }) => (
                                      <Box as="th" p={2} bg={useColorModeValue('gray.50', 'gray.700')} borderBottom="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')} fontWeight="bold">
                                        {children}
                                      </Box>
                                    ),
                                    
                                    td: ({ children }) => (
                                      <Box as="td" p={2} borderBottom="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                                        {children}
                                      </Box>
                                    ),
                                  }}
                                >
                                  {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                                </ReactMarkdown>
                              ) : (
                                <Text whiteSpace="pre-wrap" lineHeight="1.6">
                                  {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                                </Text>
                              )}
                            </Box>
                            <Text
                              fontSize="xs"
                              mt={2}
                              color={message.role === 'user' 
                                ? 'rgba(255, 255, 255, 0.8)' 
                                : mutedTextColor
                              }
                              textAlign="right"
                              opacity={0.8}
                              position="relative"
                              zIndex={1}
                              fontWeight="medium"
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </Box>
                          
                          {message.role === 'user' && (
                            <Box
                              w={8}
                              h={8}
                              bg={useColorModeValue("gray.400", "gray.600")}
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              ml={3}
                              mt={1}
                              boxShadow="lg"
                              border="2px solid"
                              borderColor={useColorModeValue("white", "gray.700")}
                              flexShrink={0}
                            >
                              <Icon as={FiUser} color="white" boxSize={4} />
                            </Box>
                          )}
                        </Flex>
                      ))}
                      
                      {loading && (
                        <Flex justify="flex-start" align="flex-start">
                          <Box
                            w={8}
                            h={8}
                            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mr={3}
                            mt={1}
                            boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
                            border="2px solid"
                            borderColor={useColorModeValue("white", "gray.700")}
                            flexShrink={0}
                          >
                            <Icon as={FiCpu} color="white" boxSize={4} />
                          </Box>
                          
                          <Box
                            bg={useColorModeValue(
                              "rgba(255, 255, 255, 0.9)",
                              "rgba(74, 85, 104, 0.9)"
                            )}
                            backdropFilter="blur(10px)"
                            p={4}
                            borderRadius="2xl"
                            boxShadow="0 8px 25px rgba(0, 0, 0, 0.1)"
                            border="1px solid rgba(255, 255, 255, 0.1)"
                            mb={2}
                            position="relative"
                            overflow="hidden"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.1) 50%, transparent 100%)",
                              animation: "shimmer 2s infinite",
                              pointerEvents: "none"
                            }}
                            css={{
                              "@keyframes shimmer": {
                                "0%": { left: "-100%" },
                                "100%": { left: "100%" }
                              }
                            }}
                          >
                            <HStack position="relative" zIndex={1}>
                              <Spinner 
                                size="sm" 
                                color="purple.500"
                              />
                              <Text 
                                fontSize="sm" 
                                color={textColor}
                                fontWeight="medium"
                              >
                                AI Thinking...
                              </Text>
                            </HStack>
                          </Box>
                        </Flex>
                      )}
                    </VStack>
                  )}
                </Box>
                
                {/* Chat Input */}
                <Box
                  p={{ base: 3, md: 4 }} // Smaller padding on mobile
                  borderTop="2px solid"
                  borderColor={useColorModeValue("gray.300", "gray.600")}
                  bg={useColorModeValue("white", "gray.800")}
                  flexShrink={0} // Đảm bảo input không bị shrink
                  position="sticky"
                  bottom={0}
                  zIndex={20} // Đảm bảo input luôn ở trên cùng
                  boxShadow="0 -4px 20px rgba(0,0,0,0.1)"
                  mt={{ base: 0, md: 2 }} // Thêm margin top trên desktop
                >
                  <VStack gap={3}>
                    <HStack gap={{ base: 2, md: 3 }} w="100%">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about this meeting..."
                        size={{ base: "md", md: "sm" }} // Larger size on mobile
                        resize="none"
                        rows={2} // Keep consistent rows
                        disabled={loading}
                        borderRadius="lg"
                        bg={cardBg}
                        borderWidth="2px"
                        borderColor={useColorModeValue("gray.300", "gray.600")}
                        _focus={{ 
                          borderColor: "purple.400", 
                          boxShadow: "0 0 0 3px rgba(128, 90, 213, 0.15)",
                          bg: useColorModeValue("white", "gray.700")
                        }}
                        _hover={{
                          borderColor: useColorModeValue("gray.400", "gray.500")
                        }}
                        fontSize="sm"
                        minH={{ base: "40px", md: "60px" }} // Chiều cao tối thiểu
                        maxH={{ base: "80px", md: "120px" }} // Chiều cao tối đa
                        _placeholder={{
                          color: useColorModeValue("gray.500", "gray.400")
                        }}
                        _disabled={{
                          opacity: 0.6,
                          bg: useColorModeValue("gray.100", "gray.800")
                        }}
                      />
                      
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!input.trim() || loading}
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        aria-label="Send message"
                        borderRadius="full"
                        size={{ base: "lg", md: "md" }} // Larger on mobile for better touch
                        boxShadow="0 4px 16px rgba(102, 126, 234, 0.4)"
                        border="2px solid white"
                        _hover={{ 
                          transform: "scale(1.05)",
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                          bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
                        }}
                        _active={{
                          transform: "scale(0.95)"
                        }}
                        transition="all 0.2s"
                        _disabled={{
                          opacity: 0.4,
                          cursor: "not-allowed",
                          transform: "none",
                          bg: "gray.400",
                          border: "2px solid gray.300"
                        }}
                        flexShrink={0} // Đảm bảo button không bị shrink
                        w={{ base: "56px", md: "48px" }} // Larger on mobile
                        h={{ base: "56px", md: "48px" }} // Larger on mobile
                      >
                        <Icon as={FiSend} boxSize={4} />
                      </IconButton>
                    </HStack>
                    
                    <Text fontSize="xs" color={mutedTextColor} textAlign="center" display={{ base: "none", md: "block" }}>
                      Press Shift + Enter for new line, Enter to send
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </Box>
        </Portal>
      )}
    </>
  );
}