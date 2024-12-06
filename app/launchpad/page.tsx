"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CollectionConfig, TraitConfig } from "@/types/nft-metadata";
import { TraitConfigurator } from "@/components/TraitConfigurator";

type Step = 'setup' | 'generate' | 'traits' | 'preview';

export default function LaunchpadPage() {
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig>({
    name: '',
    symbol: '',
    description: '',
    size: 1,
    sellerFeeBasisPoints: 500, // 5%
    creators: [],
    traits: []
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setCollectionConfig(prev => ({
      ...prev,
      name: formData.get('name') as string,
      symbol: formData.get('symbol') as string,
      description: formData.get('description') as string,
      size: parseInt(formData.get('size') as string) || 1,
    }));

    setCurrentStep('generate');
  };

  const handleImageGeneration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const prompt = formData.get('prompt') as string;

    try {
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(collectionConfig.size / BATCH_SIZE);
      const allImages: string[] = [];

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchCount = Math.min(BATCH_SIZE, collectionConfig.size - batch * BATCH_SIZE);
        
        const response = await fetch("/api/generateImages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, count: batchCount }),
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to generate images');
        }

        const batchImages = Array.isArray(data) ? data.map(d => d.url) : [data.url];
        allImages.push(...batchImages);
        
        const currentProgress = Math.min(100, ((batch + 1) * BATCH_SIZE * 100) / collectionConfig.size);
        setProgress(currentProgress);
        setGeneratedImages([...allImages]);
      }

      setCurrentStep('traits');
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const handleTraitsUpdate = (traits: TraitConfig[]) => {
    setCollectionConfig(prev => ({ ...prev, traits }));
  };

  const handleGenerateCollection = async () => {
    try {
      const response = await fetch('/api/generateCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...collectionConfig,
          images: generatedImages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate collection');
      }

      // Trigger download of the zip file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionConfig.name.toLowerCase().replace(/\s+/g, '-')}-collection.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating collection:', error);
      alert('Failed to generate collection. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="vs-container p-6">
            <h2 className="text-2xl font-bold mb-6">Collection Setup</h2>
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Collection Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="vs-input w-full"
                  placeholder="My Awesome NFTs"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  required
                  className="vs-input w-full"
                  placeholder="AWSM"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  className="vs-input w-full h-24 resize-none"
                  placeholder="Describe your collection..."
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Collection Size</label>
                <input
                  type="number"
                  name="size"
                  required
                  min="1"
                  max="10000"
                  defaultValue="1"
                  className="vs-input w-full"
                />
              </div>
              <button type="submit" className="vs-button">
                Next: Generate Images
              </button>
            </form>
          </div>
        );

      case 'generate':
        return (
          <div className="vs-container p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Image Generation</h2>
              <button 
                onClick={() => setCurrentStep('setup')}
                className="vs-button"
              >
                ← Back to Setup
              </button>
            </div>
            
            <form onSubmit={handleImageGeneration} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Image Prompt</label>
                <textarea
                  name="prompt"
                  required
                  className="vs-input w-full h-24 resize-none"
                  placeholder="Describe how your NFTs should look..."
                  defaultValue="pixel art character"
                />
              </div>
              <button 
                type="submit" 
                disabled={isGenerating}
                className="vs-button"
              >
                {isGenerating ? `Generating (${progress.toFixed(1)}%)` : 'Generate Images'}
              </button>
            </form>

            {isGenerating && progress > 0 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-green-500 rounded transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Generated {generatedImages.length} of {collectionConfig.size} images
                </p>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {generatedImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      className="w-full rounded"
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentStep('traits')}
                  className="vs-button mt-6"
                >
                  Next: Configure Traits
                </button>
              </div>
            )}
          </div>
        );

      case 'traits':
        return (
          <div className="vs-container p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Configure Traits</h2>
              <button 
                onClick={() => setCurrentStep('generate')}
                className="vs-button"
              >
                ← Back to Images
              </button>
            </div>
            
            <TraitConfigurator onTraitsUpdate={handleTraitsUpdate} />
            
            {collectionConfig.traits.length > 0 && (
              <button 
                onClick={() => setCurrentStep('preview')}
                className="vs-button mt-6"
              >
                Next: Preview & Download
              </button>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="vs-container p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Preview & Download</h2>
              <button 
                onClick={() => setCurrentStep('traits')}
                className="vs-button"
              >
                ← Back to Traits
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 border border-white/10 rounded-lg">
                <h3 className="font-semibold mb-2">Collection Details</h3>
                <p><span className="text-gray-400">Name:</span> {collectionConfig.name}</p>
                <p><span className="text-gray-400">Symbol:</span> {collectionConfig.symbol}</p>
                <p><span className="text-gray-400">Size:</span> {collectionConfig.size} NFTs</p>
                <p><span className="text-gray-400">Traits:</span> {collectionConfig.traits.length} configured</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {generatedImages.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview image ${index + 1}`}
                    className="w-full rounded"
                  />
                ))}
              </div>

              <button 
                onClick={handleGenerateCollection}
                className="vs-button"
              >
                Download Collection
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-5">
        <header className="flex items-center justify-between border-b border-white/10 py-2">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-normal text-white">
              NFT Collection Launchpad
            </h1>
            <Navigation />
          </div>
          <WalletMultiButton className="vs-button" />
        </header>

        <main className="mt-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <div className={`h-2 w-2 rounded-full ${currentStep === 'setup' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'generate' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'traits' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'preview' ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
              <span className="text-sm text-gray-400">
                Step {
                  currentStep === 'setup' ? '1/4' :
                  currentStep === 'generate' ? '2/4' :
                  currentStep === 'traits' ? '3/4' : '4/4'
                }
              </span>
            </div>
          </div>

          {renderStep()}
        </main>
      </div>
    </div>
  );
}
