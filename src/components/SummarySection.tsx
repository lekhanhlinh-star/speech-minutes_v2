import { Box, Spinner } from "@chakra-ui/react";
import React from "react";
import { summarizeAudioById, getSummaryByAudioId,getTranscriptByAudioId } from "../api";

export default function SummarySection({ language, audio_id, summaryOverride, agendasOverride, actionItemsOverride }: {
  language?: string;
  audio_id?: string;
  summaryOverride?: string;
  agendasOverride?: any[];
  actionItemsOverride?: any[];
}) {
  const fontSize = 19;
  // summary can be a string or a parsed object containing agendas/action_items
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
    console.log("SummarySection useEffect triggered with audio_id:", audio_id);

  const [showGetSummaryBtn, setShowGetSummaryBtn] = React.useState(false);
  React.useEffect(() => {
    if (audio_id) {
      setLoading(true);
      setError(null);
      getSummaryByAudioId(audio_id)
        .then((data: any) => {
          setSummary({
            summary: data.summary?.summary || data.summary || '',
            agendas: data.summary?.agendas || data.agendas || [],
            action_items: data.summary?.action_items || data.action_items || [],
          });
          setShowGetSummaryBtn(false);
          setLoading(false);
        })
        .catch((err: any) => {
          if (err.message && err.message.includes('404')) {
            setShowGetSummaryBtn(true);
          } else {
            setShowGetSummaryBtn(true);
          }
          setLoading(false);
        });
      return;
    }
    if (summaryOverride || agendasOverride || actionItemsOverride) {
      setSummary({
        summary: summaryOverride,
        agendas: agendasOverride,
        action_items: actionItemsOverride,
      });
      setLoading(false);
      setError(null);
      return;
    }
    return;
  }, [audio_id, language, summaryOverride, agendasOverride, actionItemsOverride]);

  // Require transcript before allowing summary
  const [hasTranscript, setHasTranscript] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!audio_id) {
      setHasTranscript(null);
      return;
    }
    // Check if transcript exists for this audio_id using API helper
    getTranscriptByAudioId(audio_id)
      .then((data: any) => {
        // If transcript exists, set true
        console.log("Transcript fetch response:", data);
        setHasTranscript(!!data && !!data[0].audio_id);
      })
      .catch(() => setHasTranscript(false));
  }, [audio_id]);

  const handleSummarize = async () => {
    if (!audio_id || !hasTranscript) return;
    setLoading(true);
    setError(null);
    try {
      const data = await summarizeAudioById(audio_id, language);
      setSummary({
        summary: data.summary?.summary || data.summary || '',
        agendas: data.summary?.agendas || data.agendas || [],
        action_items: data.summary?.action_items || data.action_items || [],
      });
      setShowGetSummaryBtn(false);
    } catch {
      setError("Lỗi khi gọi API summary (audio_id)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" 
    
         w="100%"
          h="100%"
          // minH="100vh"
    minH={{ base: '320px', md: '400px' } }>
      <Box
        bg={"rgba(255,255,255,0.32)"}
        boxShadow={"0 4px 32px 0 rgba(180,180,200,0.10)"}
        borderRadius={24}
        border={"1.5px solid rgba(220,220,230,0.5)"}
       w="100%"
          h="100%"
          minH="100vh"
        fontSize={fontSize}
        color="#222"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 32px 0 rgba(180,180,200,0.10)",
          border: "1.5px solid rgba(220,220,230,0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box position="absolute" top={0} left={0} right={0} height="60px" borderTopLeftRadius={28} borderTopRightRadius={28} zIndex={1}
          style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
            filter: 'blur(2.5px)',
          }}
        />
       
        <Box
          mb={7}
          fontSize={{ base: 17, md: 19 }}
          color="#444"
          textAlign="left"
          lineHeight={1.7}
          w="100%"
          h="100%"
          minH="100vh"
          style={{
            // background:'rgba(197, 7, 7, 0.18)',
            borderRadius:14,
            padding:'14px 18px',
            boxShadow:'0 1.5px 8px 0 rgba(180,180,200,0.08) inset',
            border:'1px solid rgba(255,255,255,0.18)',
            zIndex:2,
            position:'relative',
          }}
        >
          {loading ? (
            <Spinner size="lg" color="#7c6ee6" />
          ) : error ? (
            error
          ) : showGetSummaryBtn ? (
            <Box textAlign="center" py={6}>
              <button
                style={{
                  background: hasTranscript ? '#7c6ee6' : '#ccc',
                  color: hasTranscript ? '#fff' : '#888',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: hasTranscript ? 'pointer' : 'not-allowed',
                  boxShadow: hasTranscript ? '0 2px 8px #7c6ee633' : 'none',
                  letterSpacing: 1
                }}
                onClick={handleSummarize}
                disabled={loading || !hasTranscript}
                title={hasTranscript === false ? 'You need to create a transcript before summarizing.' : ''}
              >
                {loading ? 'Generating...' : 'Get summary'}
              </button>
              {hasTranscript === false && (
                <Box color="red.500" fontSize={15} mt={2}>
                  You need to create a transcript before summarizing.
                </Box>
              )}
            </Box>
          ) : summary ? (
            (() => {
              // Determine what to render depending on the shape of `summary`
              let parsedSummary = summary;
              if (typeof parsedSummary === 'string') {
                try {
                  parsedSummary = JSON.parse(parsedSummary);
                } catch {
                  // leave as string
                }
              }

              // Check for empty summary result (audio too short)
              const isEmptySummary =
                parsedSummary && typeof parsedSummary === 'object' &&
                (
                  // Case 1: { summary: { summary: '', agendas: [], action_items: [] }, agendas: [], action_items: [] }
                  (
                    parsedSummary.summary && typeof parsedSummary.summary === 'object' &&
                    parsedSummary.summary.summary === '' &&
                    Array.isArray(parsedSummary.summary.agendas) && parsedSummary.summary.agendas.length === 0 &&
                    Array.isArray(parsedSummary.summary.action_items) && parsedSummary.summary.action_items.length === 0 &&
                    Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length === 0 &&
                    Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length === 0
                  )
                  // Case 2: { summary: '', agendas: [], action_items: [] }
                  || (
                    parsedSummary.summary === '' &&
                    Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length === 0 &&
                    Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length === 0
                  )
                );

              if (isEmptySummary) {
                return (
                  <Box color="red.500" fontWeight={600} fontSize={18} textAlign="center" py={6}>
                    Audio is too short to summarize.
                  </Box>
                );
              }

              // If it's an object with agendas or action_items, show all of them and the summary
              if (parsedSummary && typeof parsedSummary === 'object') {
                const parts: React.ReactNode[] = [];

                // Show summary text if present
                if (typeof parsedSummary.summary === 'string') {
                  parts.push(
                    <Box key="summary" mb={4}>
                      <Box fontWeight="bold" color="#7c6ee6" mb={1}>Summary</Box>
                      <Box color="#444">{parsedSummary.summary}</Box>
                    </Box>
                  );
                }

                // Show all agendas
                if (Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length > 0) {
                  parts.push(
                    <Box key="agendas" mb={4}>
                      <Box fontWeight="bold" color="#7c6ee6" fontSize={22} mb={3} letterSpacing={1}>
                        <span style={{verticalAlign:'middle', marginRight:8}}>🗂️</span>Agendas
                      </Box>
                      <Box display="flex" flexWrap="wrap" gap={4}>
                        {parsedSummary.agendas.map((agenda: any, idx: number) => (
                          <Box key={agenda.name || agenda.title || idx}
                            bg="#f7f6ff" boxShadow="0 2px 8px 0 rgba(124,110,230,0.08)"
                            borderRadius={16} border="1px solid #e2e0fa" p={4} minW="220px" flex="1 1 320px" mb={2}
                          >
                            <Box fontWeight="semibold" color="#5a4ee6" fontSize={18} mb={2} letterSpacing={0.5}>
                              <span style={{verticalAlign:'middle', marginRight:6}}>📋</span>{agenda.name || agenda.title || `Agenda ${idx+1}`}
                            </Box>
                            {Array.isArray(agenda.points) ? (
                              <ul style={{marginLeft: '0', paddingLeft: '18px', color: '#444', fontSize:'16px', lineHeight:'1.7'} }>
                                {agenda.points.map((pt: string, i: number) => (
                                  <li key={i} style={{marginBottom:'6px', display:'flex', alignItems:'center'}}>
                                    <span style={{color:'#7c6ee6', fontSize:'15px', marginRight:'7px'}}>•</span>
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Box color="#444">{agenda.points}</Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                }

                // Show all action items
                if (Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length > 0) {
                  parts.push(
                    <Box key="actions" mb={4}>
                      <Box fontWeight="bold" color="#7c6ee6" fontSize={22} mb={3} letterSpacing={1}>
                        <span style={{verticalAlign:'middle', marginRight:8}}>✅</span>Action Items
                      </Box>
                      <ul style={{marginLeft: '0', paddingLeft: '18px', color: '#444', fontSize:'16px', lineHeight:'1.7'} }>
                        {parsedSummary.action_items.map((item: any, idx: number) => (
                          <li key={idx} style={{marginBottom:'8px', display:'flex', alignItems:'center'}}>
                            <span style={{color:'#7c6ee6', fontSize:'15px', marginRight:'7px'}}>→</span>
                            <span>{item.task || item.description || JSON.stringify(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  );
                }

                // If we have parts to show, return them; otherwise fall back to showing the raw object
                if (parts.length > 0) return parts;

                return typeof parsedSummary === 'object' ? JSON.stringify(parsedSummary, null, 2) : parsedSummary;
              }

              // Fallback: show plain text summary
              return parsedSummary ?? '';
            })()
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
