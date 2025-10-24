import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers'
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  BASE_SEPOLIA_CHAIN_ID,
  getTxExplorerLink,
} from '../../../shared/web3/contractConfig'

/**
 * Get the Ethereum provider from MetaMask
 */
export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not installed')
  }
  return new BrowserProvider((window as any).ethereum)
}

/**
 * Get the contract instance
 */
export async function getContract(withSigner = false): Promise<Contract> {
  const provider = await getProvider()
  
  if (withSigner) {
    const signer = await provider.getSigner()
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }
  
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

/**
 * Check if user is connected to Base Sepolia
 */
export async function isCorrectNetwork(): Promise<boolean> {
  const provider = await getProvider()
  const network = await provider.getNetwork()
  return Number(network.chainId) === BASE_SEPOLIA_CHAIN_ID
}

/**
 * Switch to Base Sepolia network
 */
export async function switchToBaseSepolia(): Promise<void> {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('MetaMask not installed')

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
    })
  } catch (error: any) {
    // Chain not added, add it
    if (error.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org'],
          },
        ],
      })
    } else {
      throw error
    }
  }
}

/**
 * Get user's wallet address
 */
export async function getWalletAddress(): Promise<string> {
  const provider = await getProvider()
  const signer = await provider.getSigner()
  return await signer.getAddress()
}

/**
 * Get credits balance for an address
 */
export async function getBlockchainBalance(address: string): Promise<number> {
  console.log('💳 Blockchain: Getting balance for', address)
  const contract = await getContract(false)
  const balance = await contract.balanceOf(address)
  const balanceNumber = Number(formatUnits(balance, 0)) // 0 decimals
  console.log('✅ Blockchain: Balance is', balanceNumber)
  return balanceNumber
}

/**
 * Mint credits to an address (owner only)
 * Returns transaction hash
 */
export async function mintCreditsOnChain(
  toAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number; gasFee: string }> {
  console.log('💳 Blockchain: Minting', amount, 'credits to', toAddress)

  // Check network
  const correctNetwork = await isCorrectNetwork()
  if (!correctNetwork) {
    console.log('⚠️ Blockchain: Wrong network, switching to Base Sepolia...')
    await switchToBaseSepolia()
  }

  const contract = await getContract(true)
  const amountBN = parseUnits(amount.toString(), 0) // 0 decimals

  console.log('📤 Blockchain: Sending mint transaction...')
  const tx = await contract.mint(toAddress, amountBN)
  console.log('✅ Blockchain: Transaction sent:', tx.hash)
  console.log('🔗 Blockchain: View on explorer:', getTxExplorerLink(tx.hash))

  console.log('⏳ Blockchain: Waiting for confirmation...')
  const receipt = await tx.wait()
  console.log('✅ Blockchain: Transaction confirmed in block', receipt.blockNumber)

  // Calculate gas fee
  const gasFee = formatUnits(receipt.gasUsed * receipt.gasPrice, 18)
  console.log('⛽ Blockchain: Gas fee:', gasFee, 'ETH')

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasFee,
  }
}

/**
 * Burn credits from an address (owner only)
 * Returns transaction hash
 */
export async function burnCreditsOnChain(
  fromAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number }> {
  console.log('🔥 Blockchain: Burning', amount, 'credits from', fromAddress)

  const correctNetwork = await isCorrectNetwork()
  if (!correctNetwork) {
    await switchToBaseSepolia()
  }

  const contract = await getContract(true)
  const amountBN = parseUnits(amount.toString(), 0)

  const tx = await contract.burn(fromAddress, amountBN)
  console.log('✅ Blockchain: Burn transaction sent:', tx.hash)

  const receipt = await tx.wait()
  console.log('✅ Blockchain: Burn confirmed in block', receipt.blockNumber)

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  }
}

/**
 * Transfer credits to another address
 * Returns transaction hash
 */
export async function transferCreditsOnChain(
  toAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number }> {
  console.log('💸 Blockchain: Transferring', amount, 'credits to', toAddress)

  const correctNetwork = await isCorrectNetwork()
  if (!correctNetwork) {
    await switchToBaseSepolia()
  }

  const contract = await getContract(true)
  const amountBN = parseUnits(amount.toString(), 0)

  const tx = await contract.transfer(toAddress, amountBN)
  console.log('✅ Blockchain: Transfer transaction sent:', tx.hash)

  const receipt = await tx.wait()
  console.log('✅ Blockchain: Transfer confirmed in block', receipt.blockNumber)

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ethereum
}

/**
 * Request account access from MetaMask
 */
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed. Please install MetaMask to continue.')
  }

  const ethereum = (window as any).ethereum
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.')
  }

  console.log('✅ Blockchain: Connected to wallet:', accounts[0])
  return accounts[0]
}
