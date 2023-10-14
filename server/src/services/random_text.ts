
export interface TextGeneratorContract {
  random: () => string 
}

export default class TextGenerator implements TextGeneratorContract {
  // I need a way to update this randomly with cool sentences every day or so
  private sentences: string[] = [
    "The sunblock was handed to the girl before practice, but the burned skin was proof she did not apply it. He swore he just saw his sushi move. The opportunity of a lifetime passed before him as he tried to decide between a cone or a cup. Nobody questions who built the pyramids in Mexico. Excitement replaced fear until the final moment."
  ]

  public random() {
    const randomizer = Math.floor(Math.random() * this.sentences.length) 

    return this.sentences[randomizer]
  }
}