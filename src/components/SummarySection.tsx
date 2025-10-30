import { Box, Spinner } from "@chakra-ui/react";
import { motion } from 'framer-motion';
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
    <Box display="flex" justifyContent="center" w="100%" h="100%" minH={{ base: '320px', md: '400px' }}>
      <Box
        bg="#fff"
        boxShadow="0 4px 32px 0 rgba(180,180,200,0.10)"
        borderRadius={24}
        border="1.5px solid rgba(220,220,230,0.5)"
        w="100%"
        h="100%"
        minH="100vh"
        fontSize={fontSize}
        color="#111"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 32px 0 rgba(180,180,200,0.10)",
          border: "1.5px solid rgba(220,220,230,0.5)",
          position: "relative",
          overflow: "hidden",
          color: '#111',
        }}
      >
        <Box
          mb={7}
          fontSize={{ base: 17, md: 19 }}
          color="#111"
          textAlign="left"
          lineHeight={1.7}
          w="100%"
          h="100%"
          minH="100vh"
          style={{
            borderRadius:14,
            padding:'14px 18px',
            boxShadow:'0 1.5px 8px 0 rgba(180,180,200,0.08) inset',
            border:'1px solid #fff',
            zIndex:2,
            position:'relative',
            color: '#111',
          }}
        >
          {loading ? (
            <Spinner size="lg" color="#888" />
          ) : error ? (
            <Box color="red.500" fontSize={16} py={4} textAlign="center">{error}</Box>
          ) : showGetSummaryBtn ? (
            <Box textAlign="center" py={6}>
              <button
                style={{
                  background: hasTranscript ? '#222' : '#ccc',
                  color: hasTranscript ? '#fff' : '#888',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: hasTranscript ? 'pointer' : 'not-allowed',
                  boxShadow: hasTranscript ? '0 2px 8px #8883' : 'none',
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
              let parsedSummary = summary;
              if (typeof parsedSummary === 'string') {
                try {
                  parsedSummary = JSON.parse(parsedSummary);
                } catch {}
              }
              const isEmptySummary =
                parsedSummary && typeof parsedSummary === 'object' &&
                ((parsedSummary.summary && typeof parsedSummary.summary === 'object' &&
                  parsedSummary.summary.summary === '' &&
                  Array.isArray(parsedSummary.summary.agendas) && parsedSummary.summary.agendas.length === 0 &&
                  Array.isArray(parsedSummary.summary.action_items) && parsedSummary.summary.action_items.length === 0 &&
                  Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length === 0 &&
                  Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length === 0)
                  || (parsedSummary.summary === '' &&
                    Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length === 0 &&
                    Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length === 0)
                );
              if (isEmptySummary) {
                return (
                  <Box color="red.500" fontWeight={600} fontSize={18} textAlign="center" py={6}>
                    Audio is too short to summarize.
                  </Box>
                );
              }
              if (parsedSummary && typeof parsedSummary === 'object') {
                const parts: React.ReactNode[] = [];
                if (typeof parsedSummary.summary === 'string' && parsedSummary.summary.trim() !== '') {
                  parts.push(
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      style={{ marginBottom: 36 }}
                    >
                      <Box fontWeight={800} fontSize={24} color="#23272f" mb={2} letterSpacing={0.1} style={{lineHeight:1.2, fontFamily:'Inter,Segoe UI,sans-serif'}}>
                        <span style={{verticalAlign:'middle', marginRight:10, fontSize:26}}>📝</span>Summary
                      </Box>
                      <Box
                        color="#23272f"
                        fontSize={18}
                        fontWeight={500}
                        bg="#f8fafd"
                        borderRadius={14}
                        px={6}
                        py={5}
                        boxShadow="0 2px 12px #e9eaf3, 0 1.5px 8px #f3f4f8"
                        border="1.5px solid #f1f2f6"
                        style={{lineHeight:1.7, fontFamily:'Inter,Segoe UI,sans-serif', letterSpacing:0.01}}
                        _hover={{ boxShadow: '0 4px 18px #e9eaf3, 0 2px 12px #f3f4f8' }}
                        as={motion.div}
                        // whileHover={{ scale: 1.015 }}
                        transition="box-shadow 0.18s"
                      >
                        {parsedSummary.summary}
                      </Box>
                    </motion.div>
                  );
                }
                if (Array.isArray(parsedSummary.agendas) && parsedSummary.agendas.length > 0) {
                  parts.push(
                    <motion.div
                      key="agendas"
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                      style={{ marginBottom: 36 }}
                    >
                      <Box fontWeight={800} color="#23272f" fontSize={22} mb={2} letterSpacing={0.1} style={{lineHeight:1.2, fontFamily:'Inter,Segoe UI,sans-serif'}}>
                        <span style={{verticalAlign:'middle', marginRight:10, fontSize:24}}>🗂️</span>Agendas
                      </Box>
                      <Box display="flex" flexDirection="column" gap={5}>
                        {parsedSummary.agendas.map((agenda: any, idx: number) => (
                          <motion.div
                            key={agenda.name || agenda.title || idx}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.36, delay: 0.12 + idx * 0.06, ease: 'easeOut' }}
                            whileHover={{ scale: 1.012, boxShadow: '0 4px 18px #e9eaf3, 0 2px 12px #f3f4f8' }}
                            style={{ background:'#f7f8fa', boxShadow:'0 2px 10px 0 #e9eaf3', borderRadius:14, border:'1.5px solid #f1f2f6', padding: '20px 24px', minWidth:220, marginBottom:2, transition:'box-shadow 0.18s', position:'relative', cursor:'pointer' }}
                          >
                            <Box fontWeight={700} color="#23272f" fontSize={18} mb={2} letterSpacing={0.1} style={{display:'flex',alignItems:'center', fontFamily:'Inter,Segoe UI,sans-serif'}}>
                              <span style={{verticalAlign:'middle', marginRight:8, fontSize:18}}>📋</span>{agenda.name || agenda.title || `Agenda ${idx+1}`}
                            </Box>
                            {Array.isArray(agenda.points) ? (
                              <ul style={{
                                marginLeft: 0,
                                paddingLeft: 0,
                                color: '#23272f',
                                fontSize: '16px',
                                lineHeight: '1.7',
                                marginBottom: 0,
                                fontWeight: 500,
                                listStyle: 'none',
                              }}>
                                {agenda.points.map((pt: string, i: number) => (
                                  <li
                                    key={i}
                                    style={{
                                      marginBottom: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      background: '#fff',
                                      borderRadius: 10,
                                      padding: '10px 16px',
                                      border: '1.5px solid #e6eaf2',
                                      boxShadow: '0 1px 4px #f2f4fa',
                                      transition: 'box-shadow 0.18s, background 0.18s',
                                      position: 'relative',
                                      minHeight: 38,
                                    }}
                                  >
                                    <span style={{
                                      color: '#7c6ee6',
                                      fontSize: '15px',
                                      marginRight: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 22,
                                      height: 22,
                                      background: '#f1f0fa',
                                      borderRadius: '50%',
                                      fontWeight: 700,
                                      flexShrink: 0,
                                    }}>•</span>
                                    <span style={{
                                      fontWeight: 500,
                                      color: '#111',
                                      fontSize: '16px',
                                      letterSpacing: 0.01,
                                      lineHeight: 1.6,
                                      fontFamily: 'Inter,Segoe UI,sans-serif',
                                      flex: 1,
                                      wordBreak: 'break-word',
                                    }}>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Box color="#23272f">{agenda.points}</Box>
                            )}
                          </motion.div>
                        ))}
                      </Box>
                    </motion.div>
                  );
                }
                if (Array.isArray(parsedSummary.action_items) && parsedSummary.action_items.length > 0) {
                  parts.push(
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
                      style={{ marginBottom: 36 }}
                    >
                      <Box fontWeight={800} color="#23272f" fontSize={22} mb={2} letterSpacing={0.1} style={{lineHeight:1.2, fontFamily:'Inter,Segoe UI,sans-serif'}}>
                        <span style={{verticalAlign:'middle', marginRight:10, fontSize:24}}>✅</span>Action Items
                      </Box>
                      <ul style={{marginLeft: '0', paddingLeft: '18px', color: '#23272f', fontSize:'16px', lineHeight:'1.7', marginBottom:0, fontWeight:500}}>
                        {parsedSummary.action_items.map((item: any, idx: number) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.32, delay: 0.18 + idx * 0.05, ease: 'easeOut' }}
                            whileHover={{ scale: 1.025, background: '#f5f7fa', boxShadow: '0 4px 18px #e9eaf3' }}
                            style={{
                              marginBottom: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              background: '#fafdff',
                              borderRadius: 14,
                              padding: '18px 22px',
                              border: '1.5px solid #e6eaf2',
                              boxShadow: '0 2px 10px #f2f4fa',
                              cursor: 'pointer',
                              transition: 'box-shadow 0.18s, background 0.18s',
                              position: 'relative',
                              minHeight: 54,
                            }}
                          >
                            <span style={{
                              color: '#5bb974',
                              fontSize: '22px',
                              marginRight: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              background: '#eafaf1',
                              borderRadius: '50%',
                              boxShadow: '0 1px 4px #e9eaf3',
                              flexShrink: 0,
                            }}>✔</span>
                            <span style={{
                              fontWeight: 600,
                              color: '#23272f',
                              fontSize: '17px',
                              letterSpacing: 0.01,
                              lineHeight: 1.6,
                              fontFamily: 'Inter,Segoe UI,sans-serif',
                              flex: 1,
                              wordBreak: 'break-word',
                            }}>{item.task || item.description || JSON.stringify(item)}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                }
                if (parts.length > 0) return parts;
                return typeof parsedSummary === 'object' ? JSON.stringify(parsedSummary, null, 2) : parsedSummary;
              }
              return parsedSummary ?? '';
            })()
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
