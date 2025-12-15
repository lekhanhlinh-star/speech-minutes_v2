"use client"

import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Textarea,
  Spinner,
  Icon,
  Flex,
  Portal,
} from "@chakra-ui/react"
import { FiMessageCircle, FiSend, FiUser, FiCpu, FiX, FiMinimize2 } from "react-icons/fi"
import { useState, useRef, useEffect } from "react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { chatWithSummary } from "@/api"

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingChatBubbleProps {
  meetingId: string;
}

export function FloatingChatBubble({ meetingId }: FloatingChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number, startY: number, startPosX: number, startPosY: number }>({ 
    startX: 0, 
    startY: 0, 
    startPosX: 0, 
    startPosY: 0 
  });

  // Colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 400, dragRef.current.startPosX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 500, dragRef.current.startPosY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading || !meetingId) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatLoading(true);
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    
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
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your question.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Portal>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={1000}
          cursor="pointer"
          onClick={() => setIsOpen(true)}
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.1)" }}
        >
          <Box
            w="60px"
            h="60px"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 20px rgba(128, 90, 213, 0.4)"
            border="3px solid white"
            position="relative"
          >
            <Icon as={FiMessageCircle} color="white" boxSize={6} />
            
            {/* Notification badge */}
            {chatMessages.length === 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="-2px"
                w="20px"
                h="20px"
                bg="red.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="xs"
                fontWeight="bold"
                animation="pulse 2s infinite"
              >
                AI
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <Box
          position="fixed"
          top={`${position.y}px`}
          left={`${position.x}px`}
          zIndex={1000}
          w="400px"
          h={isMinimized ? "60px" : "500px"}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="0 10px 40px rgba(0,0,0,0.15)"
          overflow="hidden"
          transition="height 0.3s ease"
          userSelect={isDragging ? "none" : "auto"}
        >
          {/* Header */}
          <Box
            p={4}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            cursor={isDragging ? "grabbing" : "grab"}
            onMouseDown={handleMouseDown}
            borderTopRadius="xl"
          >
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiCpu} boxSize={5} />
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold" fontSize="sm">AI Assistant</Text>
                  {!isMinimized && (
                    <Text fontSize="xs" opacity={0.8}>Ask about this meeting</Text>
                  )}
                </VStack>
              </HStack>
              
              <HStack gap={1}>
                <IconButton
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                  size="xs"
                  variant="ghost"
                  color="white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                >
                  <Icon as={FiMinimize2} boxSize={3} />
                </IconButton>
                <IconButton
                  aria-label="Close chat"
                  size="xs"
                  variant="ghost"
                  color="white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                >
                  <Icon as={FiX} boxSize={3} />
                </IconButton>
              </HStack>
            </HStack>
          </Box>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <Box
                flex={1}
                overflowY="auto"
                p={4}
                h="360px"
                ref={chatScrollRef}
                css={{
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
                }}
              >
                {chatMessages.length === 0 ? (
                  <VStack gap={4} align="center" justify="center" h="100%" textAlign="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      borderRadius="full"
                    >
                      <Icon as={FiMessageCircle} color="white" boxSize={6} />
                    </Box>
                    <VStack gap={1}>
                      <Text fontWeight="medium">Start a conversation</Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        Ask me anything about this meeting
                      </Text>
                    </VStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={3}>
                    {chatMessages.map((message) => (
                      <Flex
                        key={message.id}
                        justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                        align="flex-start"
                      >
                        {message.role === 'assistant' && (
                          <Box
                            w={6}
                            h={6}
                            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mr={2}
                            mt={1}
                            flexShrink={0}
                          >
                            <Icon as={FiCpu} color="white" boxSize={3} />
                          </Box>
                        )}
                        
                        <Box
                          maxW="70%"
                          bg={message.role === 'user' 
                            ? useColorModeValue("purple.500", "purple.600")
                            : useColorModeValue("gray.100", "gray.700")
                          }
                          color={message.role === 'user' ? 'white' : textColor}
                          p={3}
                          borderRadius="lg"
                          fontSize="sm"
                          lineHeight="tall"
                        >
                          <Text whiteSpace="pre-wrap">
                            {message.content}
                          </Text>
                          <Text
                            fontSize="xs"
                            mt={1}
                            opacity={0.7}
                            textAlign="right"
                          >
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </Box>
                        
                        {message.role === 'user' && (
                          <Box
                            w={6}
                            h={6}
                            bg={useColorModeValue("gray.400", "gray.600")}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            ml={2}
                            mt={1}
                            flexShrink={0}
                          >
                            <Icon as={FiUser} color="white" boxSize={3} />
                          </Box>
                        )}
                      </Flex>
                    ))}
                    
                    {chatLoading && (
                      <Flex justify="flex-start" align="flex-start">
                        <Box
                          w={6}
                          h={6}
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mr={2}
                          mt={1}
                        >
                          <Icon as={FiCpu} color="white" boxSize={3} />
                        </Box>
                        
                        <Box
                          bg={useColorModeValue("gray.100", "gray.700")}
                          p={3}
                          borderRadius="lg"
                        >
                          <HStack>
                            <Spinner size="xs" color="purple.500" />
                            <Text fontSize="sm" color={textColor}>Thinking...</Text>
                          </HStack>
                        </Box>
                      </Flex>
                    )}
                  </VStack>
                )}
              </Box>

              {/* Input */}
              <Box p={4} borderTop="1px solid" borderColor={borderColor}>
                <HStack gap={2}>
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about this meeting..."
                    size="sm"
                    resize="none"
                    rows={2}
                    disabled={chatLoading}
                    borderRadius="lg"
                    _focus={{ 
                      borderColor: "purple.400", 
                      boxShadow: "0 0 0 1px rgba(128, 90, 213, 0.4)"
                    }}
                  />
                  
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    colorScheme="purple"
                    aria-label="Send message"
                    borderRadius="full"
                    size="sm"
                    flexShrink={0}
                  >
                    <Icon as={FiSend} boxSize={3} />
                  </IconButton>
                </HStack>
              </Box>
            </>
          )}
        </Box>
      )}
    </Portal>
  );
}