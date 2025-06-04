export function request(ctx) {
  // Define a system prompt to give the model a persona
  const system =
    "You are an expert at responding to questions about AWS Amplify. You should not aim to solve the problem but provide some guidance and ask preliminary questions that help the user answer the question. Provide links that support your response where the URL contians either https://docs.amplify.aws or https://ui.docs.amplify.aws or https://docs.aws.amazon.com/amplify/latest/userguide. Keep the answer strictly under 2000 characters. Focus on strictly answering the question. If the question has #gen2 at the end of it, they are asking about Amplify Gen2 and make no references to Gen1 or Amplify CLI or ask if they are using Amplify CLI or Amplify Studio. Do not share any example code but instead point them to documentation links based on the urls mentioned above.";

  const prompt = ctx.args.prompt;

  // Construct the HTTP request to invoke the generative AI model
  return {
    resourcePath: `/retrieveAndGenerate`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        input: { text: system + "\n" + prompt },
        retrieveAndGenerateConfiguration: {
          knowledgeBaseConfiguration: {
            generationConfiguration: {
              inferenceConfig: {
                textInferenceConfig: {
                  maxTokens: 512,
                  temperature: 0.2,
                  topP: 0.9,
                },
              },
            },
            knowledgeBaseId: "EG6HBSV1IP",
            modelArn: ctx.env.MODEL_ID,
          },
          type: "KNOWLEDGE_BASE",
        },
      },
    },
  };
}

// Parse the response and return the generated haiku
export function response(ctx) {
  const res = JSON.parse(ctx.result.body);
  //   const response = res.content[0].text;

  console.log(res);

  return res.output.text;
  // return {
  // response: res.output.text, // JSON.stringify(res),
  // citations: res.citations.map((citation) => {
  //   return citation.retrievedReferences.flatMap(
  //     (ref) => ref.location.webLocation.url
  //   );
  // }),
  // };
  //   return res.output.message.content[0].text;
}
