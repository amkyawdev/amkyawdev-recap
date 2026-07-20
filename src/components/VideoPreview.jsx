import { useRef, useState } from 'react';
import useAppStore from '../store/useAppStore';
import DurationValidator from './DurationValidator';

export default function VideoPreview() {
  const videoRef = useRef(null);
  const {
    videoUrl,
    videoFile,
    isPlaying,
    currentTime,
    volume,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    subtitles,
    setVideo,
    setActivePanel,
    addToast,
    videoMeta
  } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [showDurationWarning, setShowDurationWarning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const tempVideo = document.createElement('video');
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.onloadedmetadata = () => {
        const duration = tempVideo.duration;
        URL.revokeObjectURL(tempVideo.src);
        
        if (duration > 300) {
          setShowDurationWarning(true);
          setVideo(file, URL.createObjectURL(file), { duration, width: tempVideo.videoWidth, height: tempVideo.videoHeight });
        } else {
          setVideo(file, URL.createObjectURL(file), { duration, width: tempVideo.videoWidth, height: tempVideo.videoHeight });
          addToast({ type: 'success', message: 'Video uploaded successfully!' });
          setActivePanel('editor');
        }
      };
    } else {
      addToast({ type: 'error', message: 'Please select a valid video file' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const { duration, videoWidth, videoHeight } = videoRef.current;
      useAppStore.getState().videoMeta = { duration, width: videoWidth, height: videoHeight };
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setVolume(isMuted ? 1 : 0);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value) / 100;
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  const progressPercent = videoRef.current?.duration ? (currentTime / videoRef.current.duration) * 100 : 0;

  return (
    <div className="video-preview">
      {!videoUrl ? (
        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '64px', color: 'var(--accent-primary)', marginBottom: '20px' }}></i>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Upload Your Video</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Drag & drop or click to browse</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Supported: MP4, MOV, AVI, WebM, MKV (Max 2GB)
          </p>
          <input
            id="fileInput"
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div 
          className="video-container"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              onClick={togglePlay}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                background: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-play-fill" style={{ fontSize: '40px', color: '#fff' }}></i>
            </div>
          )}
          
          {/* Subtitle */}
          {currentSubtitle && (
            <div style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '1.1rem',
              maxWidth: '85%',
              textAlign: 'center',
              color: '#fff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {currentSubtitle.text}
            </div>
          )}

          {/* Controls */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            padding: '24px 16px 16px',
            transition: 'opacity 0.3s',
            opacity: showControls ? 1 : 0
          }}>
            {/* Progress Bar */}
            <div 
              onClick={handleProgressClick}
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '3px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                borderRadius: '3px',
                transition: 'width 0.1s'
              }} />
            </div>
            
            {/* Controls Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}>
                  <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: '28px' }}></i>
                </button>
                
                <button onClick={skipBackward} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }} title="Rewind 10s">
                  <i className="bi bi-arrow-left-circle-fill" style={{ fontSize: '24px' }}></i>
                </button>
                
                <button onClick={skipForward} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }} title="Forward 10s">
                  <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: '24px' }}></i>
                </button>
                
                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                    <i className={`bi ${isMuted || volume === 0 ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'}`} style={{ fontSize: '20px' }}></i>
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    style={{ 
                      width: '80px', 
                      height: '4px',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }} 
                  />
                </div>
                
                <span style={{ color: '#fff', fontSize: '0.85rem', marginLeft: '8px' }}>
                  {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
                </span>
              </div>
              
              {/* Right Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}>
                  <i className="bi bi-fullscreen" style={{ fontSize: '22px' }}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DurationValidator 
        isOpen={showDurationWarning}
        onClose={() => setShowDurationWarning(false)}
        duration={videoMeta.duration}
      />
    </div>
  );
}
