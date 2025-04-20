export async function retryFetch(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response;
    } catch (error: any) {
      if (i < retries - 1) {
        console.warn(`Retrying fetch... (${retries - i - 1} left)`, error);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("All retries failed");
}
