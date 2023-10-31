export interface TextGeneratorContract {
  random: () => string;
}

export default class TextGenerator implements TextGeneratorContract {
  private texts: string[] = [
    "They rushed out the door, grabbing anything and everything they could think of they might need. There was no time to double-check to make sure they weren't leaving something important behind. Everything was thrown into the car and they sped off. Thirty minutes later they were safe and that was when it dawned on them that they had forgotten the most important thing of all.",
    "He couldn't move. His head throbbed and spun. He couldn't decide if it was the flu or the drinking last night. It was probably a combination of both.",
  ];

  public random() {
    const min = 0;
    const max = this.texts.length - 1;

    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;

    return this.texts[randomIndex]
  }
}