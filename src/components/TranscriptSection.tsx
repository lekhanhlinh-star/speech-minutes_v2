
import { Box, IconButton } from "@chakra-ui/react";
import { FiPlay } from "react-icons/fi";


type TranscriptSectionProps = {
  transcriptData: { segments: any[] };
  formatTime: (sec: number) => string;
  onTranscriptClick: (start: number) => void;
};

export default function TranscriptSection({ transcriptData, formatTime, onTranscriptClick }: TranscriptSectionProps) {
  const fontSize = 19;

  return (
    <Box display="flex" justifyContent="center" minH={{ base: '320px', md: '400px' }}>
      <Box
        bg="#fff"
        boxShadow="0 4px 32px 0 rgba(180,180,200,0.10)"
        borderRadius={24}
        border="1.5px solid rgba(220,220,230,0.5)"
        p={{ base: 4, sm: 6, md: 8, lg: 10 }}
        w={{ base: '100%', sm: '95%', md: '90%', lg: '800px' }}
        minW={{ base: '0', md: '400px', lg: '600px' }}
        maxW={{ base: '100%', sm: '98vw', md: '800px', lg: '900px' }}
        minH={{ base: '320px', md: '400px' }}
        fontSize={fontSize}
        color="#111"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 32px 0 rgba(180,180,200,0.10)",
          border: '1.5px solid rgba(220,220,230,0.5)',
          color: '#111',
        }}
      >
        {Array.isArray(transcriptData?.segments) && transcriptData.segments.length > 0 ? (
          transcriptData.segments.map((seg, idx) => (
          <Box
            key={idx}
            mb={6}
            pb={4}
            borderRadius={16}
            display="flex"
            alignItems="flex-start"
            gap={3}
            _hover={{
              background: '#f5f5f5',
              boxShadow: '0 2px 12px 0 rgba(128,128,128,0.08)',
              border: '1px solid #e2e8f0',
            }}
            style={{
              transition: 'background 0.18s, box-shadow 0.18s',
              padding: '12px 18px',
              background: '#fff',
              border: '1px solid rgba(220,220,230,0.13)',
              boxShadow: '0 1px 4px 0 rgba(180,180,200,0.06)',
              cursor: 'pointer',
              color: '#111',
            }}
          >
            <IconButton
              aria-label="Play segment"
              size="sm"
              colorScheme="purple"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                onTranscriptClick(seg.start);
              }}
              style={{marginTop: 2}}
            >
              <FiPlay />
            </IconButton>
            <Box flex={1}>
              <Box fontSize="sm" color="#222" fontWeight="bold" mb={1} textAlign="left">
                {seg.speaker ? seg.speaker : ""} <span style={{color:'#888', fontWeight:400, marginLeft:8}}>{formatTime(seg.start)} - {formatTime(seg.end)}</span>
              </Box>
              <Box fontSize="lg" fontFamily="inherit" whiteSpace="pre-line" textAlign="left" color="#111" style={{letterSpacing:0.1}}>{seg.text}</Box>
            </Box>
          </Box>
          ))
        ) : (
          <Box color="#888" fontSize="md" textAlign="center" py={6}>
            No transcript available.
          </Box>
        )}
      </Box>
    </Box>
  );
}
