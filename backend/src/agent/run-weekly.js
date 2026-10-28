import { loadEnvFile } from '../loadEnv.js';

loadEnvFile();

import { autoPublishPosts } from '../services/posts.service.js';
import { notifySearchEngines } from '../services/sitemap.js';
import { closeMongo } from '../db/mongo.js';
import { config } from '../config.js';

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const CATEGORY = process.env.CONTENT_CATEGORY || null;

async function main() {
  console.log(`[agent] weekly deep dive start${DRY_RUN ? ' (DRY RUN)' : ''}`);
  const result = await autoPublishPosts({ count: 1, category: CATEGORY, dryRun: DRY_RUN, deep: true });
  console.log(`[agent] done — published ${result.published}, drafted ${result.drafted}`);
  for (const item of result.results) {
    if (item.ok) {
      console.log(`  • ${item.post?.title?.rendered || item.post?.title} -> /${item.post?.slug}`);
    } else if (item.title) {
      console.log(`  • skipped ${item.title}: ${item.reasons?.join(', ') || item.reason || 'unknown'}`);
    }
  }

  if (!DRY_RUN && result.published > 0) {
    const postUrls = result.results
      .filter((item) => item.ok && item.post?.slug)
      .map((item) => `${config.siteBaseUrl}/${item.post.slug}`);
    await notifySearchEngines(postUrls);
  }

  if (result.published === 0 && result.drafted === 0) {
    console.warn('[agent] WARNING: no posts published — will retry on next schedule');
  }
}

main()
  .catch((error) => {
    console.error('[agent] FAILED:', error.message);
    process.exitCode = 1;
  })
  .finally(() => closeMongo());
