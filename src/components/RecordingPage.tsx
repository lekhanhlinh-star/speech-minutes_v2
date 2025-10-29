import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Input,
  Text,
  HStack,
  IconButton,
  Center,
  Spinner,
  useBreakpointValue,
  CloseButton,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { FiUpload, FiMic, FiTrash2, FiXCircle } from "react-icons/fi";
import { deleteAudioById, getAudioList, uploadAudioFile } from "../api";

import { useNavigate } from "react-router-dom";
// Audio upload state
import { useState as useReactState } from "react";
// import React from "react";
export default function RecordingPage() {
  // Delete audio by id
  async function handleDeleteAudio(audio_id: string) {
    try {
      const res = await deleteAudioById(audio_id);
      if (res.ok) {
        toaster.create({ title: "Deleted", type: "success", duration: 2000 });
        await fetchAudioList();
      } else {
        toaster.create({ title: "Delete failed", type: "error", duration: 3000 });
      }
    } catch {
      toaster.create({ title: "Network error", type: "error", duration: 3000 });
    }
  }
  const [audioList, setAudioList] = useState<any[]>([]);
  const [audioListLoading, setAudioListLoading] = useState(false);
  const [audioListError, setAudioListError] = useState<string | null>(null);

  // Expose fetchAudioList for use after upload
  const fetchAudioList = async () => {
    setAudioListLoading(true);
    setAudioListError(null);
    try {
      const res = await getAudioList();
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAudioListError(data.detail || "Failed to fetch audio list");
      } else {
        const data = await res.json();
        setAudioList(data);
      }
    } catch (err) {
      setAudioListError("Network error");
    } finally {
      setAudioListLoading(false);
    }
  };
  useEffect(() => {
    fetchAudioList();
  }, []);
  const [uploadingIdx, setUploadingIdx] = useReactState<number | null>(null);
  const [uploadResult, setUploadResult] = useReactState<{ audio_id: string; s3_url: string } | null>(null);
  const [uploadError, setUploadError] = useReactState<string | null>(null);

  async function uploadAudio(file: File, idx: number) {
    setUploadingIdx(idx);
    setUploadResult(null);
    setUploadError(null);
    try {
      const res = await uploadAudioFile(file);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.detail || "Upload failed");
      } else {
        const data = await res.json();
        console.log("Upload successful:", data);
        console.log("Toaster: .....")
        toaster.create({
          title: "Upload successful!",
          description: file.name,
          type: "success",
          duration: 3500,
          
          
        });
        setUploadResult(data);
        // Reload audio list from API after upload
        await fetchAudioList();
      }
    } catch (err) {
      setUploadError("Network error");
    } finally {
      setUploadingIdx(null);
    }
  }

  // Track which files have been uploaded
  // const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());


  const [showStopDialog, setShowStopDialog] = useState(false);
  const stopActionRef = useRef<(() => void) | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pendingUpload, setPendingUpload] = useState<File[] | null>(null);
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false)
  const [loadingAudio] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Glassmorphism/Neumorphism colors
  const bgColor = useColorModeValue(
    'linear-gradient(120deg, rgba(245,245,255,0.7) 0%, rgba(230,230,245,0.5) 100%)',
    '#191a1f'
  );
  const textColor = useColorModeValue('#23233a', '#eaeaea');
  const subTextColor = useColorModeValue('gray.600', 'gray.500');
  const buttonSize = useBreakpointValue({ base: "60px", md: "80px" })
  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" })
  // Only upload when user confirms
  useEffect(() => {
    if (!pendingUpload || pendingUpload.length === 0) return;
    pendingUpload.forEach((file, idx) => {
      uploadAudio(file, idx);
    });
    setPendingUpload(null);
    setFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpload]);
  function handleConfirmUpload() {
    setPendingUpload(files);
  }
  // ------------------- RECORDING -------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      let mimeType = ""
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus"
      else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm"
      else if (MediaRecorder.isTypeSupported("audio/wav")) mimeType = "audio/wav"
      else throw new Error("No supported audio type found")

      const recorder = new MediaRecorder(stream, { mimeType })
      setMediaRecorder(recorder)

      // Use a local array to collect chunks
      let localChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) localChunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(localChunks, { type: mimeType })
        if (audioBlob.size === 0) return // tránh blob rỗng


  let ext = ".webm";
  if (mimeType.includes("wav")) ext = ".wav";

  // Format current date/time as YYYYMMDD_HHmmss
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fileName = `recording_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${ext}`;

  const file = new File([audioBlob], fileName, { type: mimeType });
  setFiles(prev => [...prev, file]);

        // Revoke old URL
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        // Do NOT auto-play: just set audioUrl for waveform, but don't start playing
        const newUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(newUrl)
          // (playback state removed)
          // Stop timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setRecordTime(0);
      }

      recorder.start()
      setRecording(true)
        setRecordTime(0);
        // Start timer
        timerRef.current = setInterval(() => {
          setRecordTime(prev => prev + 1);
        }, 1000);
    } catch (err) {
      console.error("Recording failed:", err)
    }
  }

  const stopRecording = () => {
    setShowStopDialog(true);
    stopActionRef.current = () => {
      mediaRecorder?.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setShowStopDialog(false);
    };
  // Clean up timer if component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  }

  // (WaveSurfer UI removed)

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))
  // (formatTime removed)

  // ------------------- RENDER -------------------
  return (
    <>
      <Dialog.Root
        open={showStopDialog}
        onOpenChange={(details) => setShowStopDialog(details.open)}
        size="md"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius={20} p={2}>
              <Dialog.Header>
                <Dialog.Title>Stop Recording?</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                Are you sure you want to stop recording?
              </Dialog.Body>
              <Box display="flex" justifyContent="flex-end" gap={2} p={3}>
                <Button variant="ghost"   onClick={() => setShowStopDialog(false)}>
                  Cancel
                </Button>
                <Button colorPalette="white" bg={"red"}   onClick={() => { stopActionRef.current && stopActionRef.current(); }}>
                  Stop
                </Button>
              </Box>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Box
        w={{ base: "100vw", md: "100vw" }}
        maxW={{ base: "100vw", md: "900px" }}
        minH="calc(100vh - 80px)"
        bg={bgColor}
        display="flex"
        flexDir="column"
        alignItems="center"
        pt={{ base: "120px", md: "140px" }}
        pb={16}
        px={{ base: 4, md: 10 }}
        style={{
          background: bgColor,
          minHeight: 'calc(100vh - 80px)',
          margin: '0 auto',
          borderRadius: 36,
          boxShadow: '0 8px 48px 0 rgba(124,110,230,0.10), 0 2px 8px 0 rgba(180,180,200,0.10)',
        }}
      >
      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor} mb={8} textAlign="center" style={{textShadow:'0 2px 12px #fff8'}}>
        Voice Memos
      </Text>
      {/* RECORD BUTTON */}
      <Center mb={8}>
        <VStack>
          <Button
            onClick={recording ? stopRecording : startRecording}
            bg={recording ? "rgba(255,59,48,0.92)" : "rgba(124,110,230,0.92)"}
            color="white"
            borderRadius="full"
            boxSize={buttonSize}
            minW={buttonSize}
            minH={buttonSize}
            fontSize={fontSize}
            boxShadow={recording ? "0 0 0 12px #ff3b3044, 0 2px 16px #7c6ee633" : "0 2px 16px #7c6ee633"}
            style={{backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)'}}
            _hover={{ bg: recording ? "rgba(255,97,92,0.92)" : "rgba(124,110,230,0.98)" }}
            _active={{ bg: recording ? "rgba(255,59,48,0.92)" : "rgba(124,110,230,0.92)" }}
            disabled={loadingAudio}
          >
            {recording ? <Spinner color="white" /> : <FiMic />}
          </Button>
          {recording && (
            <Text color={textColor} fontSize="md" mt={2}>
              {String(Math.floor(recordTime / 60)).padStart(2, '0')}:{String(recordTime % 60).padStart(2, '0')}
            </Text>
          )}
        </VStack>
      </Center>

      {/* UPLOAD BUTTON */}
      <Button
        onClick={() => inputRef.current?.click()}
        mb={8}
        px={8}
        py={6}
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight={700}
        borderRadius={32}
        color={textColor}
        bgGradient="linear(to-r, #7c6ee6 0%, #a8a6ff 100%)"
        boxShadow="0 4px 24px 0 rgba(124,110,230,0.13), 0 2px 8px 0 rgba(180,180,200,0.13)"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          letterSpacing: 0.5,
          transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
        }}
        _hover={{
          bgGradient: 'linear(to-r, #a8a6ff 0%, #7c6ee6 100%)',
          transform: 'scale(1.045)',
          boxShadow: '0 8px 32px 0 rgba(124,110,230,0.18), 0 2px 8px 0 rgba(180,180,200,0.18)',
        }}
        _active={{
          bgGradient: 'linear(to-r, #7c6ee6 0%, #a8a6ff 100%)',
          transform: 'scale(0.98)',
        }}
        disabled={loadingAudio}
      >
        <HStack justifyContent="center" alignItems="center" gap={3}>
          <FiUpload size={28} style={{ marginBottom: -2 }} />
          <span style={{ fontWeight: 700, fontSize: '1.15em', letterSpacing: 0.5 }}>Upload Recording File</span>
        </HStack>
      </Button>

      <Input
        type="file"
        accept="audio/*"
        multiple
        ref={inputRef}
        display="none"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(files)]);
          }
        }}
      />

      {/* Confirm upload button and selected files */}
      {files.length > 0 && (
        <Box mt={2} mb={2} w={{ base: "100%", sm: "90%", md: "500px" }}>
          <Text mb={1} color={textColor} fontSize="md">Đã chọn: {files.map(f => f.name).join(", ")}</Text>
          <IconButton
            onClick={handleConfirmUpload}
            loading={uploadingIdx !== null}
          
            px={8}
            py={5}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight={700}
            borderRadius={20}
            color="#000000ff"
            bgGradient="linear(to-r, #4f8cff 0%, #7c6ee6 100%)"
            boxShadow="0 2px 12px 0 rgba(124,110,230,0.13)"
            _hover={{
              bgGradient: 'linear(to-r, #7c6ee6 0%, #4f8cff 100%)',
              transform: 'scale(1.035)',
              boxShadow: '0 4px 24px 0 rgba(124,110,230,0.18)',
            }}
            _active={{
              bgGradient: 'linear(to-r, #4f8cff 0%, #7c6ee6 100%)',
              transform: 'scale(0.98)',
            }}
          >
            <FiUpload size={22} />Upload
          </IconButton>
        </Box>
      )}

      {/* WAVEFORM UI removed */}

      {/* FILE LIST */}
      <Box w={{ base: "100%", sm: "90%", md: "700px" }}
        bg="rgba(255,255,255,0.32)"
        borderRadius={24}
        boxShadow="0 8px 32px 0 rgba(31,38,135,0.10), 0 1.5px 8px 0 rgba(180,180,200,0.10)"
        p={5}
        mt={2}
        border="1.5px solid rgba(255,255,255,0.25)"
        style={{backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', position:'relative', overflow:'hidden'}}
      >
        <Text fontWeight="semibold" mb={2} color={textColor} fontSize="lg">
          Recordings
        </Text>
        <VStack gap={2} align="stretch">
          {/* Backend audio list */}
          {audioListLoading && <Text color={subTextColor}>Loading audio list...</Text>}
          {audioListError && <Text color="red.500">{audioListError}</Text>}
          {audioList.length > 0 && audioList.map((audio) => (
            <HStack
              key={audio.audio_id}
              gap={4}
              bg="#f7f6ff"
              borderRadius={24}
              px={6} py={4}
              boxShadow="0 4px 24px 0 rgba(124,110,230,0.10), 0 2px 8px 0 rgba(180,180,200,0.10)"
              _hover={{
                bg: 'rgba(124,110,230,0.13)',
                boxShadow: '0 8px 32px 0 rgba(124,110,230,0.18), 0 2px 8px 0 rgba(180,180,200,0.13)',
                transform: 'scale(1.025)',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
              }}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                minHeight: 64,
              }}
            >
              <Box flex={2} onClick={() => navigate(`/audio-detail/${audio.audio_id}`)} style={{cursor:'pointer'}}>
                <Text
                  color={textColor}
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight={600}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {audio.filename}
                </Text>
              </Box>
              <Text
                flex={1}
                color={subTextColor}
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight={500}
                textAlign="right"
              >
                {new Date(audio.upload_time).toLocaleString()}
              </Text>
              <IconButton
                aria-label="Delete audio"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDeleteAudio(audio.audio_id)}
              >
                <FiXCircle />
              </IconButton>
            </HStack>
          ))}
          {/* Local files (not yet uploaded or just recorded) */}
          {files.length === 0 && audioList.length === 0 && <Text color={subTextColor} textAlign="center">No files</Text>}
          {files.map((file, idx) => (
            <HStack key={file.name + idx} gap={2}
              bg="rgba(245,245,255,0.45)"
              borderRadius={14}
              px={3} py={2}
              boxShadow="0 2px 8px 0 rgba(180,180,200,0.10)"
              _hover={{ bg: 'rgba(124,110,230,0.10)', cursor: 'pointer' }}
              onClick={() => navigate('/audio-detail', { state: { audioFile: file } })}
              style={{backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)'}}
            >
              <Text flex={1} color={textColor} fontSize="md" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{file.name}</Text>
              <IconButton aria-label="Remove" size="sm" colorScheme="red" variant="ghost" onClick={e => { e.stopPropagation(); removeFile(idx); }}><FiTrash2 /></IconButton>
              {uploadingIdx === idx && <Spinner size="sm" color="#7c6ee6" />}
            </HStack>
          ))}
          
        </VStack>
      </Box>

    </Box>
      
    </>
  );
}
