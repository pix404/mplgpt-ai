import { NextResponse } from 'next/server';
import { NFTMetadata, CollectionConfig, TraitConfig } from '@/types/nft-metadata';
import JSZip from 'jszip';

function generateRandomTraits(traitConfigs: TraitConfig[]): Record<string, string> {
  const traits: Record<string, string> = {};
  
  traitConfigs.forEach(trait => {
    if (trait.weights) {
      // Use weighted random selection
      const totalWeight = trait.weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < trait.values.length; i++) {
        random -= trait.weights[i];
        if (random <= 0) {
          traits[trait.name] = trait.values[i];
          break;
        }
      }
    } else {
      // Use uniform random selection
      const randomIndex = Math.floor(Math.random() * trait.values.length);
      traits[trait.name] = trait.values[randomIndex];
    }
  });
  
  return traits;
}

export async function POST(req: Request) {
  try {
    const config: CollectionConfig = await req.json();
    const zip = new JSZip();
    
    // Create assets and metadata folders
    const assetsFolder = zip.folder('assets');
    const metadataFolder = zip.folder('metadata');
    
    if (!assetsFolder || !metadataFolder) {
      throw new Error('Failed to create zip folders');
    }

    // Generate metadata for each NFT
    for (let i = 0; i < config.size; i++) {
      const traits = generateRandomTraits(config.traits);
      
      const metadata: NFTMetadata = {
        name: `${config.name} #${i + 1}`,
        symbol: config.symbol,
        description: config.description,
        seller_fee_basis_points: config.sellerFeeBasisPoints,
        image: `${i}.png`, // Reference to the image file
        attributes: Object.entries(traits).map(([trait_type, value]) => ({
          trait_type,
          value
        })),
        properties: {
          files: [{
            uri: `${i}.png`,
            type: 'image/png'
          }],
          category: 'image',
          creators: config.creators
        },
        collection: {
          name: config.name,
          family: config.symbol
        }
      };

      // Add metadata file to zip
      metadataFolder.file(`${i}.json`, JSON.stringify(metadata, null, 2));
      
      // The actual image files will be added separately through the frontend
    }

    // Generate collection metadata
    const collectionMetadata = {
      name: config.name,
      symbol: config.symbol,
      description: config.description,
      seller_fee_basis_points: config.sellerFeeBasisPoints,
      image: 'collection.png',
      properties: {
        files: [{
          uri: 'collection.png',
          type: 'image/png'
        }],
        category: 'image',
        creators: config.creators
      }
    };

    metadataFolder.file('collection.json', JSON.stringify(collectionMetadata, null, 2));

    // Generate zip file
    const zipContent = await zip.generateAsync({ type: 'blob' });
    
    // Convert Blob to ArrayBuffer for NextResponse
    const arrayBuffer = await zipContent.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${config.name.toLowerCase().replace(/\s+/g, '-')}-collection.zip"`
      }
    });
  } catch (error) {
    console.error('Error generating collection:', error);
    return NextResponse.json(
      { error: 'Failed to generate collection' },
      { status: 500 }
    );
  }
}
