module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/marketplace',
        'http://localhost:4173/instructors',
        'http://localhost:4173/gear-guide',
        'http://localhost:4173/instructor-guide',
        'http://localhost:4173/contact',
        'http://localhost:4173/signup'
      ],
      startServerCommand: 'npm run preview',
      numberOfRuns: 1 // for faster testing during development
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci-reports'
    }
  }
};
