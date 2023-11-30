const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
  This class provides methods for the client to send logs to the cloud
*/
export class CloudLoggingService {
  async log(logMessage: string, token: string): Promise<void> {
    // Create HTTP headers
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    try {
      // Send HTTP request
      const response = await fetch(`${apiUrl}/log`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ message: logMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error status ${response.status}`);
      }

      const result = await response.json();
    } catch (error) {
      console.error("Error sending log to cloud", error);
      throw error;
    }
  }
}