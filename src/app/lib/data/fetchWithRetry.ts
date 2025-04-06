async function fetchWithRetry(url: string, options = {}, retries = 3, delay = 1000): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Увеличивающаяся задержка
      }
    }
    throw new Error("Max retries reached");
  }