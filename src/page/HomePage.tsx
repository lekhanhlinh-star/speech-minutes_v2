import { Box, Button, Text, Stack, Flex, Badge } from '@chakra-ui/react';
import { 
  FaMicrophone, 
  FaUpload, 
  FaFileAlt, 
  FaClipboardList,
  FaPlay,
  FaDownload,
  FaClock,
  FaLanguage,
  FaChevronRight,
  FaRocket
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaMicrophone />,
      title: 'Audio Recording',
      description: 'Record high-quality audio directly in your browser with real-time controls',
      highlights: ['Real-time recording', 'Pause/Resume', 'Duration tracking', 'Audio preview'],
      color: 'red',
      action: () => navigate('/record')
    },
    {
      icon: <FaUpload />,
      title: 'File Upload',
      description: 'Upload existing audio files for processing and analysis',
      highlights: ['Multiple formats', 'Drag & drop', 'Batch upload', 'Progress tracking'],
      color: 'blue',
      action: () => navigate('/uploads')
    },
    {
      icon: <FaFileAlt />,
      title: 'Smart Transcription',
      description: 'Automatically convert speech to text with high accuracy',
      highlights: ['Multi-language support', 'Speaker detection', 'Timestamp sync', 'Editable text'],
      color: 'green',
      action: () => navigate('/meeting-status')
    },
    {
      icon: <FaClipboardList />,
      title: 'AI Summary',
      description: 'Generate intelligent summaries and key points from your meetings',
      highlights: ['Key topics', 'Action items', 'Meeting insights', 'Exportable format'],
      color: 'purple',
      action: () => navigate('/meeting-status')
    }
  ];

  const stats = [
    { label: 'Languages Supported', value: '8+', icon: <FaLanguage /> },
    { label: 'Processing Speed', value: '< 2min', icon: <FaClock /> },
    { label: 'Audio Quality', value: 'HD', icon: <FaPlay /> },
    { label: 'Export Formats', value: '3+', icon: <FaDownload /> }
  ];

  return (
    <Layout fullWidth bg="gray.50">
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        color="white" 
        py={12} 
        w="100%"
        pl={{ base: 0, md: "220px" }} // Padding left for sidebar
      >
        <Box 
          maxW="1200px"
          mx="auto"
          px={{ base: 4, md: 6 }}
        >
          <Stack gap={8} align="center" textAlign="center">
            <Badge 
              bg="green.400" 
              color="white" 
              size={{ base: "md", md: "lg" }}
              px={{ base: 3, md: 4 }}
              py={{ base: 1, md: 2 }}
              borderRadius="full"
              fontWeight="bold"
              fontSize={{ base: "xs", md: "sm" }}
            >
              🚀 Speech Minute - AI Powered
            </Badge>
            
            <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" lineHeight="shorter">
              Transform Your Audio into
              <br />
              <Text as="span" color="yellow.300">Smart Meeting Minutes</Text>
            </Text>
            
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="600px" opacity={0.9}>
              Record, transcribe, and summarize your meetings with cutting-edge AI technology. 
              Turn every conversation into actionable insights.
            </Text>
            
            <Stack direction={{ base: 'column', sm: 'row' }} gap={4} justify="center" align="center">
              <Button
                size="lg"
                bg="yellow.400"
                color="gray.900"
                onClick={() => navigate('/record')}
                px={8}
                fontWeight="bold"
                _hover={{ bg: 'yellow.300' }}
                shadow="lg"
              >
                Start Recording <FaMicrophone style={{ marginLeft: '8px' }} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                borderWidth="2px"
                color="white"
                bg="transparent"
                onClick={() => navigate('/uploads')}
                px={8}
                fontWeight="semibold"
                _hover={{ bg: 'whiteAlpha.300', borderColor: 'yellow.300' }}
                shadow="lg"
              >
                Upload File <FaUpload style={{ marginLeft: '8px' }} />
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box py={12} bg="white" w="100%" pl={{ base: 0, md: "220px" }}>
        <Box 
          maxW="1200px" 
          mx="auto" 
          px={{ base: 4, md: 6 }}
        >
          <Stack direction={{ base: 'column', md: 'row' }} gap={8} justify="center">
            {stats.map((stat, index) => (
              <Box key={index} textAlign="center">
                <Flex justify="center" mb={2}>
                  <Box p={3} bg="blue.50" borderRadius="full" color="blue.500">
                    {stat.icon}
                  </Box>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stat.value}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Features Section */}
      <Box py={16} w="100%" pl={{ base: 0, md: "220px" }}>
        <Box 
          maxW="1200px" 
          mx="auto" 
          px={{ base: 4, md: 6 }}
        >
          <Stack gap={12}>
            <Box textAlign="center">
              <Badge 
                bg="blue.500" 
                color="white" 
                mb={4}
                px={{ base: 2, md: 3 }}
                py={1}
                borderRadius="full"
                fontWeight="semibold"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Features
              </Badge>
              <Text fontSize="3xl" fontWeight="bold" mb={4}>
                Everything You Need for Smart Meetings
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
                Our comprehensive suite of tools helps you capture, process, and analyze 
                your meetings with unprecedented efficiency.
              </Text>
            </Box>

            <Stack gap={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  p={6}
                  bg="white"
                  borderRadius="xl"
                  shadow="md"
                  border="1px solid"
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                >
                  <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="start">
                    <Box>
                      <Flex align="center" gap={4} mb={4}>
                        <Box
                          p={3}
                          bg={`${feature.color}.50`}
                          color={`${feature.color}.500`}
                          borderRadius="lg"
                          fontSize="xl"
                        >
                          {feature.icon}
                        </Box>
                        <Box>
                          <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            {feature.title}
                          </Text>
                          <Text color="gray.600" mt={1}>
                            {feature.description}
                          </Text>
                        </Box>
                      </Flex>

                      <Stack direction={{ base: 'column', sm: 'row' }} gap={2} mb={4}>
                        {feature.highlights.map((highlight, idx) => (
                          <Badge 
                            key={idx} 
                            bg={`${feature.color}.100`}
                            color={`${feature.color}.700`}
                            px={{ base: 2, md: 2 }}
                            py={1}
                            borderRadius="md"
                            fontSize={{ base: "2xs", md: "xs" }}
                            fontWeight="medium"
                          >
                            ✓ {highlight}
                          </Badge>
                        ))}
                      </Stack>
                    </Box>

                    <Box flexShrink={0}>
                      <Button
                        bg={`${feature.color}.500`}
                        color="white"
                        onClick={feature.action}
                        size="sm"
                        fontWeight="semibold"
                        _hover={{ bg: `${feature.color}.600`, transform: 'translateY(-1px)' }}
                        shadow="md"
                      >
                        Try Now <FaChevronRight style={{ marginLeft: '4px' }} />
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box py={16} bg="blue.50" w="100%" pl={{ base: 0, md: "220px" }}>
        <Box 
          maxW="1200px" 
          mx="auto" 
          px={{ base: 4, md: 6 }}
        >
          <Stack gap={12}>
            <Box textAlign="center">
              <Badge 
                bg="blue.500" 
                color="white" 
                mb={4}
                px={{ base: 2, md: 3 }}
                py={1}
                borderRadius="full"
                fontWeight="semibold"
                fontSize={{ base: "xs", md: "sm" }}
              >
                How It Works
              </Badge>
              <Text fontSize="3xl" fontWeight="bold" mb={4}>
                Simple 3-Step Process
              </Text>
              <Text fontSize="lg" color="gray.600">
                Get from audio to insights in minutes, not hours
              </Text>
            </Box>

            <Stack direction={{ base: 'column', md: 'row' }} gap={8}>
              {[
                {
                  step: '01',
                  title: 'Record or Upload',
                  description: 'Start recording directly or upload your existing audio files',
                  icon: <FaMicrophone />
                },
                {
                  step: '02',
                  title: 'AI Processing',
                  description: 'Our AI automatically transcribes and analyzes your content',
                  icon: <FaRocket />
                },
                {
                  step: '03',
                  title: 'Get Results',
                  description: 'Receive detailed transcripts, summaries, and key insights',
                  icon: <FaClipboardList />
                }
              ].map((step, index) => (
                <Box key={index} textAlign="center" flex="1">
                  <Box
                    w="80px"
                    h="80px"
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                    fontSize="2xl"
                  >
                    {step.icon}
                  </Box>
                  <Text fontSize="sm" color="blue.500" fontWeight="bold" mb={2}>
                    STEP {step.step}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" mb={3}>
                    {step.title}
                  </Text>
                  <Text color="gray.600">
                    {step.description}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box py={16} bg="gray.800" color="white" w="100%" pl={{ base: 0, md: "220px" }}>
        <Box 
          maxW="800px" 
          mx="auto" 
          px={{ base: 4, md: 6 }} 
          textAlign="center"
        >
          <Stack gap={6}>
            <Text fontSize="3xl" fontWeight="bold">
              Ready to Transform Your Meetings?
            </Text>
            <Text fontSize="lg" opacity={0.8}>
              Join thousands of professionals who are already using Speech Minute 
              to make their meetings more productive and actionable.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} gap={4} justify="center" align="center">
              <Button
                size="lg"
                bg="blue.500"
                color="white"
                onClick={() => navigate('/record')}
                fontWeight="bold"
                _hover={{ bg: 'blue.600', transform: 'translateY(-2px)' }}
                shadow="lg"
                px={8}
              >
                Start Your First Recording <FaMicrophone style={{ marginLeft: '8px' }} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="gray.300"
                borderWidth="2px"
                color="white"
                bg="transparent"
                onClick={() => navigate('/meeting-status')}
                fontWeight="semibold"
                _hover={{ bg: 'whiteAlpha.300', borderColor: 'blue.300' }}
                shadow="lg"
                px={8}
              >
                View Sample Results
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Footer */}
      <Box py={8} bg="gray.900" color="gray.400" w="100%" pl={{ base: 0, md: "220px" }}>
        <Box 
          maxW="1200px" 
          mx="auto" 
          px={{ base: 4, md: 6 }}
        >
          <Flex justify="center" align="center">
            <Text fontSize="sm">
              © 2025 Speech Minute. Powered by AI for smarter meetings.
            </Text>
          </Flex>
        </Box>
      </Box>
    </Layout>
  );
}