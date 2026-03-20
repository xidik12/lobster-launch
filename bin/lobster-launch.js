#!/usr/bin/env node

import { main } from '../src/index.js';

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
