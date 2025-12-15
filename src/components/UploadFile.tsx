import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Spinner,
  VStack,
  HStack,
  Icon,
  
} from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import { uploadAudioFile } from "../api";
import { toaster } from "./ui/toaster";

export default function UploadFile({
  onUpload,
}: {
  onUpload?: (file: File, response: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("zh");
  const [filename, setFilename] = useState<string>("");
  const [diarization, setDiarization] = useState(false);
  const [hotwords, setHotwords] = useState<string[]>([]);
  const [hotwordInput, setHotwordInput] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const toast = toaster.create;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      // You may want to pass language/filename/diarization to uploadAudioFile if backend supports
  const fileToUpload = new File([selectedFile], filename, { type: selectedFile.type });
  const response = await uploadAudioFile(fileToUpload, language, diarization, hotwords.length ? hotwords : null);
      toast({
        title: "Upload successful!",
        type: "success",
        description: `${filename} uploaded successfully.`,
      });
      if (onUpload) onUpload(fileToUpload, response);
      setSelectedFile(null);
      setFilename("");
  setDiarization(false);
  setHotwords([]);
  setHotwordInput("");
    } catch (err: any) {
      toast({
        title: "Upload failed",
        type: "error",
        description: err?.message || "Something went wrong.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Main upload box for file selection only */}
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="0 6px 20px rgba(0,0,0,0.05)"
        border="1px solid #eee"
        maxW="420px"
        mx="auto"
        mt={6}
        textAlign="center"
        transition="all 0.3s"
        _hover={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      >
        <VStack gap={5}>
          <Icon as={FiUploadCloud} w={12} h={12} color="blue.500" />
          <Box>
            <Text fontSize="xl" fontWeight="700" color="#111">
              Upload Your Audio File
            </Text>
            <Text fontSize="sm" color="gray.500">
              Supports .mp3, .wav, .m4a and more
            </Text>
          </Box>
          <Box
            w="100%"
            p={4}
            border="2px dashed #cbd5e0"
            borderRadius="lg"
            cursor="pointer"
            bg="#fafbfc"
            _hover={{ borderColor: "blue.400", bg: "blue.50" }}
            onClick={() => inputRef.current?.click()}
            style={{ opacity: selectedFile ? 0.5 : 1, pointerEvents: selectedFile ? 'none' : 'auto' }}
          >
            <Text color="gray.600" fontWeight={500}>
              Click or drag file to upload
            </Text>
            <Input
              type="file"
              accept="audio/*"
              ref={inputRef}
              onChange={handleFileChange}
              display="none"
            />
          </Box>
        </VStack>
      </Box>

      {/* Floating form at bottom right when file is selected */}
      {selectedFile && (
        <Box
          position="fixed"
          right={{ base: 2, md: 8 }}
          bottom={{ base: 2, md: 8 }}
          zIndex={2000}
          w={{ base: "95vw", sm: "400px", md: "420px" }}
          maxW="95vw"
          bg="white"
          p={5}
          borderRadius="2xl"
          boxShadow="0 8px 32px 0 rgba(124,110,230,0.18)"
          border="1px solid #e2e8f0"
        >
          <HStack justify="space-between" align="center" mb={2}>
            <HStack>
              <Box bg="blue.500" color="white" borderRadius="md" px={3} py={1} fontSize="xs" fontWeight="bold">
                {selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
              </Box>
              <Input
                size="sm"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                fontWeight="bold"
                width="auto"
                minW="120px"
                maxW="180px"
                borderRadius="md"
                borderColor="gray.300"
                bg="white"
                px={2}
                py={1}
              />
            </HStack>
            <Button size="xs" colorScheme="red" variant="ghost" onClick={() => { setSelectedFile(null); setFilename(""); setDiarization(false); }}>X</Button>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={2}>{new Date().toLocaleString()}</Text>
          <Box textAlign="left" mb={2}>
            <Text fontSize="sm" fontWeight={500}>Language</Text>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e0', marginTop: 4 }}
            >
              <option value="zh">Chinese</option>
              <option value="en">English</option>
              {/* <option value="vi">Vietnamese</option> */}
              {/* <option value="ja">Japanese</option> */}
              {/* <option value="ko">Korean</option> */}
              {/* Add more languages as needed */}
            </select>
          </Box>
          <Box textAlign="left" mb={3}>
            <Text fontSize="sm" fontWeight={500} mb={2}>Hotwords (optional)</Text>
            <HStack gap={2} mb={2}>
              <Input
                size="sm"
                placeholder="Add a hotword and press Enter or Add"
                value={hotwordInput}
                onChange={e => setHotwordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const hw = hotwordInput.trim();
                    if (hw && !hotwords.includes(hw)) {
                      setHotwords(prev => [...prev, hw]);
                    }
                    setHotwordInput('');
                  }
                }}
              />
            
              <Button size="sm" bg={"blue"}   onClick={() => {
                const hw = hotwordInput.trim();
                if (hw && !hotwords.includes(hw)) {
                  setHotwords(prev => [...prev, hw]);
                }
                setHotwordInput('');
              }}>Add</Button>
            </HStack>
            <HStack wrap="wrap" gap={2}>
              {hotwords.map((hw, idx) => (
                <Box key={idx} display="inline-flex" alignItems="center" bg="gray.100" px={3} py={1} borderRadius="full">
                  <Text fontSize="xs" mr={2}>{hw}</Text>
                  <Button size="xs" variant="ghost" bg="gray.100" onClick={() => setHotwords(prev => prev.filter((_, i) => i !== idx))}>×</Button>
                </Box>
              ))}
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2}>Optional words to boost recognition priority (one by one).</Text>
          </Box>
          <Button
            // colorScheme="blue"
            onClick={handleUpload}
            disabled={uploading}
            bg={"blue"}
            w="100%"
            py={5}
            fontWeight="600"
            mt={2}
          >
            {uploading ? <Spinner size="sm" /> : "Upload"}
          </Button>
        </Box>
      )}
    </>
  );
}
