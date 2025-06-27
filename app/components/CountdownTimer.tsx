import { useAudioPlayer } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Vibration, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const audioSource = require("../../assets/sounds/zapsplat_multimedia_alert_ping_chine_ring.mp3");

export default function CountdownTimer() {
  const theme = useTheme();
  const player = useAudioPlayer(audioSource); // Initialize audio player with the sound file
  player.loop = true; // Set the player to loop
  player.seekTo(0);

  const defaultMinutes = 5;
  const maxMinutes = 60; // Max settable time
  const minMinutes = 1; // Min settable time

  const [initialTimerMinutes, setInitialTimerMinutes] =
    useState(defaultMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerIntervalRef = useRef(null); // Ref to hold the interval ID
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // Reset timeLeft when initialTimerMinutes changes, but only if not running or sound is not playing
  useEffect(() => {
    if (!isRunning && !isSoundPlaying) {
      setTimeLeft(initialTimerMinutes * 60);
    }
  }, [initialTimerMinutes, isRunning, isSoundPlaying]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      Vibration.vibrate([500, 500, 500]);
      player.seekTo(0);
      player.play();
      setIsSoundPlaying(true);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, timeLeft, player]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      player.pause();
      player.seekTo(0);
      setIsSoundPlaying(false);
    };
  }, [player]);

  // Start/Stop button logic
  const handleStartStop = async () => {
    if (isSoundPlaying) {
      // Stop sound and reset timer to default
      player.pause();
      player.seekTo(0);
      setIsSoundPlaying(false);
      setInitialTimerMinutes(defaultMinutes);
      setTimeLeft(defaultMinutes * 60);
    } else if (isRunning) {
      // Stop timer and reset
      setIsRunning(false);
      setTimeLeft(initialTimerMinutes * 60);
    } else {
      // Start timer
      setIsRunning(true);
      if (timeLeft === 0) {
        setTimeLeft(initialTimerMinutes * 60);
      }
    }
  };

  // +/- button logic
  const handleAdjustTime = (amountInMinutes) => {
    if (!isRunning && !isSoundPlaying) {
      setInitialTimerMinutes((prev) => {
        const newMinutes = prev + amountInMinutes;
        if (newMinutes < minMinutes) return minMinutes;
        if (newMinutes > maxMinutes) return maxMinutes;
        return newMinutes;
      });
    }
  };

  // --- Circular Progress Bar Calculations ---
  const size = 250; // Diameter of the circle
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress percentage and strokeDashoffset for the progress bar
  const progressPercentage = (timeLeft / (initialTimerMinutes * 60)) * 100;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <View style={styles.timerSection}>
      <View style={styles.timerCircleContainer}>
        <Text variant="headlineSmall" style={styles.headline}>
          Meditation Timer
        </Text>
        {/* Minus Button */}
        <IconButton
          icon="minus-circle"
          size={50}
          color={theme.colors.primary}
          onPress={() => handleAdjustTime(-1)}
          disabled={isRunning || initialTimerMinutes <= minMinutes}
          style={styles.adjustButtonLeft}
        />

        {/* SVG Circular Progress Bar */}
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <Circle
            stroke={theme.colors.onSurfaceVariant} // Color for the background circle
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <Circle
            stroke={theme.colors.primary} // Color for the progress
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from top (12 o'clock)
          />
        </Svg>

        {/* Timer Text */}
        <Text variant="displayMedium" style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>

        {/* Plus Button */}
        <IconButton
          icon="plus-circle"
          size={50}
          color={theme.colors.primary}
          onPress={() => handleAdjustTime(1)}
          disabled={isRunning || initialTimerMinutes >= maxMinutes}
          style={styles.adjustButtonRight}
        />
      </View>

      {/* Start/Stop Button */}
      <Button
        mode="contained"
        onPress={handleStartStop}
        style={styles.startButton}
        labelStyle={styles.startButtonLabel}
        icon={isSoundPlaying ? "refresh" : isRunning ? "stop" : "play"}
      >
        {isSoundPlaying ? "Reset" : isRunning ? "Stop" : "Start"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: {
    textAlign: "center",
    marginBottom: 10,
  },
  timerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 20,
  },
  timerCircleContainer: {
    position: "relative", // Allows absolute positioning of children
    width: 250, // Matches Svg size
    height: 250, // Matches Svg size
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    position: "absolute", // Position text over the SVG circle
    top: "55%",
    left: "50%",
    transform: [{ translateX: -70 }, { translateY: -25 }], // Adjust based on text size to center
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  adjustButtonLeft: {
    position: "absolute",
    top: 100,
    left: -80, // Position to the left of the circle
    zIndex: 1, // Ensure button is clickable above SVG
  },
  adjustButtonRight: {
    position: "absolute",
    top: 100,
    right: -80, // Position to the right of the circle
    zIndex: 1,
  },
  startButton: {
    marginTop: 20,
    minWidth: 150,
    paddingVertical: 8,
  },
  startButtonLabel: {
    fontSize: 18,
  },
});
