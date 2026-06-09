type ResponseAutoComplete = {
  predict: string;
};

const getAutoComplete = async (
  input: string,
  messages: string[],
  cursor: number,
  signal?: AbortSignal,
): Promise<string | null> => {
  const endpoint = '/api/autocomplete';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((msg) => ({ text: msg })),
        input,
        cursor,
      }),
    });

    const data: ResponseAutoComplete = await response.json();
    return data.predict;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }

    console.error('error = ', error);
    return null;
  }
};

export { getAutoComplete };
