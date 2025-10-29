// Format seconds to 00:00:00,000
export function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec - Math.floor(sec)) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Mock transcript data
export const transcriptData = {
    "language": "zh",
    "segments": [
      {
        "end": 25.316,
        "speaker": "SPEAKER_00",
        "start": 0.009,
        "text": "前三個格子都是相對比較大的格子那這前三個格子一定是最大次大相對小剩下來就是輝輝的一半格可是他可能會有選取狀態例如他被選的時候他就會變大他是這樣設計有動畫效果的嗎理論上會不打緊啦我是至少顏色會變但是第一眼看下去在沒被選取的時候的狀態就是那種自然的有最大次大相對小的一般"
      },
      {
        "end": 43.677,
        "speaker": "SPEAKER_00",
        "start": 25.316,
        "text": "那某個被點到之後他如果要被highlight那是他們的創意嗎那我就沒意見了好所以我希望在沒有點選的時候其實就有我上次說的推薦文字那些什麼閃光效果就寫在這邊選什麼就是寫在這邊什麼軒英配合大"
      },
      {
        "end": 61.169,
        "speaker": "SPEAKER_00",
        "start": 43.677,
        "text": "大什麼的那是隨便寫了一個字嗎對他說稍微寫了這邊的文字好那所以不對啊全營配配也寫錯了這是亂寫的就表示說文字會寫在這裡"
      },
      {
        "end": 81.186,
        "speaker": "SPEAKER_00",
        "start": 61.169,
        "text": "好所以它的意思其實因為比如說像這個就是顯示一個信用卡信用卡就是一般的嘛對不對對好然後像這一個就是來配的對口袋有夠浮的到一些什麼東西但這個文字也不重要它就是一個"
      },
      {
        "end": 105.145,
        "speaker": "SPEAKER_00",
        "start": 82.415,
        "text": "那個文字會反映這邊的意思不太對的原因是因為LOGO是一個東西一個元素另外一個元素其實是它本來的正式這個字符的中文的名稱OK然後第三個元素其實就是那個可以被我們在後台填寫我們要highlight它是什麼譬如說譬如說幾月幾號我假設如果這個功能"
      },
      {
        "end": 130.742,
        "speaker": "SPEAKER_00",
        "start": 105.145,
        "text": "可以讓我選定幾月幾號到幾月幾號然後要秀什麼文字然後我就按發布同時妳這個功能也可以讓我選第一名是誰第二名是誰第三名是誰第四名是誰就是讓我可以調整嘛對不對所以我的想像沒有錯的話當我選擇了這一些順位之後那只有前三名會讓我有機會可以針對她的那一個推薦文字去寫些什麼"
      },
      {
        "end": 149.906,
        "speaker": "SPEAKER_00",
        "start": 130.742,
        "text": "那我當然就一定會寫出來這個推薦您擊推大戰什麼覺得這個支付可以給你有5%回饋10%回饋30%回饋或是加正多少個點數什麼的那他再什麼都沒點的時候就可以看到前三名的都這麼厲害這樣就很牛了"
      },
      {
        "end": 173.985,
        "speaker": "SPEAKER_00",
        "start": 149.906,
        "text": "那他如果願意點進去那要再看到寫什麼那頂多就是點了第二層可以讓我寫更細的東西那如果沒有要準備讓我做第二層要更細的東西可以寫的話我希望第一行就有很簡單的一個字可以去呈現這個字符我們真的很推薦他因為他有什麼幾%都會歸這樣子那可能就會是這邊是中文名字然後下面是文字"
      },
      {
        "end": 190.759,
        "speaker": "SPEAKER_00",
        "start": 173.985,
        "text": "對那就會有那可能一般的就不會有文字了對一般的就只會有它的中文名字不會有個推薦文字好所以總共要四種大小對然後那個推薦文字的部分可以讓我用不同的顏色的話會更好"
      },
      {
        "end": 208.302,
        "speaker": "SPEAKER_01",
        "start": 191.169,
        "text": "比較Highlight可能比較不適合好因為技術上可以但是你會很難調配前台的這個背景那個文字顏色是明顯的好那就順便就看那個文字寫得有多吸引人這樣子對好可以"
      },
      {
        "end": 231.032,
        "speaker": "SPEAKER_00",
        "start": 208.302,
        "text": "那大中小閣三個可以嘛對不對可以那總共會有四個大小對那這邊就這樣就好了好然後在他本來已經有的這一邊對如果比如他本來選的賴佩那賴佩這段期間有活動就是我剛剛這個推薦文字應用的時候理論上這邊的賴佩也要能夠看到那個文字"
      },
      {
        "end": 248.148,
        "speaker": "SPEAKER_00",
        "start": 231.032,
        "text": "那他當他進來看到他可能一時衝動想要去換那個對我們比較不利的或是對他來說相對不利的那個支付可是他本來綁定或本來已經正在用的那個支付工具剛好有活動那大家可以不要換因為他不換對我們跟對他都有利"
      },
      {
        "end": 269.684,
        "speaker": "SPEAKER_00",
        "start": 248.148,
        "text": "那所以我會建議這邊有什麼推薦文字在這邊就要能夠跟著秀出來如果她是那個前三名被推薦的那個支付工具的好OK然後剩下的下面這一邊就是其他的比如說她綁了三個那我們未來有八個這邊下面會有五個嘛那五個其實跟這邊一樣是列表選的就可以了"
      },
      {
        "end": 285.435,
        "speaker": "SPEAKER_00",
        "start": 269.684,
        "text": "然後是要被推薦的一樣就會比較大眾享這樣子如果推薦就是一般會員這樣可以理解嗎OK那就沒有其他的建議好那我再跟他們講好謝謝感謝"
      },
      {
        "end": 311.766,
        "speaker": "SPEAKER_01",
        "start": 288.285,
        "text": "還要花到早起因為之前他們要求的很棒所以他們其實是刻意的之前太忙都沒有來畫這些就是之前的情況是他們畫的直接進開發但因為幾次個案會議就是我這邊看到都會直接說要怎麼樣怎麼樣好他們後來就是會先畫給我確認再進開發太棒了終於變成專業表謝謝"
      },
      {
        "end": 405.196,
        "start": 387.142,
        "text": "一二三四五三二一二三四五一二三四五一二三四五一二三四五一二三四五一二三四五"
      },
      {
        "end": 444.002,
        "speaker": "SPEAKER_01",
        "start": 435.367,
        "text": "兄弟如果有需要排隊的話我可以告訴你拿幾場連上消防組現在只剩這個火槍B而已只有一棟地就這兩層很希望大家同意"
      }
    ]
  };

