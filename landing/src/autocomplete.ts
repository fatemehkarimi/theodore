type AutocompleteResponse = {
  predict: string;
};

export async function getAutoComplete(
  input: string,
  cursor: number,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const response = await fetch('https://api.theodore-js.dev/autocomplete', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [],
        input,
        cursor,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as AutocompleteResponse;
    return data.predict;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;

    console.error('autocomplete request failed', error);
    return null;
  }
}
