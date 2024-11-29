"use client";

import {
  ConnectionProvider,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, Suspense } from "react";
import toast, { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message.slice(1, -1));
    },
  }),
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider
      endpoint={
        "https://solana-mainnet.core.chainstack.com/0c8257d8dca48ab362882555bc5b2d40"
      }
    >
      <WalletProvider wallets={[]}>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <Toaster />
            </Suspense>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
