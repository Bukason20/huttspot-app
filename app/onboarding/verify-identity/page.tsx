"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import { BackButton } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";

type ScanStep = "intro" | "scanning" | "complete";
type VerificationStep = "center" | "move" | "blink" | "done";

const steps = [
  {
    number: 1,
    key: "center" as VerificationStep,
    title: "Center Your Face",
    description:
      "Position your face within the frame so we can see you clearly.",
  },
  {
    number: 2,
    key: "move" as VerificationStep,
    title: "Move Head Slowly",
    description:
      "Turn your head gently from side to side to confirm it's really you.",
  },
  {
    number: 3,
    key: "blink" as VerificationStep,
    title: "Blink Eyes",
    description: "Blink naturally to complete the identity check.",
  },
  {
    number: 4,
    key: "done" as VerificationStep,
    title: "Scan Complete",
    description: "Verification successful. You're all set to continue.",
  },
];

// Landmarks
const NOSE_TIP = 1;
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;
const LEFT_EYE_LEFT = 33;
const LEFT_EYE_RIGHT = 133;
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 263;

function getEAR(
  landmarks: any[],
  topIdx: number,
  bottomIdx: number,
  leftIdx: number,
  rightIdx: number,
) {
  const top = landmarks[topIdx];
  const bottom = landmarks[bottomIdx];
  const left = landmarks[leftIdx];
  const right = landmarks[rightIdx];

  const vertical = Math.abs(top.y - bottom.y);
  const horizontal = Math.abs(left.x - right.x);

  return horizontal > 0 ? vertical / horizontal : 0;
}

