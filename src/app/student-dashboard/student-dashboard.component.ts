import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsQR from 'jsqr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  attendanceMessage: string | null = null;
  errorMessage: string | null = null;

  devices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | null = null;
  isCameraActive: boolean = false;

  @ViewChild('videoElement') videoElement: ElementRef | null = null;
  @ViewChild('canvasElement') canvasElement: ElementRef | null = null;

  videoStream: MediaStream | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.devices = devices.filter((device) => device.kind === 'videoinput');
      if (this.devices.length > 0) {
        this.selectedDevice = this.devices[0];
      }
    });
  }

  startCamera(): void {
    if (this.selectedDevice) {
      this.isCameraActive = true;
      this.startVideoStream(this.selectedDevice);
    } else {
      this.errorMessage = 'No camera selected!';
    }
  }

  startVideoStream(device: MediaDeviceInfo): void {
    const constraints = {
      video: {
        deviceId: { exact: device.deviceId },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.videoStream = stream;
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      })
      .catch((err) => {
        this.errorMessage = `Error accessing camera: ${err.message}`;
      });
  }

  stopVideoStream(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
      this.isCameraActive = false;
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }

  captureImage(): void {
    if (this.videoElement && this.canvasElement && this.videoElement.nativeElement.readyState === 4) {
      const video = this.videoElement.nativeElement as HTMLVideoElement;
      const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          this.processScannedData(qrCode.data);
        } else {
          this.errorMessage = 'No QR code found in the captured image!';
        }
      }
    } else {
      this.errorMessage = 'Camera not ready to capture an image!';
    }
  }
  onDeviceSelectChange(event: Event): void {
    const selectedDeviceId = (event.target as HTMLSelectElement).value;
    this.selectedDevice = this.devices.find((device) => device.deviceId === selectedDeviceId) || null;
  
    if (this.selectedDevice) {
      this.startVideoStream(this.selectedDevice);
    } else {
      this.errorMessage = 'No camera selected!';
    }
  }
  
  processScannedData(scannedData: string): void { 
    if (!scannedData) {
      this.errorMessage = 'Invalid QR Code!';
      return;
    }
  
    console.log('Scanned Data:', scannedData);

    const urlParams = new URLSearchParams(scannedData.split('?')[1]);
    const sessionId = urlParams.get('sessionId');
    const teacherId = urlParams.get('teacherId');

    if (!sessionId || !teacherId) {
      this.errorMessage = 'Invalid QR Code data!';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found. Please log in again.';
      return;
    }

    // Decode JWT Token to extract rollNumber & batch
    const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
    console.log('Decoded Token:', decodedToken);

    let studentRollNo = decodedToken.rollNumber;
    let batch = decodedToken.batch;  // Extract batch from token

    console.log('Extracted Student Roll Number:', studentRollNo);
    console.log('Extracted Batch:', batch);

    if (!studentRollNo || studentRollNo === 'null') {
      this.errorMessage = 'Failed to fetch student roll number. Please log in again.';
      return;
    }

    if (!batch || batch === 'null') {
      this.errorMessage = 'Failed to fetch batch number. Please log in again.';
      return;
    }

    this.http
      .post<any>(
        `${environment.backendBaseUrl}/attendance/mark?sessionId=${sessionId}&teacherId=${teacherId}&studentRollNo=${studentRollNo}&batch=${batch}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe(
        (response) => {
          this.attendanceMessage = response.message || 'Attendance marked successfully!';
          this.errorMessage = null;
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Failed to mark attendance';
          this.attendanceMessage = null;
        }
      );
}

}