import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { object, string } from "zod";

export const socialMediaText = async (text: string, model: BaseChatModel) => {
  const outputSchema = object({
    shortSocialPostText: string(),
  });

  const modelWithStructure = model.withStructuredOutput(outputSchema);
  const structuredOutput = await modelWithStructure.invoke(`
 You are an assistant that takes a text and generate a post for social media (keep it short)
 
 text:
 ${text}
 `);

  return structuredOutput.shortSocialPostText;
};
