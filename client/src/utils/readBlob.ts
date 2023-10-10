

export const readBlob = (blob: Blob, callback: (result: ArrayBuffer | string | null) => void) => {
  const reader = new FileReader();
  reader.readAsText(blob);
  reader.onloadend = () => {
    callback(reader.result)
  }
}