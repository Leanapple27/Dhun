import { PipedInstance } from '../types';

export const defaultPipedInstances: PipedInstance[] = [
  { url: 'https://api.piped.private.coffee', region: 'Europe', priority: 1, active: true },
  { url: 'https://piped.video', region: 'Global', priority: 2, active: true },
  { url: 'https://pipedapi.kavin.rocks', region: 'Global', priority: 3, active: true },
  { url: 'https://pipedapi.in.projectsegfau.lt', region: 'India', priority: 4, active: true },
  { url: 'https://pipedapi.adminforge.de', region: 'Europe', priority: 5, active: true },
  { url: 'https://pipedapi.leptons.xyz', region: 'Global', priority: 6, active: true }
];
