async function runRecap(imageFile, subtitleText) {
  try {
    // 1️⃣ Load the Prompt API (multimodal)
    const promptSession = await PromptAPI.create({
      inputs: [
        { type: "text", role: "system", content: "You are an anime summarization assistant." },
        imageFile
          ? { type: "image", role: "user", content: imageFile }
          : null,
        { type: "text", role: "user", content: subtitleText || "No subtitles provided." }
      ].filter(Boolean),
      outputs: [{ type: "json", schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          characters: { type: "array", items: { type: "string" } }
        },
        required: ["summary"]
      }}]
    });

    const promptResult = await promptSession.prompt();
    const { title, summary, characters } = promptResult;

    // 2️⃣ Use Summarizer API for longer blocks
    let condensedSummary = summary;
    if (summary && summary.length > 400) {
      condensedSummary = await SummarizerAPI.summarize(summary);
    }

    // 3️⃣ Use Writer API to make a shareable blurb
    const tweet = await WriterAPI.generate(
      `Write a catchy one-line tweet about this episode:\n"${condensedSummary}"`
    );

    return `🎬 ${title || "Episode Recap"}\n\n🧾 ${condensedSummary}\n\n👥 ${characters?.join(", ") || "Unknown"}\n\n💬 Tweet: ${tweet}`;
  } catch (err) {
    console.error(err);
    return null;
  }
}
