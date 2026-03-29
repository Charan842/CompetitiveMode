/**
 * Predefined subtask templates for quick task creation.
 */

const templates = {
  DSA: [
    {
      title: "Question 1",
      type: "code",
      instructions:
        "Solve one DSA problem in this subtask. Use one subtask per question only.",
      resourceLink: null,
    },
    {
      title: "Question 2",
      type: "code",
      instructions:
        "Solve one DSA problem in this subtask. Add the problem link if you want.",
      resourceLink: null,
    },
    {
      title: "Question 3",
      type: "code",
      instructions:
        "Solve one DSA problem in this subtask. Keep each subtask limited to one question.",
      resourceLink: null,
    },
  ],
  Study: [
    {
      title: "Read the Material",
      type: "text",
      instructions:
        "Summarize the key concepts from the study material in your own words.",
      resourceLink: null,
    },
    {
      title: "Answer the Quiz",
      type: "text",
      instructions:
        "Answer the following questions based on what you studied.",
      resourceLink: null,
    },
    {
      title: "Share a Resource Link",
      type: "link",
      instructions:
        "Share a helpful resource (article, video, etc.) related to the topic.",
      resourceLink: null,
    },
  ],
  Fitness: [
    {
      title: "Complete the Workout",
      type: "file",
      instructions:
        "Upload a photo or screenshot proving you completed the workout (e.g., fitness app screenshot).",
      resourceLink: null,
    },
    {
      title: "Log Your Stats",
      type: "text",
      instructions:
        "Record your workout stats: duration, reps, sets, distance, or any relevant metrics.",
      resourceLink: null,
    },
    {
      title: "Rate Your Effort",
      type: "text",
      instructions:
        "Rate your effort on a scale of 1-10 and explain how the session went.",
      resourceLink: null,
    },
  ],
};

export function getTemplate(category) {
  return templates[category] || null;
}

export function getAllTemplates() {
  return templates;
}
