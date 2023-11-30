const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class CloudLoggingService {

  // Create Google Cloud Log
  async sendLogToBackend(logMessage: string, token: string): Promise<void> {
    const response = await fetch(`${apiUrl}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: logMessage }),
    });

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    const result = await response.json();

    console.log("Result: " + result);
  }
}
