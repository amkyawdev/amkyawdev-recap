import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload } from 'lucide-react';
import useAppStore from '../store/useAppStore';

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
    addToast
  } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideo(file, url, { duration: 0, width: 0, height: 0 });
      addToast({ type: 'success', message: 'Video uploaded successfully!' });
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
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : 1);
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

  return (
    <div className="video-preview">
      {!videoUrl ? (
        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload />
          <h3>Upload Your Video</h3>
          <p>Drag & drop or click to browse</p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
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
        <div className="video-container">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
          
          {currentSubtitle && (
            <div style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '1.1rem',
              maxWidth: '80%',
              textAlign: 'center',
              color: 'white'
            }}>
              {currentSubtitle.text}
            </div>
          )}

          <div className="video-controls">
            <div 
              className="progress-bar"
              onClick={handleProgressClick}
            >
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` 
                }}
              />
            </div>
            
            <div className="controls-row">
              <div className="controls-left">
                <button className="btn-icon" onClick={togglePlay}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button className="btn-icon" onClick={toggleMute}>
                  {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
                </span>
              </div>
              
              <div className="controls-right">
                <button className="btn-icon" onClick={toggleFullscreen}>
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