function StepCard({
  step,
  isDone,
  isActive,
}: {
  step: (typeof steps)[0];
  isDone: boolean;
  isActive: boolean;
}) {
  return (
    <div
      className={`flex items-stretch rounded-xl overflow-hidden transition-all duration-500 ${
        isDone
          ? "bg-green-100"
          : isActive
            ? "bg-orange-50"
            : "bg-gray-50 opacity-50"
      }`}
    >
      <div
        className={`w-1.5 flex-shrink-0 rounded-l-xl ${
          isDone ? "bg-green-400" : isActive ? "bg-primary" : "bg-gray-300"
        }`}
      />
      <div className="px-4 py-3 flex items-center justify-between w-full">
        <div>
          <p className="text-xs text-gray-400 font-semibold mb-0.5">
            {step.number}
          </p>
          <p className="text-sm font-bold text-[#1a1a1a]">{step.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {step.description}
          </p>
        </div>
        {isDone && (
          <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 ml-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function FaceFrame({
  captured,
  capturedImageUrl,
}: {
  captured: boolean;
  capturedImageUrl?: string;
}) {
  return (
    <div className="flex justify-center my-8">
      <div className="relative w-56 h-56">
        <div
          className={`absolute inset-0 rounded-full border-[3px] ${
            captured ? "border-secondary" : "border-primary"
          }`}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke={captured ? "#2d6a4f" : "#e8622a"}
            strokeWidth="2"
            fill="transparent"
            strokeDasharray="8 5"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
          {captured && capturedImageUrl ? (
            <img
              src={capturedImageUrl}
              alt="captured face"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { setFormData } = useOnboarding();

  const [scanStep, setScanStep] = useState<ScanStep>("intro");
  const [currentVerifStep, setCurrentVerifStep] =
    useState<VerificationStep>("center");
  const [completedSteps, setCompletedSteps] = useState<VerificationStep[]>([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState("");
  const [hint, setHint] = useState("Position your face in the circle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const stepStartTimeRef = useRef<number>(Date.now());
  const blinkStartRef = useRef<number | null>(null);
  const faceDetectedRef = useRef(0);

  const noseMinRef = useRef(1);
  const noseMaxRef = useRef(0);
  const blinkCountRef = useRef(0);
  const wasBlinkingRef = useRef(false);

  const currentVerifStepRef = useRef<VerificationStep>("center");
  const completedStepsRef = useRef<VerificationStep[]>([]);

  useEffect(() => {
    currentVerifStepRef.current = currentVerifStep;
  }, [currentVerifStep]);

  const completeStep = useCallback((step, next) => {
    completedStepsRef.current = [...completedStepsRef.current, step];
    setCompletedSteps([...completedStepsRef.current]);

    if (next === "done") {
      currentVerifStepRef.current = "done";
      setCurrentVerifStep("done");

      setTimeout(() => {
        const capturedFile = captureFaceImage();
        if (capturedFile) {
          setFormData({ capturedFaceImage: capturedFile });
        }
        stopCamera();
        setScanStep("complete");
      }, 600);
    } else {
      currentVerifStepRef.current = next;
      setCurrentVerifStep(next);
      stepStartTimeRef.current = Date.now();
    }
  }, []);

  const processLandmarks = useCallback(
    (landmarks: any[]) => {
      const step = currentVerifStepRef.current;
      const noseX = landmarks[NOSE_TIP].x;
      const duration = Date.now() - stepStartTimeRef.current;

      if (step === "center") {
        const isCentered = noseX > 0.35 && noseX < 0.65;

        if (isCentered && duration > 1500) {
          noseMinRef.current = noseX;
          noseMaxRef.current = noseX;
          setHint("Great! Now slowly turn your head side to side");
          completeStep("center", "move");
        } else {
          setHint("Center your face in the circle");
        }
      } else if (step === "move") {
        if (noseX < noseMinRef.current) noseMinRef.current = noseX;
        if (noseX > noseMaxRef.current) noseMaxRef.current = noseX;

        const range = noseMaxRef.current - noseMinRef.current;
        const progress = Math.min(Math.round((range / 0.25) * 100), 100);

        setHint(`Turn head side to side... ${progress}%`);

        if (range >= 0.25 && duration > 2000) {
          setHint("Great! Now blink your eyes naturally");
          completeStep("move", "blink");
        }
      } else if (step === "blink") {
        const leftEAR = getEAR(
          landmarks,
          LEFT_EYE_TOP,
          LEFT_EYE_BOTTOM,
          LEFT_EYE_LEFT,
          LEFT_EYE_RIGHT,
        );
        const rightEAR = getEAR(
          landmarks,
          RIGHT_EYE_TOP,
          RIGHT_EYE_BOTTOM,
          RIGHT_EYE_LEFT,
          RIGHT_EYE_RIGHT,
        );

        const avgEAR = (leftEAR + rightEAR) / 2;
        const isBlinking = avgEAR < 0.18;

        if (isBlinking) {
          if (!blinkStartRef.current) {
            blinkStartRef.current = Date.now();
          }
        } else {
          if (blinkStartRef.current) {
            const blinkDuration = Date.now() - blinkStartRef.current;

            if (blinkDuration > 150) {
              blinkCountRef.current += 1;
              setHint(`Blink detected! ${blinkCountRef.current}/2`);
            }

            blinkStartRef.current = null;
          }
        }

        if (blinkCountRef.current >= 2) {
          setHint("Perfect! Scan complete");
          completeStep("blink", "done");
        }
      }
    },
    [completeStep],
  );

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    await loadFaceMesh();
  };

  const loadFaceMesh = () => {
    return new Promise<void>((resolve) => {
      if ((window as any).FaceMesh) {
        initFaceMesh();
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      script.onload = () => {
        initFaceMesh();
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  const initFaceMesh = () => {
    const faceMesh = new (window as any).FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
    });

    faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks?.length > 0) {
        faceDetectedRef.current++;

        if (faceDetectedRef.current > 5) {
          setFaceDetected(true);
          processLandmarks(results.multiFaceLandmarks[0]);
        }
      } else {
        faceDetectedRef.current = 0;
        setFaceDetected(false);
      }
    });

    faceMeshRef.current = faceMesh;
    runDetectionLoop();
  };

  const runDetectionLoop = () => {
    const detect = async () => {
      if (
        videoRef.current &&
        faceMeshRef.current &&
        currentVerifStepRef.current !== "done"
      ) {
        await faceMeshRef.current.send({ image: videoRef.current });
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };
    detect();
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const captureFaceImage = (): File | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const imageUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImageUrl(imageUrl);

    return new File([dataURLtoBlob(imageUrl)], "face.jpg");
  };

  function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  const handleStartScan = async () => {
    setScanStep("scanning");
    stepStartTimeRef.current = Date.now();
    blinkCountRef.current = 0;
    noseMinRef.current = 1;
    noseMaxRef.current = 0;
    await startCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ── Compute active step index for StepCard ────────────────────
  const getStepStatus = (stepKey: VerificationStep) => {
    const isDone = completedSteps.includes(stepKey);
    const isActive = currentVerifStep === stepKey;
    return { isDone, isActive };
  };

  // ── INTRO ─────────────────────────────────────────────────────
  if (scanStep === "intro") {
    return (
      <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
        <BackButton />
        <h1 className="text-2xl font-bold text-center">Verify Your Identity</h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          A quick facial scan helps keep Huttspot safe and authentic.
        </p>
        <FaceFrame captured={false} />
        <div className="mt-auto flex flex-col gap-4 pb-12">
          <div className="flex items-center justify-center gap-2 text-primary text-sm">
            <Lock size={15} />
            <span>Your data is encrypted and never shared.</span>
          </div>
          <button
            onClick={handleStartScan}
            className="w-full bg-secondary text-white rounded-full py-4 text-[15px] font-semibold cursor-pointer"
          >
            Start Scan
          </button>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────
  if (scanStep === "scanning") {
    return (
      <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
        <h1 className="text-2xl font-bold text-center">Verify Your Identity</h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          Follow the steps below carefully.
        </p>

        {/* Camera feed */}
        <div className="flex justify-center my-6">
          <div className="relative w-56 h-56">
            <svg
              className="absolute inset-0 w-full h-full animate-spin"
              viewBox="0 0 100 100"
              style={{ animationDuration: "3s" }}
            >
              <circle
                cx="50"
                cy="50"
                r="47"
                stroke={faceDetected ? "#2d6a4f" : "#e8622a"}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="28 20"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>

            <div className="absolute inset-3 rounded-full overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                muted
                playsInline
              />
            </div>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-sm font-medium text-secondary mb-4">
          {hint}
        </p>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {steps.map((step) => {
            const { isDone, isActive } = getStepStatus(step.key);
            return (
              <StepCard
                key={step.number}
                step={step}
                isDone={isDone}
                isActive={isActive}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────
  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <h1 className="text-2xl font-bold text-center">Verify Your Identity</h1>
      <p className="text-center text-gray-400 text-sm mt-2">
        Scan complete! Review your photo and submit.
      </p>

      <FaceFrame captured={true} capturedImageUrl={capturedImageUrl} />

      <div className="flex flex-col gap-3 mb-6">
        {steps.map((step) => (
          <StepCard
            key={step.number}
            step={step}
            isDone={true}
            isActive={false}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-4 pb-12">
        <div className="flex items-center justify-center gap-2 text-secondary text-sm">
          <CheckCircle size={15} />
          <span>Identity verified successfully.</span>
        </div>
        <button
          onClick={() => router.push("/onboarding/terms")}
          className="w-full bg-secondary text-white rounded-full py-4 text-[15px] font-semibold cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
