// Format seconds to 00:00:00,000
export function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec - Math.floor(sec)) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}


import { FiPlay, FiPause } from "react-icons/fi";
import React from "react";
import { Box, IconButton, Text, Spinner, SimpleGrid, Spacer } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import TranscriptSection from "./TranscriptSection";
import SummarySection from "./SummarySection";
import { useLocation, useParams } from "react-router-dom";
import { CgTranscript } from "react-icons/cg";
import { MdSummarize } from "react-icons/md";
import { transcribeAudioById, getTranscriptByAudioId, getAudioList } from "../api";
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文 (Chinese)" },

];

export default function AudioDetailPage() {
  const { audio_id } = useParams<{ audio_id: string }>();
  const location = useLocation();
  // Accept both frontend and backend navigation
  // const file = location.state?.audioFile;
  // const audio_id = location.state?.audio_id; // <-- REMOVE this line
  const s3_url = location.state?.s3_url;
  const filename = location.state?.filename;
  // const upload_time = location.state?.upload_time; // removed unused
  // If audio_id is present, treat as backend audio
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (s3_url) {
      setAudioUrl(s3_url);
    } else if (audio_id) {
      // Fetch audio info from backend if s3_url is missing
      getAudioList().then(res => res.json()).then(list => {
        const found = list.find((item: any) => item.audio_id === audio_id);
        if (found && found.s3_url) setAudioUrl(found.s3_url);
        else setAudioUrl(null);
      }).catch(() => setAudioUrl(null));
    } else {
      setAudioUrl(null);
    }
  }, [s3_url, audio_id]);

  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");

  // Audio state using <audio> ref
  const audioRef = React.useRef<HTMLAudioElement>(null) as React.RefObject<HTMLAudioElement>;
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);

  // Only create object URL once per file
  // Summary state is now handled in SummarySection

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play();
    else audio.pause();
  }, [playing]);

  // Handler for transcript click
  const handleTranscriptClick = (start: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = start;
      setCurrent(start);
      setPlaying(true);
    }
  };

  // State for transcript data from API
  const [transcript, setTranscript] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // State to trigger summary reload
  const [summaryReloadKey, setSummaryReloadKey] = React.useState(0);
  // console.log("AudioDetailPage render, audio_id:", audio_id);
  React.useEffect(() => {
    if (audio_id) {
      setLoading(true);
      setError(null);
      getTranscriptByAudioId(audio_id)
        .then((data) => {
          setTranscript({ language: selectedLanguage, segments: data[0].segments });
        })
        .catch(() => {
          setTranscript(null);
        })
        .finally(() => setLoading(false));
    }
  }, [audio_id]);

  // Handler to fetch transcript for backend audio
  const handleGetTranscript = async () => {
    if (!audio_id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await transcribeAudioById(audio_id, selectedLanguage);
      setTranscript({ language: selectedLanguage, segments: data.segments });
      setSummaryReloadKey(k => k + 1); // trigger summary reload
    } catch {
      // setError("Lỗi khi gọi API transcript (audio_id)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" pb="110px" h={"100%"}
      bg="#fff"
      color="#111"
      style={{
        background: '#fff',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#111',
      }}
    >
      <Box
        maxW="700px"
        mx="auto"
        mt={{ base: 8, md: 16 }}
        borderRadius={36}
        boxShadow="0 4px 32px 0 rgba(180,180,200,0.10)"
        bg="#fff"
        px={{ base: 0, md: 0 }}
        py={0}
        border="1.5px solid rgba(220,220,230,0.5)"
        position="relative"
        style={{
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          overflow: 'hidden',
        }}
      >
        {/* Language selection dropdown */}
        <Box px={7} pt={7} pb={2} textAlign="right">
          <label htmlFor="language-select" style={{fontWeight:600, marginRight:8, color:'#111', fontSize:17}}>Language:</label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            style={{
              padding: '7px 18px',
              borderRadius: 10,
              border: '1.5px solid #ddd',
              fontSize: '17px',
              color: '#111',
              background: '#fff',
              fontWeight: 600,
              outline: 'none',
              boxShadow: '0 1px 8px #e9e9e9',
              marginLeft: 4,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Box>
        <SimpleGrid columns={1} gap={0} width="full">
          <Tabs.Root gap={0} defaultValue="transcript" variant={"subtle"} orientation="horizontal">
            <Tabs.List style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#fff',
              borderRadius: 18,
              margin: '0 18px',
              boxShadow: '0 2px 12px #e9e9e9',
              border: '1.5px solid #eee',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0.1,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 54,
            }}>
              <Tabs.Trigger value="transcript" 
                
              >
                <CgTranscript style={{marginRight: 2, opacity: 0.8, fontSize: 22}} />
                Transcript
              </Tabs.Trigger>
              <Tabs.Trigger value="summary" 
              >
                <MdSummarize style={{marginRight: 2, opacity: 0.8, fontSize: 22}} />
                Summary
              </Tabs.Trigger>
              <Spacer />
              <Tabs.Indicator style={{
                height: 6,
                background: '#111',
                borderRadius: 6,
                marginTop: 8,
                transition: 'all 0.28s cubic-bezier(.4,1.2,.6,1)',
                boxShadow: '0 2px 8px #2222',
                filter: 'blur(0.5px)',
                position: 'absolute',
                left: 0,
                right: 0,
              }} />
            </Tabs.List>
            <Box w="100%" mx="auto" mt={0} px={0}>
              {/* Unified width/minW/maxW/minH for both tabs */}
              <Tabs.Content value="transcript">
                <Box
                  w={{ base: '100%', md: '100%', lg: '100%' }}
                  maxW={{ base: '100%', md: '700px', lg: '800px' }}
                  minH={{ base: '320px', md: '400px', lg: '480px' }}
                  mx="auto"
                  px={{ base: 1, sm: 2, md: 6, lg: 8 }}
                  pt={{ base: 4, md: 6 }}
                  pb={{ base: 2, md: 4 }}
                  transition="all 0.2s"
                >
                  {audio_id && !transcript && !loading && (
                    <Box py={7} textAlign="center">
                      <button
                        style={{
                          background: 'linear-gradient(90deg, #ffffffff 0%, #ffffffff 100%)',
                          color: '#0e0d0dff',
                          border: 'none',
                          borderRadius: 12,
                          padding: '13px 36px',
                          fontSize: 18,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 12px #7c6ee633',
                          letterSpacing: 1,
                          transition: 'background 0.18s',
                        }}
                        onClick={handleGetTranscript}
                      >
                        Get transcript
                      </button>
                    </Box>
                  )}
                  {loading ? (
                    <Box py={12} textAlign="center">
                      <Spinner size="lg" color="#7c6ee6" />
                    </Box>
                  ) : error ? (
                    <Box py={10} textAlign="center" color="red.500">
                      {error}
                    </Box>
                  ) : transcript ? (
                    <TranscriptSection transcriptData={transcript} formatTime={formatTime} onTranscriptClick={handleTranscriptClick} />
                  ) : null}
                </Box>
              </Tabs.Content>
              <Tabs.Content value="summary">
                <Box
                  w={{ base: '100%', md: '100%', lg: '100%' }}
                  maxW={{ base: '100%', md: '700px', lg: '800px' }}
                  minH={{ base: '320px', md: '400px', lg: '480px' }}
                  mx="auto"
                  px={{ base: 1, sm: 2, md: 6, lg: 8 }}
                  pt={{ base: 4, md: 6 }}
                  pb={{ base: 2, md: 4 }}
                  transition="all 0.2s"
                >
                  <SummarySection audio_id={audio_id} language={selectedLanguage} key={summaryReloadKey} />
                </Box>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </SimpleGrid>
       
      </Box>
      {/* Mini-player fixed bottom: only show when transcript tab is active */}
      <Tabs.Root defaultValue="transcript" orientation="horizontal">
        {/* ...existing code... */}
        <Box w="100%"   mx="auto" mt={0} px={0}>
          <Tabs.Content value="transcript">
            {/* ...existing code... */}
          </Tabs.Content>
          <Tabs.Content value="summary">
            {/* ...existing code... */}
          </Tabs.Content>
        </Box>
        {/* Mini-player only for transcript tab */}
        {audioUrl && (
          <Tabs.Content value="transcript">
            <AudioPlayer
              file={{ name: filename || 'Audio', size: 0, type: '', slice: () => new Blob() } as File}
              name={filename || 'Audio'}
              audioUrl={audioUrl}
              audioRef={audioRef}
              playing={playing}
              setPlaying={setPlaying}
              current={current}
              setCurrent={setCurrent}
              duration={duration}
              setDuration={setDuration}
              volume={volume}
              setVolume={setVolume}
            />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </Box>
  );
}

// Mini-player fixed bottom, Spotify style
type AudioPlayerProps = {
  file: File;
  name?: string;
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
};

function AudioPlayer({ audioUrl, audioRef, playing, setPlaying, current, setCurrent, duration, setDuration, volume, setVolume }: AudioPlayerProps) {
  const format = (s: number) => {
    if (!isFinite(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Handlers for audio events
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrent(e.currentTarget.currentTime);
  };
  const handleEnded = () => {
    setPlaying(false);
  };

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, audioRef]);

  return (
    <Box
      position="fixed"
      left="50%"
      bottom={{ base: 6, md: 18 }}
      transform="translateX(-50%)"
      zIndex={100}
      w={{ base: '100vw', sm: '98vw', md: '480px' }}
      maxW={{ base: '100vw', sm: '98vw', md: '480px' }}
      borderRadius={{ base: 0, sm: 24, md: 44 }}
      boxShadow="0 4px 24px 0 rgba(60,60,80,0.10), 0 1.5px 8px 0 rgba(180,180,200,0.10)"
      p={{ base: 2, sm: 3 }}
      display="flex"
      alignItems="center"
      gap={{ base: 2, sm: 3 }}
      bg="#fff"
      border="1.2px solid #eee"
      color="#111"
      fontFamily="Inter, system-ui, sans-serif"
      style={{
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        boxShadow: '0 4px 24px 0 rgba(60,60,80,0.10), 0 1.5px 8px 0 rgba(180,180,200,0.10)',
        border: '1.2px solid #eee',
        color: '#111',
        left: 0,
        right: 0,
      }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        style={{ display: 'none' }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <IconButton
        onClick={() => setPlaying(p => !p)}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{
          width: 48,
          height: 48,
          minWidth: 40,
          minHeight: 40,
          maxWidth: 60,
          maxHeight: 60,
          borderRadius: '50%',
          background: playing
            ? 'linear-gradient(135deg, #b7a6f7 0%, #7c6ee6 100%)'
            : 'rgba(240,240,245,0.85)',
          color: playing ? 'white' : '#7c6ee6',
          border: 'none',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: playing
            ? '0 0 0 10px rgba(128,90,213,0.10)'
            : '0 2px 8px rgba(180,180,200,0.10)',
          cursor: 'pointer',
          transition: 'background 0.22s',
        }}
      >
        {playing ? (
          <FiPause size={34} color="white" />
        ) : (
          <FiPlay size={34} color="#7c6ee6" />
        )}
      </IconButton>
      <Box flex={1} minW={0}>
        <Box display="flex" alignItems="center" gap={{ base: 1, sm: 2 }}>
          <Text fontSize={{ base: 'xs', sm: 'sm' }} minW={8} color="#7c6ee6">{format(current)}</Text>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={current}
            onChange={e => {
              const t = Number(e.target.value);
              setCurrent(t);
              if (audioRef.current) audioRef.current.currentTime = t;
            }}
            style={{
              flex: 1,
              accentColor: '#b7a6f7',
              height: 6,
              borderRadius: 7,
              background: 'linear-gradient(90deg, #e3d8fa 0%, #f7f6ff 100%)',
              boxShadow: '0 1px 8px #b7a6f722',
              border: 'none',
              minWidth: 0,
              maxWidth: '100%',
            }}
          />
          <Text fontSize={{ base: 'xs', sm: 'sm' }} minW={8} color="#7c6ee6">{format(duration)}</Text>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1} minW={{ base: 40, sm: 70 }} maxW={{ base: 60, sm: 90 }}>
        <svg width="18" height="18" fill="none" stroke="#7c6ee6" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#b7a6f7',
            maxWidth: 44,
            background: 'linear-gradient(90deg, #e3d8fa 0%, #f7f6ff 100%)',
            borderRadius: 7,
            border: 'none',
            minWidth: 0,
          }}
        />
        <svg width="18" height="18" fill="none" stroke="#7c6ee6" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 5v14M15 9v6"/></svg>
      </Box>
    </Box>
  );

}
