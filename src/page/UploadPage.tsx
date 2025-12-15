"use client"

import { Box, VStack, HStack, Text, Button, Icon, IconButton } from "@chakra-ui/react"
import { FiDelete, FiDownload } from "react-icons/fi"
import { useState } from "react"
import { getAudioList, deleteAudioById } from "@/api"
import { Header } from "@/components/Header" // Giả sử Header đã được export
import { useColorModeValue } from "@/components/ui/color-mode"



import { useEffect } from "react"
import UploadFile from "@/components/UploadFile"
export default function UploadPage() {
  const [files, setFiles] = useState<any[]>([])
  // Removed dragActive, setDragActive, inputRef (no longer needed)
  // Fetch audio list from API on mount and after upload/delete
  const [filesLoading, setFilesLoading] = useState(false)
  const [filesError, setFilesError] = useState<string | null>(null)
  const fetchAudioList = async () => {
    setFilesLoading(true)
    setFilesError(null)
    try {
      const res = await getAudioList()
        console.log("Audio list data:", res);

      if (res.ok) {
        console.log("Ok");
        const data = await res.json()
        setFiles(data)
      } else {
        // setFilesError("Failed to fetch audio list")
        setFiles([])
      }
    } catch (err) {
      setFilesError("Network error")
    } finally {
      setFilesLoading(false)
    }
  }
  useEffect(() => { fetchAudioList() }, [])


  // Xóa file
  async function handleDeleteAudio(audio_id: string) {
    try {
      const res = await deleteAudioById(audio_id)
      if (res.ok) {
        await fetchAudioList()
      } else {
        // TODO: show error notification
        alert("Delete failed")
      }
    } catch {
      alert("Network error")
    }
  }

  const bgColor = useColorModeValue("white", "gray.800")
  // Removed borderColor (no longer needed)
  const textColor = useColorModeValue("gray.600", "gray.300")

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
        {/* Tiêu đề trang */}
        

        {/* Upload area (fixed) */}
        <Box
          width={{ base: "100%", sm: "95%", md: "700px", lg: "900px" }}
          maxWidth="100vw"
          mb={8}
        >
          <UploadFile onUpload={fetchAudioList} />
        </Box>

  {/* Uploaded files list */}
  <Box
    w={{ base: "100%", sm: "95%", md: "700px", lg: "900px" }}
    maxWidth="100vw"
    bg={useColorModeValue("white", "gray.800")}
    borderRadius={16}
    boxShadow="0 2px 12px 0 rgba(124,110,230,0.10)"
    p={{ base: 3, sm: 4, md: 5 }}
    mt={2}
  >
    <Text fontWeight="semibold" mb={2} color={textColor} fontSize="lg">
      Uploaded files
    </Text>
    <VStack gap={2} align="stretch">
      {filesLoading && <Text color="gray.500">Loading file list...</Text>}
      {filesError && <Text color="red.500">{filesError}</Text>}
      {!filesLoading && !filesError && files.length === 0 && <Text color="gray.500" textAlign="center">No files found</Text>}
      {files.map((file) => {
        const ext = file.filename?.split(".").pop()?.toUpperCase() || "FILE"
        let uploadedAt = ""
        if (file.upload_time) {
          const d = new Date(file.upload_time)
          uploadedAt = d.toLocaleString()
        }
        return (
          <HStack
            key={file.audio_id || file.id}
            gap={4}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderRadius={12}
            px={4} py={3}
            boxShadow="0 2px 8px 0 rgba(180,180,200,0.10)"
            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
            style={{ minHeight: 56 }}
          >
            <Box minW="48px" bg="blue.500" color="white" borderRadius="md" px={3} py={1} fontSize="xs" fontWeight="bold" textAlign="center">
              {ext}
            </Box>
            <Box flex="1 1 0%" minW={0} maxW="100%" overflow="hidden">
              <Text
                fontWeight="bold"
                fontSize="md"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  WebkitLineClamp: window.innerWidth < 768 ? 2 : 1,
                  whiteSpace: 'normal',
                }}
              >
                {file.filename}
              </Text>
              <Text color={textColor} fontSize="xs" mt={1} style={{ opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {uploadedAt}
              </Text>
            </Box>
            <HStack gap={1} flexShrink={0}>
              <a href={file.s3_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  px={{ base: 2, md: 4 }}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  <Icon as={FiDownload} boxSize={4} mr={2} />Download
                </Button>
                <IconButton
                  aria-label="Download"
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  display={{ base: 'inline-flex', md: 'none' }}
                >
                  <FiDownload />
                </IconButton>
              </a>
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                px={{ base: 2, md: 4 }}
                onClick={() => handleDeleteAudio(file.audio_id)}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                <Icon as={FiDelete} boxSize={4} mr={2} />Delete
              </Button>
              <IconButton
                aria-label="Delete"
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDeleteAudio(file.audio_id)}
                display={{ base: 'inline-flex', md: 'none' }}
              >
                <FiDelete />
              </IconButton>
            </HStack>
          </HStack>
        )
      })}
    </VStack>
  </Box>

      </Box>
    </Box>
  )
}