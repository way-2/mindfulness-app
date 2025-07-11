import { useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { StyleSheet, Vibration, View } from "react-native";
import BackgroundService from "react-native-background-actions";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import { addMoodJournalEntry } from "../utils/Database";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const audioSource = require("../../assets/sounds/zapsplat_multimedia_alert_ping_chine_ring.mp3");

export default function CountdownTimer() {
  const theme = useTheme();
  const player = useAudioPlayer(audioSource);

  const defaultMinutes = 5;
  const maxMinutes = 60;
  const minMinutes = 1;

  const [initialTimerMinutes, setInitialTimerMinutes] = useState(defaultMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // Reset timeLeft when initialTimerMinutes changes and timer is not running
  useEffect(() => {
    if (!isRunning && !isSoundPlaying) {
      setTimeLeft(initialTimerMinutes * 60);
    }
  }, [initialTimerMinutes, isRunning, isSoundPlaying]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      setIsSoundPlaying(false);
      player.pause();
      player.seekTo(0);
    };
  }, [player]);

  // Background timer task
  const backgroundTask = async ({ seconds }: { seconds: number }) => {
    let remaining = seconds;
    while (BackgroundService.isRunning() && remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      remaining--;
      setTimeLeft(remaining);
    }
    if (remaining === 0) {
      setIsRunning(false);
      Vibration.vibrate([500, 500, 500], true);
      player.seekTo(0);
      player.loop = true;
      player.play();
      setIsSoundPlaying(true);
      addMoodJournalEntry(
        "Meditation",
        `Completed a meditation session of ${initialTimerMinutes} minutes`
      );
    }
    await BackgroundService.stop();
  };

  // Start/Stop/Reset logic
  const handleStartStop = async () => {
    if (isRunning) {
      await BackgroundService.stop();
      setIsRunning(false);
      player.pause();
      player.seekTo(0);
      Vibration.cancel();
      setIsSoundPlaying(false);
      setInitialTimerMinutes(defaultMinutes);
      setTimeLeft(defaultMinutes * 60);
      
    } else {
      setIsRunning(true);
      setIsSoundPlaying(false);
      setTimeLeft(initialTimerMinutes * 60);
      await BackgroundService.start(backgroundTask, {
        taskName: "Meditation Timer",
        taskTitle: "Meditation Timer",
        taskDesc: `Time left: ${formatTime(initialTimerMinutes * 60)}`,
        parameters: { seconds: initialTimerMinutes * 60 },
        taskIcon: { name: "ic_launcher", type: "mipmap" },
        foregroundServiceType: "specialUse", // For Android 14+
      } as any);
    }
  };

  const handleReset = async () => {
    await BackgroundService.stop();
    setIsRunning(false);
    player.pause();
    player.seekTo(0);
    Vibration.cancel();
    setIsSoundPlaying(false);
    setInitialTimerMinutes(defaultMinutes);
    setTimeLeft(defaultMinutes * 60);
  };

  const handleAdjustTime = (amount: number) => {
    if (!isRunning && !isSoundPlaying) {
      setInitialTimerMinutes((prev) => {
        const newMinutes = prev + amount;
        if (newMinutes < minMinutes) return minMinutes;
        if (newMinutes > maxMinutes) return maxMinutes;
        return newMinutes;
      });
    }
  };

  // Circular Progress Bar Calculations
  const size = 250;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = (timeLeft / (initialTimerMinutes * 60)) * 100;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <View style={styles.timerSection}>
      <View style={styles.timerCircleContainer}>
        <Text variant="headlineSmall" style={styles.headline}>
          Meditation Timer
        </Text>
        <IconButton
          icon="minus-circle"
          size={50}
          color={theme.colors.primary}
          onPress={() => handleAdjustTime(-1)}
          disabled={isRunning || initialTimerMinutes <= minMinutes}
          style={styles.adjustButtonLeft}
        />
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            stroke={theme.colors.onSurfaceVariant}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={theme.colors.primary}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text variant="displayMedium" style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>
        <IconButton
          icon="plus-circle"
          size={50}
          color={theme.colors.primary}
          onPress={() => handleAdjustTime(1)}
          disabled={isRunning || initialTimerMinutes >= maxMinutes}
          style={styles.adjustButtonRight}
        />
      </View>
      <Button
        mode="contained"
        onPress={isSoundPlaying ? handleReset : handleStartStop}
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
    marginBottom: 15,
  },
  timerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerCircleContainer: {
    position: "relative",
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    position: "absolute",
    top: "55%",
    left: "50%",
    transform: [{ translateX: -70 }, { translateY: -25 }],
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  adjustButtonLeft: {
    position: "absolute",
    top: 100,
    left: -80,
    zIndex: 1,
  },
  adjustButtonRight: {
    position: "absolute",
    top: 100,
    right: -80,
    zIndex: 1,
  },
  startButton: {
    marginTop: 20,
    minWidth: 150,
    paddingVertical: 8,
  },
  startButtonLabel: {
    fontSize: 18,
  }
});