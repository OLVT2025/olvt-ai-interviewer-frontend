// src/utils/recordingService.js
import { toast } from "sonner";

class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.interviewId = null;
    this.isInitialized = false; // Add this flag
  }

  async initialize(interviewId) {
    this.interviewId = interviewId;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing recording service:", error);
      toast.error("Failed to initialize recording. Please check your permissions.");
      this.isInitialized = false;
      return false;
    }
  }

    startRecording() {
        if (!this.isInitialized || !this.mediaRecorder) {
        throw new Error("Stream not initialized. Please initialize before recording.");
        }
        
        try {
        this.recordedChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        console.log("Recording started");
        return true;
        } catch (error) {
        console.error("Failed to start recording:", error);
        throw error;
        }
    }

  async stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) {
      console.error("No active recording to stop");
      return false;
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(this.recordedChunks, { type: "video/webm" });
        const fileName = `interview-${this.interviewId}-${new Date().toISOString()}.webm`;
        const file = new File([videoBlob], fileName, { type: "video/webm" });
        
        const uploadSuccess = await this.uploadToGoogleDrive(file);
        this.isRecording = false;
        
        // Release media resources
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(uploadSuccess);
      };
      
      this.mediaRecorder.stop();
    });
  }


async uploadToGoogleDrive(file) {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result.split(',')[1];
            
            // Add upload progress indicator
            toast.loading('Uploading recording...');
            
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                file: base64Data, 
                fileName: file.name,
                interviewId: this.interviewId
              }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
              toast.dismiss();
              toast.success("Recording uploaded successfully to Google Drive!");
              console.log('Upload response:', data);
              resolve(true);
            } else {
              toast.dismiss();
              toast.error(`Upload failed: ${data.error}`);
              console.error("Upload failed:", data);
              resolve(false);
            }
          } catch (error) {
            toast.dismiss();
            toast.error("An error occurred during upload");
            console.error("Error in upload process:", error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          toast.error("Failed to process recording file");
          reject(new Error("FileReader error"));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload recording");
      return false;
    }
  }

}

// Create a singleton instance
const recordingService = new RecordingService();
export default recordingService;