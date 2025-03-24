import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {object, string} from "zod";

export const enhancePrompt = async (prompt: string, model: BaseChatModel) => {
    const outputSchema = object({
        prompt: string(),
        fileName: string().describe('Once image is generated write the filename.png name'),
    });

    const modelWithStructure = model.withStructuredOutput(outputSchema);
    const structuredOutput = await modelWithStructure.invoke(`
 You are an assistant that takes a text and generate a prompt for dall-e image.
 Most of the time the text won't make something reasonable to generate picture.
 Description should be maximum 100 characters.
 So you need to:
 - Figure out a character out of it
 - Add styling that you think will match
 
 text:
 ${prompt}
 `);

    return structuredOutput;
}