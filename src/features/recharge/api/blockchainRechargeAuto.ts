import { JsonRpcProvider, Wallet, Contract, formatUnits, parseUnits } from 'ethers'
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  getTxExplorerLink,
} from '../../../shared/web3/contractConfig'

// Base Sepolia RPC URL
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

/**
 * Get provider and wallet from environment variables
 * NO MetaMask popup - uses private key directly
 */
function getWalletAndProvider(): { provider: JsonRpcProvider; wallet: Wallet } {
  // Get private key from environment variable
  const privateKey = import.meta.env.VITE_OWNER_PRIVATE_KEY
  
  if (!privateKey) {
    throw new Error('VITE_OWNER_PRIVATE_KEY not found in environment variables')
  }

  // Create provider
  const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC)
  
  // Create wallet from private key
  const wallet = new Wallet(privateKey, provider)
  
  return { provider, wallet }
}

/**
 * Get contract instance with wallet signer
 */
function getContract(): Contract {
  const { wallet } = getWalletAndProvider()
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
}

/**
 * Mint credits to an address (owner only)
 * AUTO-CONFIRMS - No MetaMask popup!
 * Returns transaction hash
 */
export async function mintCreditsOnChainAuto(
  toAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number; gasFee: string }> {
  console.log('🤖 Auto-Mint: Minting', amount, 'credits to', toAddress)
  console.log('🤖 Auto-Mint: Using owner wallet (no MetaMask popup)')

  const contract = getContract()
  const amountBN = parseUnits(amount.toString(), 0) // 0 decimals

  console.log('📤 Auto-Mint: Sending mint transaction...')
  const tx = await contract.mint(toAddress, amountBN)
  console.log('✅ Auto-Mint: Transaction sent:', tx.hash)
  console.log('🔗 Auto-Mint: View on explorer:', getTxExplorerLink(tx.hash))

  console.log('⏳ Auto-Mint: Waiting for confirmation...')
  const receipt = await tx.wait()
  console.log('✅ Auto-Mint: Transaction confirmed in block', receipt.blockNumber)

  // Calculate gas fee
  const gasFee = formatUnits(receipt.gasUsed * receipt.gasPrice, 18)
  console.log('⛽ Auto-Mint: Gas fee:', gasFee, 'ETH')

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasFee,
  }
}

/**
 * Get credits balance for an address
 */
export async function getBlockchainBalanceAuto(address: string): Promise<number> {
  console.log('💳 Auto-Balance: Getting balance for', address)
  const contract = getContract()
  const balance = await contract.balanceOf(address)
  const balanceNumber = Number(formatUnits(balance, 0)) // 0 decimals
  console.log('✅ Auto-Balance: Balance is', balanceNumber)
  return balanceNumber
}

/**
 * Burn credits from an address (owner only)
 * AUTO-CONFIRMS - No MetaMask popup!
 */
export async function burnCreditsOnChainAuto(
  fromAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number }> {
  console.log('🔥 Auto-Burn: Burning', amount, 'credits from', fromAddress)

  const contract = getContract()
  const amountBN = parseUnits(amount.toString(), 0)

  const tx = await contract.burn(fromAddress, amountBN)
  console.log('✅ Auto-Burn: Transaction sent:', tx.hash)

  const receipt = await tx.wait()
  console.log('✅ Auto-Burn: Confirmed in block', receipt.blockNumber)

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  }
}

/**
 * Transfer credits to another address
 * AUTO-CONFIRMS - No MetaMask popup!
 */
export async function transferCreditsOnChainAuto(
  toAddress: string,
  amount: number
): Promise<{ txHash: string; blockNumber: number }> {
  console.log('💸 Auto-Transfer: Transferring', amount, 'credits to', toAddress)

  const contract = getContract()
  const amountBN = parseUnits(amount.toString(), 0)

  const tx = await contract.transfer(toAddress, amountBN)
  console.log('✅ Auto-Transfer: Transaction sent:', tx.hash)

  const receipt = await tx.wait()
  console.log('✅ Auto-Transfer: Confirmed in block', receipt.blockNumber)

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  }
}