// Mock summary data
export const summaryData = {
  summary: "本次会议主要讨论了用户界面设计中的格子大小、选择状态、文字展示以及推荐文字的显示效果。参会人员确认了格子在未选取状态下的自然排序，并在被点击后的高亮效果。此外，还讨论了如何在前三名展示推荐文字，并探讨了文字颜色和背景配色的技术可行性。最终决定，推荐文字将在第一行以简洁的中文名字呈现，并在后台允许调整文字内容和颜色。还讨论了当用户已绑定的支付工具有活动时，如何确保用户能够看到相关推荐信息，以避免不必要的切换。",
  action_items: [
      { task: "设计团队：确定前四个格子的大小排序和未选取状态下的自然排序效果。" },
      { task: "设计团队：实现选择状态下的动画效果和颜色变化。" },
      { task: "设计团队：在第一行展示推荐文字，并在后台允许调整文字内容和颜色。" },
      { task: "设计团队：确保当用户已绑定的支付工具有活动时，推荐文字能够显示。" },
      { task: "技术团队：确保推荐文字部分可以使用不同的颜色以突出显示。" },
      { task: "技术团队：确认文字颜色与背景配色的协调性，确保文字清晰可见。" },
      { task: "技术团队：实现当用户已绑定的支付工具有活动时，推荐文字的显示逻辑。" }
    ],
    agendas: [
      {
        name: "格子大小与选择状态",
        points: [
          "确认前四个格子的大小排序为最大、次大、相对小、最小。",
          "讨论选择状态下的动画效果和颜色变化。",
          "确认未选取状态下的自然排序效果。"
        ]
      },
      {
        name: "文字展示与推荐文字",
        points: [
          "推荐文字应在第一行以简洁的中文名字呈现。",
          "讨论推荐文字的显示位置和内容。",
          "确认推荐文字应在前三名展示，未选取状态下仅显示中文名字。",
          "当用户已绑定的支付工具有活动时，确保推荐文字能够显示，以避免用户切换到不利的支付工具。"
        ]
      },
      {
        name: "颜色与背景配色",
        points: [
          "推荐文字部分可以使用不同的颜色以突出显示。",
          "讨论技术上实现不同颜色的可行性。",
          "确认文字颜色应与背景配色协调，确保文字清晰可见。"
        ]
      }
    ]
  
};
import { FiPlay, FiPause } from "react-icons/fi";
import React from "react";
import { Box, IconButton, Text, Spinner } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import TranscriptSection from "./TranscriptSection";
import SummarySection from "./SummarySection";
import { useLocation, useParams } from "react-router-dom";
import { useColorModeValue } from "./ui/color-mode";
import { CgTranscript } from "react-icons/cg";
import { MdSummarize } from "react-icons/md";
import { transcribeAudioById, summarizeAudioById, getTranscriptByAudioId } from "../api";
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
  const upload_time = location.state?.upload_time;
  // If audio_id is present, treat as backend audio
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (s3_url) {
      setAudioUrl(s3_url);
    } else {
      setAudioUrl(null);
    }
  }, [s3_url]);
  // Glassmorphism/Neumorphism styles
  const tabBg = useColorModeValue(
    "rgba(255,255,255,0.65)",
    "rgba(35,35,42,0.65)"
  );
  const tabBorder = useColorModeValue("rgba(220,220,230,0.7)", "rgba(60,60,80,0.5)");
  const tabShadow = useColorModeValue(
    "0 8px 32px 0 rgba(180,180,200,0.18)",
    "0 8px 32px 0 rgba(20,20,30,0.28)"
  );

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
  // console.log("AudioDetailPage render, audio_id:", audio_id);
  React.useEffect(() => {
    if (audio_id) {
      setLoading(true);
      setError(null);
      console.log("Fetching transcript for audio_id:", audio_id);
      getTranscriptByAudioId(audio_id)

        .then((data) => {
          setTranscript({ language: selectedLanguage, segments: data[0].segments });
          console.log("Fetched transcript data:", data[0].segments);
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
    } catch {
      setError("Lỗi khi gọi API transcript (audio_id)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" pb="110px" h={"100%"} bg={useColorModeValue("#f6f7fa", "#191a1f")
    
    }
      style={{
        background:
          'linear-gradient(120deg, rgba(245,245,255,0.7) 0%, rgba(230,230,245,0.5) 100%)',
        minHeight: '100vh',
      }}
    >
      <Box
        maxW="700px"
        
        mx="auto"
        mt={20}
        borderRadius={32}
        boxShadow={tabShadow}
        bg={tabBg}
        px={{ base: 0, md: 0 }}
        py={0}
        border={`1.5px solid ${tabBorder}`}
        position="relative"
        fontFamily="Inter, system-ui, sans-serif"
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          overflow: 'hidden',
        }}
      >
        {/* Language selection dropdown */}
        <Box px={6} pt={6} pb={2} textAlign="right">
          <label htmlFor="language-select" style={{fontWeight:600, marginRight:8, color:'#7c6ee6'}}>Language:</label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: '16px',
              color: '#444',
              background: '#f7f6ff',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 4px #7c6ee622',
              marginLeft: 4,
            }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Box>
        <Tabs.Root defaultValue="transcript" orientation="horizontal">
          <Tabs.List style={{
            background: 'none',
            boxShadow: 'none',
            borderBottom: `1.5px solid ${tabBorder}`,
            marginBottom: 0,
            padding: '0 12px',
            backdropFilter: 'blur(8px)',
          }}>
            <Tabs.Trigger value="transcript" fontSize={"xl"} style={{
              background: 'none',
              border: 'none',
              color: '#222',
              fontWeight: 600,
              letterSpacing: 0.5,
              padding: '12px 24px',
              borderRadius: 18,
              marginRight: 8,
              transition: 'background 0.18s',
              outline: 'none',
            }}>
                <CgTranscript style={{marginRight: 6, opacity: 0.7}} />
                 Transcript
            </Tabs.Trigger>
            <Tabs.Trigger value="summary" fontSize={"xl"} style={{
              background: 'none',
              border: 'none',
              color: '#222',
              fontWeight: 600,
              letterSpacing: 0.5,
              padding: '12px 24px',
              borderRadius: 18,
              transition: 'background 0.18s',
              outline: 'none',
            }}>
                <MdSummarize style={{marginRight: 6, opacity: 0.7}} />
                 Summary
            </Tabs.Trigger>
            <Tabs.Indicator style={{
              height: 6,
              background: 'rgba(128,90,213,0.18)',
              borderRadius: 6,
              marginTop: 8,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px #805ad522',
              filter: 'blur(1.5px)',
            }} />
          </Tabs.List>
          <Box w="100%" mx="auto" mt={0} px={0}>
            {/* Unified width/minW/maxW/minH for both tabs */}
            <Tabs.Content value="transcript">
              <Box
                // w={{ base: '100vw', sm: '100vw', md: '90%', lg: '80%' }}
                // maxW={{ base: '100vw', sm: '98vw', md: '800px', lg: '900px' }}
                minW={{ base: '0', md: '400px', lg: '600px' }}
                h="100%"
                minH="100vh"
                // bg={"#000000ff"}
                mx="auto"
              >
                {audio_id && !transcript && !loading && (
                  <Box py={6} textAlign="center">
                    <button
                      style={{
                        background: '#7c6ee6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #7c6ee633', letterSpacing: 1
                      }}
                      onClick={handleGetTranscript}
                    >
                      Get transcript
                    </button>
                  </Box>
                )}
                {loading ? (
                  <Box py={10} textAlign="center">
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
                // w={{ base: '100vw', sm: '100vw', md: '90%', lg: '80%' }}
                // maxW={{ base: '100vw', sm: '98vw', md: '800px', lg: '900px' }}
                minW={{ base: '0', md: '400px', lg: '600px' }}
                // minH={{ base: '320px', md: '400px' }}
                  h="100%"
                minH="100vh"
                mx="auto"
              >
                <SummarySection audio_id={audio_id} language={selectedLanguage} />
              </Box>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
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

function AudioPlayer({ file, audioUrl, audioRef, playing, setPlaying, current, setCurrent, duration, setDuration, volume, setVolume }: AudioPlayerProps) {
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
      bottom={18}
      transform="translateX(-50%)"
      zIndex={100}
      w={{ base: '98vw', md: '480px' }}
      maxW="99vw"
      borderRadius={40}
      boxShadow="0 8px 32px 0 rgba(128,90,213,0.10), 0 2px 12px rgba(180,180,200,0.10)"
      p={3}
      display="flex"
      alignItems="center"
      gap={3}
      bg="rgba(255,255,255,0.65)"
      border="1.5px solid rgba(220,220,230,0.5)"
      fontFamily="Inter, system-ui, sans-serif"
      style={{
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 8px 32px 0 rgba(128,90,213,0.10), 0 2px 12px rgba(180,180,200,0.10)',
        border: '1.5px solid rgba(220,220,230,0.5)',
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
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: playing ? 'rgba(128,90,213,0.92)' : 'rgba(240,240,245,0.85)',
          color: playing ? 'white' : '#7c6ee6',
          border: 'none',
          fontSize: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: playing ? '0 0 0 8px rgba(128,90,213,0.08)' : '0 2px 8px rgba(180,180,200,0.10)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <FiPause size={32} color="white" />
        ) : (
          <FiPlay size={32} color="#7c6ee6" />
        )}
      </IconButton>
      <Box flex={1} minW={0}>
        <Text fontWeight="bold" fontSize="lg" mb={1} truncate style={{color:'#222', letterSpacing:0.2}}>{file.name}</Text>
        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="sm" minW={10} color="#7c6ee6">{format(current)}</Text>
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
              accentColor: '#7c6ee6',
              height: 6,
              borderRadius: 6,
              background: 'rgba(240,240,245,0.55)',
              boxShadow: '0 1px 4px #7c6ee622',
              border: 'none',
            }}
          />
          <Text fontSize="sm" minW={10} color="#7c6ee6">{format(duration)}</Text>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1} minW={70} maxW={90}>
        <svg width="20" height="20" fill="none" stroke="#7c6ee6" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#7c6ee6',
            maxWidth: 50,
            background: 'rgba(240,240,245,0.55)',
            borderRadius: 6,
            border: 'none',
          }}
        />
        <svg width="20" height="20" fill="none" stroke="#7c6ee6" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 5v14M15 9v6"/></svg>
      </Box>
    </Box>
  );

}
