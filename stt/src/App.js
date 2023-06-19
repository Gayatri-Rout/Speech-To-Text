import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import { useReactMediaRecorder } from 'react-media-recorder';

const appId = 'bc17954a-2c0b-48b0-972d-8c9d953c681d';
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

export default () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const [timer, setTimer] = useState(30); // Initial timer value of 30 seconds
  const [intervalId, setIntervalId] = useState(null); // Interval ID for the countdown timer

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const listenContinuously = () => {
    SpeechRecognition.startListening({ continuous: true });
    startRecording();
    startTimer();
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
    setIntervalId(interval);

    // Clear the interval when the timer reaches 0
    setTimeout(() => {
      clearInterval(interval);
      SpeechRecognition.stopListening();
      stopRecording();
    }, 30000); // 30 seconds
  };

  const stopTimer = () => {
    clearInterval(intervalId);
    SpeechRecognition.stopListening();
    stopRecording();
  };

  useEffect(() => {
    if (timer <= 0) {
      stopTimer();
    }
  }, [timer]);

  if (!browserSupportsSpeechRecognition) {
    return <span>No browser support</span>;
  }

  if (!isMicrophoneAvailable) {
    return <span>Please allow access to the microphone</span>;
  }

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <p>Recorder: {status}</p>
      <p>Timer: {formatTime(timer)} secs</p>
      <button onTouchStart={listenContinuously} onMouseDown={listenContinuously}>
        Start
      </button>
      <button onTouchEnd={stopTimer} onMouseUp={stopTimer}>
        Stop
      </button>
      <button onClick={resetTranscript}>Reset</button>
      <video src={mediaBlobUrl} controls autoPlay loop />
      <p>{transcript}</p>
    </div>
  );
};
