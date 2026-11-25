import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Headphones, Search, SlidersHorizontal, Sparkles, ExternalLink, Music2, Disc3 } from "lucide-react";

const GENRES = [
  "R&B", "Alternative R&B", "Hip-hop", "Rap", "Indie pop", "Dream pop",
  "Indie rock", "Neo-soul", "Jazz rap", "Bedroom pop", "Lo-fi", "Electronic",
  "Soul", "Psychedelic", "Trap", "Pop"
];
const MOODS = [
  "Vui vẻ", "Buồn", "Đang yêu", "Thất tình", "Hoài niệm", "Mơ màng",
  "Buồn chán", "Cần năng lượng", "Tự tin", "Overthinking", "Bình yên",
  "Cô đơn", "Muốn chill", "Nổi loạn"
];

const DEMO_TRACKS = [
  { title: "Snooze", artist: "SZA", tags: ["R&B", "Alternative R&B", "Đang yêu", "Mơ màng"] },
  { title: "Nights", artist: "Frank Ocean", tags: ["Alternative R&B", "Hip-hop", "Hoài niệm", "Overthinking"] },
  { title: "LOVE. (FEAT. ZACARI.)", artist: "Kendrick Lamar", tags: ["Hip-hop", "Rap", "Đang yêu", "Neo-soul"] },
  { title: "Pink + White", artist: "Frank Ocean", tags: ["R&B", "Dream pop", "Mơ màng", "Bình yên"] },
  { title: "The Less I Know The Better", artist: "Tame Impala", tags: ["Indie rock", "Psychedelic", "Thất tình", "Hoài niệm"] },
  { title: "Die For You", artist: "The Weeknd", tags: ["R&B", "Alternative R&B", "Thất tình", "Buồn"] },
  { title: "Bước Qua Mùa Cô Đơn", artist: "Vũ.", tags: ["Indie pop", "Indie rock", "Cô đơn", "Hoài niệm"] },
  { title: "Chìm Sâu", artist: "MCK", tags: ["Rap", "Hip-hop", "Đang yêu", "Mơ màng"] },
  { title: "telepatía", artist: "Kali Uchis", tags: ["R&B", "Dream pop", "Đang yêu", "Mơ màng"] },
  { title: "505", artist: "Arctic Monkeys", tags: ["Indie rock", "Alternative", "Hoài niệm", "Thất tình"] },
  { title: "Self Control", artist: "Frank Ocean", tags: ["Alternative R&B", "R&B", "Buồn", "Thất tình"] },
  { title: "Money Trees", artist: "Kendrick Lamar", tags: ["Hip-hop", "Rap", "Cần năng lượng", "Neo-soul"] },
  { title: "Best Part", artist: "Daniel Caesar", tags: ["R&B", "Soul", "Đang yêu", "Bình yên"] },
  { title: "Space Song", artist: "Beach House", tags: ["Dream pop", "Indie pop", "Mơ màng", "Hoài niệm"] },
  { title: "Tình Đắng Như Ly Cà Phê", artist: "Ngơ", tags: ["Indie pop", "Rap", "Buồn", "Cô đơn"] },
  { title: "Nàng Thơ", artist: "Hoàng Dũng", tags: ["Indie pop", "Pop", "Đang yêu", "Hoài niệm"] },
  { title: "Good Days", artist: "SZA", tags: ["R&B", "Alternative R&B", "Bình yên", "Mơ màng"] },
  { title: "Redbone", artist: "Childish Gambino", tags: ["Neo-soul", "R&B", "Psychedelic", "Mơ màng"] },
  { title: "Tình Yêu Ngủ Quên", artist: "Hoàng Tôn, LyHan", tags: ["R&B", "Pop", "Hoài niệm", "Thất tình"] },
  { title: "FE!N", artist: "Travis Scott", tags: ["Hip-hop", "Trap", "Rap", "Cần năng lượng"] }
];

const moodQueries = {
  "Cần năng lượng": "upbeat energetic",
  "Buồn": "sad emotional",
  "Thất tình": "heartbreak melancholic",
  "Mơ màng": "dreamy atmospheric",
  "Hoài niệm": "nostalgic",
  "Đang yêu": "love romantic",
  "Cô đơn": "lonely late night",
  "Overthinking": "introspective",
  "Nổi loạn": "aggressive alternative",
  "Bình yên": "chill mellow",
  "Muốn chill": "chill laid back"
};

