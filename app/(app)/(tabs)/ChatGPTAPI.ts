export class ChatGPTAPI {
    static async sendMessage(message: string): Promise<string> {
      try {
        
        
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "
          },
          body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{"role":"system","content":"you are an auto message creator for creating message based on what user wants to send and give assistance to user but within limits and be appropriate while giving suggestions and completitions "},{ "role": "user", "content": message }],
            "temperature": 0.7
          })
        });
  
        if (!response.ok) {
          throw new Error("Failed to send message to ChatGPT API");
        }
  
        const result = await response.json();
        console.log("RESULT: ", result);
  
        if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
          throw new Error("Invalid response format from ChatGPT API");
        }
  
        const content = result.choices[0].message.content;
        console.log("Content: ", content);
        return content;
      } catch (error) {
        console.error("Error sending message to ChatGPT API:", error);
        throw error;
      }
    }
  }
  