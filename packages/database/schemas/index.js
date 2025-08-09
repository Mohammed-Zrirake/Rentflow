// This file makes your schemas available at runtime for Node.js.
// It uses CommonJS 'require' syntax.
const agency = require('agency.ts');

module.exports = {
  ...agency,
};

// This file is a placeholder. 
// The real magic happens because our NestJS tsconfig.json path mapping
// will resolve '@rentflow/database/schemas' to the correct TypeScript source folder.
// However, creating this file can help some module resolvers.
module.exports = {};