function scoreTrack(track, genres, moods, artists) {
  const tags = (track.tags || []).map(x => x.toLowerCase());
  let score = genres.filter(g => tags.includes(g.toLowerCase())).length * 3;
  score += moods.filter(m => tags.includes(m.toLowerCase())).length * 3;
  const haystack = `${track.artist || ""} ${track.title || ""}`.toLowerCase();
  score += artists.filter(a => a && haystack.includes(a.toLowerCase())).length * 5;
  return score;
}

function platformSearch(platform, title, artist) {
  const q = encodeURIComponent(`${title} ${artist}`);
  if (platform === "Spotify") return `https://open.spotify.com/search/${q}`;
  if (platform === "SoundCloud") return `https://soundcloud.com/search?q=${q}`;
  return `https://www.youtube.com/results?search_query=${q}`;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [artist1, setArtist1] = useState("");
  const [artist2, setArtist2] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [source, setSource] = useState("YouTube");

  const artists = [artist1.trim(), artist2.trim()].filter(Boolean);
  const toggle = (value, list, setter) => setter(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);

  const demoRecommendations = useMemo(() => {
    return [...DEMO_TRACKS]
      .map((t, i) => ({ ...t, _score: scoreTrack(t, genres, moods, artists), _id: `demo-${i}`, demo: true }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);
  }, [genres, moods, artists]);

  async function discover() {
    setLoading(true);
    setError("");
    setActiveIndex(0);
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey || apiKey === "your_youtube_data_api_key_here") {
      setTracks(demoRecommendations);
      setSource("YouTube");
      setStep(3);
      setLoading(false);
      return;
    }
    try {
      const genreText = genres.join(" ");
      const moodText = moods.map(m => moodQueries[m] || m).join(" ");
      const artistText = artists.join(" ");
      const query = [artistText, genreText, moodText, "music"].filter(Boolean).join(" ");
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.search = new URLSearchParams({
        part: "snippet", type: "video", videoCategoryId: "10",
        maxResults: "10", q: query, key: apiKey, safeSearch: "moderate"
      }).toString();
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Không thể kết nối YouTube API.");
      const found = (data.items || []).filter(x => x.id?.videoId).map((x, i) => ({
        _id: x.id.videoId,
        videoId: x.id.videoId,
        title: x.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
        artist: x.snippet.channelTitle,
        description: x.snippet.description,
        tags: [...genres, ...moods],
        demo: false
      }));
      if (!found.length) throw new Error("Không tìm thấy kết quả. Thử thay đổi nghệ sĩ hoặc tag nhé.");
      setTracks(found);
      setStep(3);
    } catch (e) {
      setError(`${e.message} Đang chuyển sang danh sách demo.`);
      setTracks(demoRecommendations);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  const goToFeed = () => {
    if (genres.length < 3) return setError("Chọn ít nhất 3 thể loại trước nhé.");
    if (moods.length < 3) return setError("Chọn ít nhất 3 tâm trạng trước nhé.");
    discover();
  };

  function reset() {
    setStep(0); setGenres([]); setMoods([]); setArtist1(""); setArtist2("");
    setTracks([]); setError(""); setActiveIndex(0);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="Về trang đầu">
          <span className="brand-mark"><Disc3 size={20}/></span>
          <span>INDIE<span className="brand-accent">FREQUENCY</span></span>
        </button>
        <div className="top-right"><span className="live-dot"/> YOUR PERSONAL SOUNDTRACK <span className="top-index">VOL. 001</span></div>
      </header>

      {step < 3 ? (
        <section className="setup-wrap">
          <div className="setup-aside">
            <p className="eyebrow"><span>01</span> / PERSONAL MUSIC DNA</p>
            <h1>FIND<br/>YOUR<br/><em>FREQUENCY.</em></h1>
            <p className="aside-copy">Không phải playlist đại trà. Đây là một góc âm nhạc được tạo từ chính gu nghe và cảm xúc của bạn.</p>
            <div className="aside-sticker"><Headphones size={18}/><span>MADE FOR<br/>YOUR MOOD</span></div>
            <div className="vertical-note">TUNE IN · ZONE OUT · REPEAT</div>
          </div>

          <div className="setup-panel">
            <div className="progress-row">
              <span>YOUR SOUND PROFILE</span>
              <span>0{step + 1} <i>/ 03</i></span>
            </div>
            <div className="progress-track"><span style={{width: `${(step + 1) * 33.333}%`}}/></div>

            {step === 0 && <div className="step-content">
              <p className="step-kicker">LET'S START WITH THE SOUND</p>
              <h2>Thể loại nào<br/>làm bạn rung động?</h2>
              <p className="step-desc">Chọn ít nhất 3 thể loại. Có thể chọn nhiều hơn — gu nhạc đâu cần giới hạn.</p>
              <div className="tag-grid">
                {GENRES.map((g, i) => <button key={g} onClick={() => toggle(g, genres, setGenres)} className={`tag ${genres.includes(g) ? "selected" : ""}`}><span className="tag-no">{String(i+1).padStart(2,"0")}</span>{g}{genres.includes(g) && <span className="check">✓</span>}</button>)}
              </div>
              <div className="step-footer"><span>{genres.length} SELECTED <small>· MINIMUM 3</small></span><button className="primary-btn" disabled={genres.length < 3} onClick={() => {setError("");setStep(1)}}>TIẾP TỤC <ArrowRight size={16}/></button></div>
            </div>}

            {step === 1 && <div className="step-content">
              <p className="step-kicker">THE ARTISTS IN YOUR HEADPHONES</p>
              <h2>Ai là người<br/>định hình gu nhạc?</h2>
              <p className="step-desc">Nhập tên 1 hoặc 2 nghệ sĩ bạn thường nghe. Đây là manh mối để tìm ra những âm thanh gần với bạn.</p>
              <label className="input-label">ARTIST 01 <span>REQUIRED</span></label>
              <div className="artist-input"><Search size={18}/><input value={artist1} onChange={e=>setArtist1(e.target.value)} placeholder="e.g. Kendrick Lamar, Frank Ocean..." maxLength={70}/></div>
              <label className="input-label">ARTIST 02 <span>OPTIONAL</span></label>
              <div className="artist-input"><Search size={18}/><input value={artist2} onChange={e=>setArtist2(e.target.value)} placeholder="e.g. MCK, Joji, Tame Impala..." maxLength={70}/></div>
              <div className="artist-hint"><Sparkles size={15}/> Nghệ sĩ càng đa dạng, kết quả càng thú vị.</div>
              <div className="step-footer"><button className="back-btn" onClick={()=>{setError("");setStep(0)}}><ArrowLeft size={16}/> QUAY LẠI</button><button className="primary-btn" disabled={!artist1.trim()} onClick={()=>{setError("");setStep(2)}}>TIẾP TỤC <ArrowRight size={16}/></button></div>
            </div>}

            {step === 2 && <div className="step-content">
              <p className="step-kicker">A LITTLE CHECK-IN WITH YOURSELF</p>
              <h2>Hôm nay bạn<br/>đang ở tần số nào?</h2>
              <p className="step-desc">Chọn ít nhất 3 mood. Không cần hợp lý — cứ chọn đúng cảm giác của bạn lúc này.</p>
              <div className="tag-grid mood-grid">
                {MOODS.map((m,i)=><button key={m} onClick={()=>toggle(m,moods,setMoods)} className={`tag mood-tag ${moods.includes(m)?"selected":""}`}><span className="tag-no">{String(i+1).padStart(2,"0")}</span>{m}{moods.includes(m)&&<span className="check">✓</span>}</button>)}
              </div>
              <div className="step-footer"><button className="back-btn" onClick={()=>{setError("");setStep(1)}}><ArrowLeft size={16}/> QUAY LẠI</button><button className="primary-btn" disabled={moods.length<3 || loading} onClick={goToFeed}>{loading?"ĐANG TÌM...":"TÌM NHẠC CHO TÔI"} <ArrowRight size={16}/></button></div>
            </div>}
            {error && <p className="error-note">{error}</p>}
            <div className="panel-bottom"><span>INDEPENDENT TASTE. PERSONAL SOUND.</span><span>EST. 2025 — IF®</span></div>
          </div>
        </section>
      ) : (
        <section className="feed-layout">
          <aside className="feed-sidebar">
            <p className="eyebrow">YOUR PERSONAL MIX</p>
            <h2>THE<br/><em>FEELING</em><br/>IS MUTUAL.</h2>
            <p className="feed-intro">10 tracks, one little universe. Lướt xuống để tìm thấy bài hát tiếp theo của bạn.</p>
            <div className="profile-block"><span className="profile-label">YOUR GENRES</span><div className="mini-tags">{genres.map(g=><span key={g}>{g}</span>)}</div><span className="profile-label">YOUR MOODS</span><div className="mini-tags mood-mini">{moods.map(m=><span key={m}>{m}</span>)}</div><span className="profile-label">YOUR ARTISTS</span><p className="artist-summary">{artists.join("  /  ")}</p></div>
            <button className="edit-profile" onClick={reset}><SlidersHorizontal size={15}/> TẠO PROFILE MỚI</button>
            <div className="sidebar-bottom">SCROLL TO DISCOVER <ArrowDown size={14}/></div>
          </aside>
          <div className="feed-main">
            <div className="feed-heading"><div><p className="step-kicker">CURATED FOR YOUR FREQUENCY</p><h1>YOUR NEXT 10.</h1></div><span className="track-count">01 — {String(tracks.length).padStart(2,"0")}</span></div>
            <div className="feed-scroll" key={tracks.map(t=>t._id).join("-")}>
              {tracks.map((track,index)=><article className="track-card" key={track._id} id={`track-${index}`}>
                <div className="track-number">TRACK / {String(index+1).padStart(2,"0")}</div>
                <div className="track-visual">
                  <div className="visual-grain"/>
                  <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
                  <div className="visual-copy"><span>INDIE FREQUENCY SELECTS</span><strong>{String(index+1).padStart(2,"0")}</strong><small>LISTEN TO YOURSELF.</small></div>
                  <div className="visual-sticker"><Music2 size={22}/></div>
                </div>
                <div className="track-info">
                  <div className="track-meta"><span>NOW PLAYING / {String(index+1).padStart(2,"0")}</span><span>{track.demo ? "DISCOVERY MIX" : "YOUTUBE PICK"}</span></div>
                  <h2>{track.title}</h2><p className="track-artist">{track.artist}</p>
                  <div className="track-tags">{(track.tags||[]).slice(0,5).map(t=><span key={t}>{t}</span>)}</div>
                  {track.videoId ? <div className="youtube-frame"><iframe title={`${track.title} by ${track.artist}`} src={`https://www.youtube-nocookie.com/embed/${track.videoId}?start=0&end=60&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div> : <div className="demo-player"><div className="demo-disc"><Disc3 size={44}/></div><div><b>DEMO PICK</b><span>Danh sách gợi ý mẫu — mở nền tảng để nghe bài hát.</span></div></div>}
                  <div className="platform-row">
                    <a className="platform-btn youtube" href={platformSearch("YouTube",track.title,track.artist)} target="_blank" rel="noreferrer">YOUTUBE <ExternalLink size={13}/></a>
                    <a className="platform-btn" href={platformSearch("Spotify",track.title,track.artist)} target="_blank" rel="noreferrer">SPOTIFY <ExternalLink size={13}/></a>
                    <a className="platform-btn" href={platformSearch("SoundCloud",track.title,track.artist)} target="_blank" rel="noreferrer">SOUNDCLOUD <ExternalLink size={13}/></a>
                  </div>
                </div>
                <div className="card-index">{String(index+1).padStart(2,"0")}<span> / {String(tracks.length).padStart(2,"0")}</span></div>
              </article>)}
            </div>
            <div className="feed-end"><Disc3 size={22}/><p>YOU'VE REACHED THE END OF THIS FREQUENCY.</p><button onClick={reset}>MAKE ANOTHER MIX <ArrowRight size={15}/></button></div>
          </div>
        </section>
      )}
      <footer className="site-footer"><span>© INDIE FREQUENCY</span><span>MADE FOR THE WAY YOU FEEL.</span><span>NOT A TREND. A TASTE.</span></footer>
    </main>
  );
}
