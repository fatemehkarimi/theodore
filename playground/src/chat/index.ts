type ResponseChat = {
  response: string;
};

const getChatResponse = async (messages: string[]): Promise<string | null> => {
  const endpoint = '/api/chat';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((msg) => ({ text: msg })),
      }),
    });

    const data: ResponseChat = await response.json();
    return data.response;
  } catch (error) {
    console.error('error = ', error);
    return null;
  }
};

export { getChatResponse };
