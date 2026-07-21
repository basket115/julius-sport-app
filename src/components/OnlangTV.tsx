import React, { useState, useEffect } from 'react';

interface VideoItem {
  id: string;
  kunden_id: string;
  titel: string;
  beschreibung: string;
  kategorie: string;
  video_url: string;
  thumbnail: string;
  is_live: boolean;
  is_youtube: boolean;
  dauer: string;
}

interface OnlangTVProps {
  kundenId?: string;
  branding?: any;
}

export const OnlangTV: React.FC<OnlangTVProps> = ({ kundenId = 'V006', branding = {} }) => {
  const [playlist, setPlaylist] = useState<VideoItem[]>([]);
  const [aktuellesVideo, setAktuellesVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const themaFarbe = branding?.Thema_Farbe || '#FD5E00';

  useEffect(() => {
    fetch(`/api/proxy?action=getTvPlaylist&kundenId=${encodeURIComponent(kundenId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.videos && data.videos.length > 0) {
          setPlaylist(data.videos);
          setAktuellesVideo(data.videos[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fehler beim Laden von ONLANG TV:', err);
        setLoading(false);
      });
  }, [kundenId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
        Lade ONLANG TV...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: themaFarbe, color: '#fff', padding: '6px 14px', fontWeight: 'bold', borderRadius: '6px', fontSize: '14px', letterSpacing: '1px' }}>
          ONLANG TV
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
          {branding?.Verein_Name || 'Vereins-TV'}
        </h2>
      </div>

      {/* Main Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden', padding: '12px', color: '#fff' }}>
        {/* Player */}
        <div>
          {aktuellesVideo ? (
            <>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                {aktuellesVideo.is_youtube ? (
                  <iframe
                    src={aktuellesVideo.video_url}
                    title={aktuellesVideo.titel}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={aktuellesVideo.video_url}
                    controls
                    autoPlay
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {aktuellesVideo.is_live && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e50914', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    🔴 LIVE
                  </div>
                )}
              </div>

              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: themaFarbe, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {aktuellesVideo.kategorie || 'Video'}
                </span>
                <h3 style={{ margin: '4px 0 6px 0', fontSize: '18px' }}>{aktuellesVideo.titel}</h3>
                <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>{aktuellesVideo.beschreibung}</p>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Derzeit keine Videos oder Livestreams verfügbar.
            </div>
          )}
        </div>

        {/* Playlist */}
        {playlist.length > 0 && (
          <div style={{ borderTop: '1px solid #222', paddingTop: '12px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#aaa' }}>Programm & Mediathek</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {playlist.map((video) => {
                const isActive = aktuellesVideo && aktuellesVideo.id === video.id;
                return (
                  <div
                    key={video.id}
                    onClick={() => setAktuellesVideo(video)}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#222' : 'transparent',
                      borderLeft: isActive ? `3px solid ${themaFarbe}` : '3px solid transparent'
                    }}
                  >
                    <img
                      src={video.thumbnail || 'https://via.placeholder.com/120x68'}
                      alt={video.titel}
                      style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: isActive ? themaFarbe : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {video.titel}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {video.dauer || 'Video'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlangTV;
