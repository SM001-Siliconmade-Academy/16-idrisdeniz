import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import React, { useRef } from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import questions from "./questions.json";
import { Dimensions } from "react-native";

export default function App() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [bounds, setBounds] = useState({
    origin: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
  });
  const [rollAngle, setRollAngle] = useState(0);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const answers = ["EVET", "HAYIR"];

  const answerTimeout = useRef(null);

  function handleFacesDetected({ faces }) {
    if (faces.length === 0) {
      return;
    }
    const face = faces[0];
    const { bounds, rollAngle } = face;
    setBounds(bounds);
    setRollAngle(rollAngle);
    if (rollAngle > 20 && rollAngle < 28 && !showResult) {
      handleAnswer("NO");
    } else if (rollAngle > 328 && rollAngle < 345 && !showResult) {
      handleAnswer("YES");
    }
  }

  function handleAnswer(answer) {
    if (answerTimeout.current) {
      return;
    }
    if (answer === "YES") {
      setYesCount(yesCount + 1);
    } else {
      setNoCount(noCount + 1);
    }

    if (questionIndex === questions.length - 1) {
      setShowResult(true);
    } else {
      setQuestionIndex(questionIndex + 1);
    }

    answerTimeout.current = setTimeout(() => {
      answerTimeout.current = null;
    }, 2000);
  }
  if (!permission) {
    requestPermission();
    return <View />;
  }
  if (!permission.granted) {
    return <View />;
  }
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View
          style={[
            styles.faceBorder,
            {
              left: bounds.origin.x - 85,
              top: bounds.origin.y - 130,
              transform: [
                { rotateX: `${0}deg` },
                { rotateY: `${0}deg` },
                { rotateZ: `${rollAngle}deg` },
              ],
            },
          ]}
        >
          <Text style={styles.question}>
            {showResult
              ? yesCount > noCount
                ? "İDEAL İLİŞKİ"
                : "TOKSİK İLİŞKİ"
              : questions[questionIndex]}
          </Text>
          <View style={styles.answers_container}>
            {
              <>
                <Text style={[styles.answer_common, styles.answer_yes]}>
                  {answers[0]}
                </Text>
                <Text style={[styles.answer_common, styles.answer_no]}>
                  {answers[1]}
                </Text>
              </>
            }
          </View>
        </View>
      </Camera>
    </View>
  );
}

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  camera: {
    width: width,
    height: height,
  },
  faceBorder: {
    position: "absolute",
    alignItems: "center",
    borderColor: "transparent",
    padding: 30,
    rowGap: 5,
  },
  question: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    borderWidth: 6,
    borderRadius: 15,
    borderColor: "transparent",
    padding: 10,
    backgroundColor: "dodgerblue",
  },
  answers_container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  answer_common: {
    fontSize: 20,
    color: "white",
    width: 100,
    borderRadius: 50,
    textAlign: "center",
    padding: 6,
    fontWeight: "bold",
  },
  answer_yes: {
    backgroundColor: "green",
  },
  answer_no: {
    backgroundColor: "red",
  },
});
