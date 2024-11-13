export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: {
    prompt: string;
    model: string;
    timestamp: string;
    index: number;
  }[];
};
