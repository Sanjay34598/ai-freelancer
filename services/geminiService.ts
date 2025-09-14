import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface EvaluationResponse {
    score: number;
    feedback: string;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const evaluateSkillTest = async (
    prompt: string, 
    skill: string, 
    submission: string | File
): Promise<EvaluationResponse> => {
    try {
        const evaluationPrompt = `
You are an expert evaluator for a freelancing platform. A candidate for a "${skill}" role was given the following task: "${prompt}".
Analyze their submission based on professionalism, adherence to the prompt, and quality.
Provide a score from 0 to 100 and brief, constructive feedback.
Return ONLY a JSON object with 'score' (number) and 'feedback' (string) keys.
        `;

        const contents = [{ text: evaluationPrompt }];

        if (submission instanceof File) {
            const imagePart = await fileToGenerativePart(submission);
            contents.push(imagePart as any);
        } else {
            contents.push({ text: `\n\nSUBMISSION:\n---\n${submission}` });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING }
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (typeof result.score === 'number' && typeof result.feedback === 'string') {
            return result;
        } else {
            throw new Error("Invalid JSON structure in API response.");
        }

    } catch (error) {
        console.error("Error evaluating skill test:", error);
        throw new Error("Failed to get evaluation from AI. Please try again.");
    }
};

export const generateSkillTestPrompt = async (
    skill: string, 
    level: 'Beginner' | 'Intermediate' | 'Expert'
): Promise<string> => {
    try {
        const prompt = `You are a creative director. Generate a concise and practical skill test prompt for a freelance ${level}-level ${skill}. The task should be something they can realistically complete and submit as either text or a single image. The prompt should be creative and test a core competency of the skill. For example, for a photographer: "Take a photo of a common object from an unusual perspective to make it look interesting." For a copywriter: "Write a catchy 3-sentence email subject line and preview text for a new productivity app." Return ONLY the generated prompt as a single string, without any quotation marks or extra text.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating skill test prompt:", error);
        throw new Error("Failed to generate a skill test prompt. Please try again.");
    }
};