/**
 * Batch Generation Runner
 * 
 * Manages the execution of multiple batches with:
 * - Progress tracking
 * - Resume capability
 * - Cost estimation
 * - Time estimation
 * 
 * @module scripts/question-generation/run-batch-generation
 */

import * as fs from 'fs'
import * as path from 'path'
import { BATCH_CONFIGS, BatchConfig, BATCH_STATS } from './batch-config.js'
import { generateBatch } from './generate-questions.js'

interface GenerationProgress {
  lastUpdated: string
  completedBatches: number[]
  failedBatches: { batch: number; error: string }[]
  totalQuestionsGenerated: number
  estimatedCostUSD: number
  startTime: string
  endTime?: string
}

const PROGRESS_FILE = 'scripts/question-generation/generation-progress.json'
const COST_PER_1K_INPUT_TOKENS = 0.003   // Sonnet 4.5
const COST_PER_1K_OUTPUT_TOKENS = 0.015  // Sonnet 4.5
const AVG_INPUT_TOKENS_PER_BATCH = 2000
const AVG_OUTPUT_TOKENS_PER_BATCH = 50000  // ~25 questions × 5 calls × 400 tokens each

/**
 * Load progress from file
 */
function loadProgress(): GenerationProgress {
  const filePath = path.join(process.cwd(), PROGRESS_FILE)
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
  return {
    lastUpdated: new Date().toISOString(),
    completedBatches: [],
    failedBatches: [],
    totalQuestionsGenerated: 0,
    estimatedCostUSD: 0,
    startTime: new Date().toISOString()
  }
}

/**
 * Save progress to file
 */
function saveProgress(progress: GenerationProgress): void {
  const filePath = path.join(process.cwd(), PROGRESS_FILE)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, JSON.stringify(progress, null, 2))
}

/**
 * Calculate cost for a batch
 */
function calculateBatchCost(batch: BatchConfig): number {
  const apiCalls = Math.ceil(batch.questionsPerBatch / 25)
  const inputCost = (AVG_INPUT_TOKENS_PER_BATCH * apiCalls / 1000) * COST_PER_1K_INPUT_TOKENS
  const outputCost = (AVG_OUTPUT_TOKENS_PER_BATCH / 1000) * COST_PER_1K_OUTPUT_TOKENS
  return inputCost + outputCost
}

/**
 * Print summary statistics
 */
