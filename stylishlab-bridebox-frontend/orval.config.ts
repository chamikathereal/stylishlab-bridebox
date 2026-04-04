import { defineConfig } from 'orval';

export default defineConfig({
  bridebox: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',
    },
    output: {
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: 'src/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
