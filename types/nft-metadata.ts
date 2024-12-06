export interface Creator {
  address: string;
  share: number;
  verified?: boolean;
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface File {
  uri: string;
  type: string;
}

export interface Collection {
  name: string;
  family?: string;
}

export interface Properties {
  files: File[];
  category: string;
  creators: Creator[];
}

// Following MPL-Core standard for NFT metadata
export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: Attribute[];
  properties: Properties;
  collection: Collection;
}

export interface CollectionMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  seller_fee_basis_points: number;
  attributes?: Attribute[];
  properties: Properties;
}

export interface TraitConfig {
  name: string;
  values: string[];
  weights?: number[]; // Optional probability weights for each value
}

export interface CollectionConfig {
  name: string;
  symbol: string;
  description: string;
  size: number;
  sellerFeeBasisPoints: number;
  creators: Creator[];
  traits: TraitConfig[];
}