function printSummary(progress: GenerationProgress): void {
  const remaining = BATCH_CONFIGS.length - progress.completedBatches.length
  const remainingQuestions = BATCH_CONFIGS
    .filter(b => !progress.completedBatches.includes(b.batchNumber))
    .reduce((sum, b) => sum + b.questionsPerBatch, 0)
  
  const estimatedRemainingCost = BATCH_CONFIGS
    .filter(b => !progress.completedBatches.includes(b.batchNumber))
    .reduce((sum, b) => sum + calculateBatchCost(b), 0)
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    GENERATION PROGRESS SUMMARY                  ║
╠════════════════════════════════════════════════════════════════╣
║  Total Batches:        ${String(BATCH_STATS.totalBatches).padStart(3)} batches                            ║
║  Completed:            ${String(progress.completedBatches.length).padStart(3)} batches (${String(Math.round(progress.completedBatches.length / BATCH_STATS.totalBatches * 100)).padStart(2)}%)                       ║
║  Remaining:            ${String(remaining).padStart(3)} batches                            ║
║  Failed:               ${String(progress.failedBatches.length).padStart(3)} batches                            ║
╠════════════════════════════════════════════════════════════════╣
║  Questions Generated:  ${String(progress.totalQuestionsGenerated).padStart(6)} questions                     ║
║  Questions Remaining:  ${String(remainingQuestions).padStart(6)} questions                     ║
╠════════════════════════════════════════════════════════════════╣
║  Cost So Far:          $${progress.estimatedCostUSD.toFixed(2).padStart(6)}                               ║
║  Estimated Remaining:  $${estimatedRemainingCost.toFixed(2).padStart(6)}                               ║
║  Total Estimated:      $${(progress.estimatedCostUSD + estimatedRemainingCost).toFixed(2).padStart(6)}                               ║
╚════════════════════════════════════════════════════════════════╝
`)
}

/**
 * Run generation for specified batches
 */
async function runGeneration(
  startBatch: number,
  endBatch: number,
  options: { resume?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const progress = loadProgress()
  
  console.log('\n🚀 Y5/Y6 Question Generation Runner')
  console.log(`   Model: claude-sonnet-4-5-20250929`)
  console.log(`   Batches: ${startBatch} to ${endBatch}`)
  if (options.resume) {
    console.log(`   Mode: Resume (skipping completed batches)`)
  }
  if (options.dryRun) {
    console.log(`   Mode: DRY RUN (no API calls)`)
  }
  
  printSummary(progress)
  
  const batchesToRun = BATCH_CONFIGS
    .filter(b => b.batchNumber >= startBatch && b.batchNumber <= endBatch)
    .filter(b => !options.resume || !progress.completedBatches.includes(b.batchNumber))
  
  if (batchesToRun.length === 0) {
    console.log('\n✅ All specified batches already complete!')
    return
  }
  
  console.log(`\n📋 Batches to generate: ${batchesToRun.map(b => b.batchNumber).join(', ')}`)
  console.log(`   Total: ${batchesToRun.length} batches, ${batchesToRun.reduce((s, b) => s + b.questionsPerBatch, 0)} questions`)
  
  if (options.dryRun) {
    console.log('\n[DRY RUN] Would generate these batches. Exiting.')
    return
  }
  
  // Confirmation prompt
  console.log('\n⏳ Starting in 5 seconds... (Ctrl+C to cancel)')
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  // Run batches
  for (const batch of batchesToRun) {
    try {
      const startTime = Date.now()
      await generateBatch(batch)
      const duration = (Date.now() - startTime) / 1000
      
      // Update progress
      progress.completedBatches.push(batch.batchNumber)
      progress.totalQuestionsGenerated += batch.questionsPerBatch
      progress.estimatedCostUSD += calculateBatchCost(batch)
      progress.lastUpdated = new Date().toISOString()
      saveProgress(progress)
      
      console.log(`   ⏱️ Duration: ${duration.toFixed(1)}s`)
      
    } catch (error) {
      console.error(`\n❌ Batch ${batch.batchNumber} failed:`, error)
      progress.failedBatches.push({
        batch: batch.batchNumber,
        error: error instanceof Error ? error.message : String(error)
      })
      progress.lastUpdated = new Date().toISOString()
      saveProgress(progress)
      
      // Continue with next batch
      console.log('   Continuing with next batch...')
    }
  }
  
  // Final summary
  progress.endTime = new Date().toISOString()
  saveProgress(progress)
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 GENERATION RUN COMPLETE')
  printSummary(progress)
  
  if (progress.failedBatches.length > 0) {
    console.log('\n⚠️ Failed batches:')
    progress.failedBatches.forEach(f => {
      console.log(`   Batch ${f.batch}: ${f.error}`)
    })
  }
}

/**
 * CLI interface
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Y5/Y6 Question Generation Runner
=================================

Usage:
  npx ts-node scripts/question-generation/run-batch-generation.ts <command> [options]

Commands:
  status                    Show current progress
  run <start> <end>         Run batches from start to end
  run <batch>               Run a single batch
  resume <start> <end>      Resume from where we left off
  estimate                  Show cost/time estimates
  reset                     Reset progress (careful!)

Options:
  --dry-run                 Show what would be generated without API calls
  --help                    Show this help

Examples:
  npx ts-node scripts/question-generation/run-batch-generation.ts status
  npx ts-node scripts/question-generation/run-batch-generation.ts run 47
  npx ts-node scripts/question-generation/run-batch-generation.ts run 46 51
  npx ts-node scripts/question-generation/run-batch-generation.ts resume 1 99
  npx ts-node scripts/question-generation/run-batch-generation.ts run 1 99 --dry-run
`)
    return
  }
  
  const command = args[0]
  const dryRun = args.includes('--dry-run')
  
  switch (command) {
    case 'status': {
      const progress = loadProgress()
      printSummary(progress)
      break
    }
    
    case 'run': {
      if (args.length < 2) {
        console.error('❌ Please specify batch number(s)')
        process.exit(1)
      }
      const start = parseInt(args[1])
      const end = args[2] ? parseInt(args[2]) : start
      await runGeneration(start, end, { dryRun })
      break
    }
    
    case 'resume': {
      const start = args[1] ? parseInt(args[1]) : 1
      const end = args[2] ? parseInt(args[2]) : 99
      await runGeneration(start, end, { resume: true, dryRun })
      break
    }
    
    case 'estimate': {
      const progress = loadProgress()
      const totalCost = BATCH_CONFIGS.reduce((sum, b) => sum + calculateBatchCost(b), 0)
      const avgTimePerBatch = 3 // minutes
      const totalTime = BATCH_STATS.totalBatches * avgTimePerBatch
      
      console.log(`
📊 COST & TIME ESTIMATES
========================

Total Batches:    ${BATCH_STATS.totalBatches}
Total Questions:  ${BATCH_STATS.totalQuestions.toLocaleString()}

Estimated Costs:
  Input tokens:   ~${(AVG_INPUT_TOKENS_PER_BATCH * BATCH_STATS.totalBatches * 5 / 1000).toFixed(0)}K tokens × $3/MTok
  Output tokens:  ~${(AVG_OUTPUT_TOKENS_PER_BATCH * BATCH_STATS.totalBatches / 1000).toFixed(0)}K tokens × $15/MTok
  Total:          ~$${totalCost.toFixed(2)}

Estimated Time:
  Per batch:      ~${avgTimePerBatch} minutes
  Total:          ~${(totalTime / 60).toFixed(1)} hours

Already spent:    $${progress.estimatedCostUSD.toFixed(2)}
Remaining:        $${(totalCost - progress.estimatedCostUSD).toFixed(2)}
`)
      break
    }
    
    case 'reset': {
      const filePath = path.join(process.cwd(), PROGRESS_FILE)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('✅ Progress reset')
      } else {
        console.log('No progress file to reset')
      }
      break
    }
    
    default:
      console.error(`❌ Unknown command: ${command}`)
      process.exit(1)
  }
}

main().catch(console.error)
